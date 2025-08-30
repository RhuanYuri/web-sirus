"use server"

import { db } from "@/db"
import { test } from "@/db/schema"
import { auth } from "@/lib/auth"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

export async function deleteTest(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session?.user) {
      throw new Error("Não autorizado")
    }

    // Busca o teste para garantir que ele pertence ao usuário logado
    const existingTest = await db.query.test.findFirst({
      where: and(eq(test.id, id), eq(test.userId, session.user.id)),
    })

    if (!existingTest) {
      return { success: false, message: "Teste não encontrado ou você não tem permissão para excluí-lo." }
    }

    // Deleta o teste do banco de dados
    await db.delete(test).where(eq(test.id, id))

    // Invalida o cache da página de testes para que ela seja recarregada com os novos dados
    revalidatePath("/testes")

    return { success: true, message: "Teste excluído com sucesso." }
  } catch (error) {
    console.error("Erro ao deletar teste:", error)
    return { success: false, message: "Ocorreu um erro no servidor." }
  }
}