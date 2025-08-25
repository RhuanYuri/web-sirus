// /lib/data/games.ts

import { db } from "@/db";
import { games } from "@/db/schema";
import { and, eq, desc, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

// --- Tipos ---
export type GameListItem = {
  id: string;
  createdAt: Date;
  status: "pending" | "finished" | "canceled";
  combination: {
    numbers: number[];
  };
  draw: {
    contest: number;
    lottery: string;
  } | null;
  hitNumbers: number[];
};

export type PaginatedGamesResult = {
  games: GameListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

export type GameDetails = {
  id: string;
  createdAt: Date;
  status: "pending" | "finished" | "canceled";
  draw: {
    id: string;
    contest: number;
    lottery: string;
    numbers: number[];
  } | null;
  combination: {
    id: string;
    numbers: number[];
  };
  hitNumbers: number[];
};

const ITEMS_PER_PAGE = 10;

// --- Funções de Busca ---

export async function getPaginatedGames(
  { currentPage }: { currentPage: number }
): Promise<PaginatedGamesResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { games: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
  const userId = session.user.id;

  const whereCondition = eq(games.userId, userId);

  const totalResult = await db.select({ value: count() }).from(games).where(whereCondition);
  const totalCount = totalResult[0].value;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const gameList = await db.query.games.findMany({
    where: whereCondition,
    orderBy: [desc(games.createdAt)],
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    with: {
      draw: {
        columns: { contest: true, lottery: true },
      },
      combination: {
        with: {
          numbers: { columns: { number: true } },
        },
      },
      hits: {
        with: {
          numbers: { columns: { number: true } },
        },
      },
    },
  });

  const formattedGames = gameList.map(game => ({
    id: game.id,
    createdAt: game.createdAt,
    status: game.status,
    draw: game.draw,
    combination: {
      numbers: game.combination.numbers.map(n => n.number).sort((a, b) => a - b)
    },
    hitNumbers: game.hits?.numbers.map(n => n.number) || [],
  }));

  return {
    games: formattedGames,
    totalCount,
    totalPages,
    currentPage,
  };
}

export async function getGameDetailsById(id: string): Promise<GameDetails> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) notFound();
  const userId = session.user.id;

  const game = await db.query.games.findFirst({
    where: and(eq(games.id, id), eq(games.userId, userId)),
    with: {
      draw: {
        with: {
          drawnNumbers: { columns: { number: true } },
        },
      },
      combination: {
        with: {
          numbers: { columns: { number: true } },
        },
      },
      hits: {
        with: {
          numbers: { columns: { number: true } },
        },
      },
    },
  });

  if (!game) notFound();

  return {
    id: game.id,
    createdAt: game.createdAt,
    status: game.status,
    draw: game.draw ? {
      id: game.draw.id,
      contest: game.draw.contest,
      lottery: game.draw.lottery,
      numbers: game.draw.drawnNumbers.map(n => n.number).sort((a, b) => a - b),
    } : null,
    combination: {
      id: game.combination.id,
      numbers: game.combination.numbers.map(n => n.number).sort((a, b) => a - b),
    },
    hitNumbers: game.hits?.numbers.map(n => n.number) || [],
  };
}
