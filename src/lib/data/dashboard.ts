// /lib/data/dashboard.ts

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { games, draws } from "@/db/schema";

// --- Tipos de Dados ---
export type LatestGame = {
  id: string;
  combination: {
    numbers: string[];
  };
  draw: {
    lottery: string;
    contest: number;
    numbers: string[];
  };
  hitNumbers: string[];
} | null;

export type PastDraw = {
  id: string;
  lottery: string;
  date: string;
  numbers: string[];
};

export type DashboardData = {
  latestGame: LatestGame;
  pastDraws: PastDraw[];
};

// --- Função Principal de Busca ---
export async function getDashboardData(): Promise<DashboardData> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  // 1. Buscar o último jogo do usuário logado
  let latestGame: LatestGame = null;
  if (userId) {
    const game = await db.query.games.findFirst({
      where: eq(games.userId, userId),
      orderBy: [desc(games.createdAt)],
      with: {
        combination: {
          with: { numbers: { columns: { number: true }, orderBy: (n, { asc }) => [asc(n.number)] } }
        },
        draw: {
          with: { drawnNumbers: { columns: { number: true }, orderBy: (n, { asc }) => [asc(n.number)] } }
        },
        hits: {
          with: { numbers: { columns: { number: true } } }
        }
      }
    });

    if (game && game.draw) { // Garante que o jogo e o sorteio vinculado existam
      latestGame = {
        id: game.id,
        combination: {
          numbers: game.combination.numbers.map(n => n.number.toString().padStart(2, '0'))
        },
        draw: {
          lottery: game.draw.lottery,
          contest: game.draw.contest,
          numbers: game.draw.drawnNumbers.map(n => n.number.toString().padStart(2, '0'))
        },
        hitNumbers: game.hits?.numbers.map(n => n.number.toString().padStart(2, '0')) || []
      };
    }
  }

  // 2. Buscar os 5 últimos sorteios de qualquer loteria
  const recentDraws = await db.query.draws.findMany({
    orderBy: [desc(draws.drawDate), desc(draws.contest)],
    limit: 5,
    with: {
      drawnNumbers: {
        columns: { number: true },
        orderBy: (numbers, { asc }) => [asc(numbers.number)],
      },
    },
  });

  // 3. Formatar os dados para a UI
  const formattedPastDraws: PastDraw[] = recentDraws.map(draw => ({
    id: draw.id,
    lottery: draw.lottery.charAt(0).toUpperCase() + draw.lottery.slice(1),
    // CORREÇÃO: Adiciona uma verificação para garantir que draw.drawDate não é nulo
    date: draw.drawDate ? new Date(draw.drawDate).toLocaleDateString('pt-BR') : '',
    numbers: draw.drawnNumbers.map(n => n.number.toString().padStart(2, '0')),
  }));

  return {
    latestGame,
    pastDraws: formattedPastDraws,
  };
}
