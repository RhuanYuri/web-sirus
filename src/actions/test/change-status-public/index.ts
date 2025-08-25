"use server"

import { db } from "@/db";
import { test } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";


export async function changeStatusPublic({ id, isPublic }: { id: string; isPublic: boolean }) {
  if (!id) {
    throw new Error("ID do teste é obrigatório");
  } if (typeof isPublic !== "boolean") {
    throw new Error("O status de sucesso do teste deve ser um valor booleano");
  }
  const session = await auth.api.getSession({
    headers: await headers()
  }) 
  if(!session?.user) {
    throw new Error("Usuário não autenticado");
  }
  const userId = session.user.id;
  const result = await db.query.test.findFirst({
    where: and(eq(test.id, id), eq(test.userId, userId))
  })
  if(!result) {
    throw new Error("não tem permissão para alterá-lo");
  }
  const updatedTest = await db.update(test)
    .set({ isPublic })
    .where(eq(test.id, id))
    .returning();

  if (updatedTest.length === 0) {
    throw new Error("Teste não encontrado ou não foi possível atualizar o status");
  }

  return updatedTest[0];
}