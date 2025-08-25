// /lib/data/draws.ts

import { db } from "@/db";
import { draws } from "@/db/schema";
import { and, eq, gte, lte, desc, count, SQL, or } from "drizzle-orm";

// Este tipo pode ser compartilhado se for idêntico ao de combinações
export type DrawWithNumbers = {
  id: string;
  createdAt: Date | null;
  lottery: string; // Adicionado para exibir na UI se necessário
  numbers: number[];
  contest: number; // Adicionado para exibir na UI se necessário
};

export type PaginatedDrawsResult = {
  draws: DrawWithNumbers[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

const ITEMS_PER_PAGE = 10;

// Função para buscar os nomes únicos de loterias
export async function getUniqueLotteryNames(): Promise<string[]> {
  // Usamos selectDistinct para obter apenas valores únicos da coluna 'lottery'
  const results = await db
    .selectDistinct({ lottery: draws.lottery })
    .from(draws)
    .orderBy(draws.lottery); // Ordena alfabeticamente

  // Extrai apenas a string do nome da loteria do objeto retornado
  return results.map(r => r.lottery);
}


export async function getPaginatedDraws(
  { currentPage, startDate, endDate, lottery }: {
    currentPage: number;
    startDate: Date;
    endDate: Date;
    lottery?: string; // Parâmetro opcional para o filtro
  }
): Promise<PaginatedDrawsResult> {
  // Construção dinâmica da cláusula 'where'
  const whereConditions: SQL[] = [
    gte(draws.drawDate, startDate),
    lte(draws.drawDate, endDate),
  ];

  // Adiciona o filtro de loteria apenas se ele for fornecido
  if (lottery) {
    whereConditions.push(eq(draws.lottery, lottery));
  }

  // 1. Contar o total de registros com os filtros aplicados
  const totalResult = await db
    .select({ value: count() })
    .from(draws)
    .where(and(...whereConditions));
  
  const totalCount = totalResult[0].value;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // 2. Buscar os dados para a página atual com os mesmos filtros
  const mainDraws = await db.query.draws.findMany({
    where: and(...whereConditions),
    orderBy: [desc(draws.createdAt)],
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    with: {
      drawnNumbers: {
        columns: {
          number: true,
        },
      },
    },
  });

  // 3. Formatar os dados
  const formattedDraws = mainDraws.map(draw => ({
    id: draw.id,
    createdAt: draw.drawDate,
    lottery: draw.lottery,
    numbers: draw.drawnNumbers.map(n => n.number).sort((a, b) => a - b),
    contest: draw.contest,
  }));

  return {
    draws: formattedDraws,
    totalCount,
    totalPages,
    currentPage,
  };
}


export async function getDrawsForSelect() {
  // AJUSTE: Lógica de data e filtro de loteria atualizados conforme solicitado.
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const availableDraws = await db.query.draws.findMany({
    where: and(
      gte(draws.drawDate, sevenDaysAgo),
      lte(draws.drawDate, sevenDaysFromNow),
      or(
        eq(draws.lottery, "megasena"),
        eq(draws.lottery, "lotofacil")
      )
    ),
    orderBy: [desc(draws.contest)],
  });

  return availableDraws;
}