import { db } from "@/db";
import { auth } from "@/lib/auth";
import { combinations, combinationNumbers } from "@/db/schema";
import { and, eq, gte, lte, desc, count } from "drizzle-orm";
import { headers } from "next/headers";
import { calculateDaysWeek } from "@/helpers/calculateDaysWeek";

// Tipo para uma única combinação com seus números
export type CombinationWithNumbers = {
  id: string;
  createdAt: Date;
  numbers: number[];
};

// Tipo para o resultado paginado
export type PaginatedCombinationsResult = {
  combinations: CombinationWithNumbers[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

const ITEMS_PER_PAGE = 10; // Defina quantos itens por página

export async function getPaginatedCombinationsForUser(
  { currentPage, startDate, endDate }: { currentPage: number; startDate: Date; endDate: Date; }
): Promise<PaginatedCombinationsResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { combinations: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
  const userId = session.user.id;

  // 1. Contar o total de registros que correspondem ao filtro
  const totalResult = await db
    .select({ value: count() })
    .from(combinations)
    .where(
      and(
        eq(combinations.userId, userId),
        gte(combinations.createdAt, startDate),
        lte(combinations.createdAt, endDate)
      )
    );
  
  const totalCount = totalResult[0].value;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // 2. Buscar os dados para a página atual
  const mainCombinations = await db.query.combinations.findMany({
    where: and(
      eq(combinations.userId, userId),
      gte(combinations.createdAt, startDate),
      lte(combinations.createdAt, endDate)
    ),
    orderBy: [desc(combinations.createdAt)],
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    // Importante: Incluir os números diretamente na consulta
    with: {
      numbers: {
        columns: {
          number: true,
        },
      },
    },
  });

  // 3. Formatar os dados para o tipo de retorno esperado
  const formattedCombinations = mainCombinations.map(combo => ({
    id: combo.id,
    createdAt: combo.createdAt,
    numbers: combo.numbers.map(n => n.number).sort((a, b) => a - b),
  }));

  return {
    combinations: formattedCombinations,
    totalCount,
    totalPages,
    currentPage,
  };
}

export async function getUserCombinationsForSelect() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];
  
  const userCombinations = await db.query.combinations.findMany({
    where: (combinations, { eq }) => eq(combinations.userId, session.user!.id!),
    with: {
      numbers: {
        columns: { number: true },
        orderBy: (numbers, { asc }) => [asc(numbers.number)],
      },
    },
  });

  return userCombinations.map(c => ({
    id: c.id,
    numbers: c.numbers.map(n => n.number),
  }));
}
