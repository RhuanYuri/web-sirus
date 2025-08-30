"use server"

import { db } from "@/db"
import { test } from "@/db/schema"
import { auth } from "@/lib/auth"
import { and, count, desc, eq, ilike, or } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

interface GetAllTestsParams {
  page?: number
  limit?: number
  query?: string
}

export async function getAllTests({
  page = 1,
  limit = 10,
  query = "",
}: GetAllTestsParams) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    redirect('/login')
  }

  const offset = (page - 1) * limit

  // Condição base: testes do usuário ou testes públicos
  const baseWhere = or(eq(test.userId, session.user.id), eq(test.isPublic, true))

  // Condição de busca: filtra pelo nome do teste (case-insensitive)
  const queryWhere = query ? ilike(test.name, `%${query}%`) : undefined

  // Combina as condições
  const whereClause = and(baseWhere, queryWhere)

  // Busca os testes com paginação, filtro e ordenação
  const tests = await db.query.test.findMany({
    where: whereClause,
    orderBy: [desc(test.createdAt)], // Ordena pelos mais recentes
    limit: limit,
    offset: offset,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Busca a contagem total de itens que correspondem ao filtro
  const totalResult = await db
    .select({ count: count() })
    .from(test)
    .where(whereClause)
  
  const totalCount = totalResult[0]?.count ?? 0

  return { tests, totalCount }
}