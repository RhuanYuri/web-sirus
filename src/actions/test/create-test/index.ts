"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

// import { db } from "@/db"; // Descomente quando tiver a conexão com o DB
// import { test, testResult } from "@/db/schema"; // Descomente quando tiver o schema do DB
import { CreateTestSchema } from "./schema";
import { db } from "@/db";
import { test, testResult } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Tipo para o estado de retorno da action
type ActionState = {
  success: boolean;
  errors?: z.ZodIssue[];
  message?: string;
};

// A server action que recebe os dados do formulário
export async function createTestAction(
  formData: FormData
): Promise<ActionState> {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if(!session?.user){
    redirect('/login')
  }

  // Converte os dados do FormData para um objeto
  const data = Object.fromEntries(formData.entries());
  
  // Simula a conversão de dados que não são string
  const rawData = {
    ...data,
    isSuccess: data.isSuccess === 'true',
    date: new Date(data.date as string),
    results: JSON.parse(data.results as string),
  };

  // 1. Valida os dados usando o schema do Zod
  const validatedFields = CreateTestSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Erro de validação:", validatedFields.error.issues);
    return {
      success: false,
      errors: validatedFields.error.issues,
      message: "Erro de validação. Verifique os campos.",
    };
  }

  const { name, description, date, isSuccess, results } = validatedFields.data;

  try {
    
    await db.transaction(async (tx) => {
      // 1. Insere o teste principal
      const [newTest] = await tx.insert(test).values({
        name,
        description,
        date,
        isSuccess,
        userId: session.user.id,
      }).returning({ id: test.id });

      // 2. Prepara os resultados com o ID do novo teste
      const resultsToInsert = results.map(result => ({
        testId: newTest.id,
        second: result.second.toString(),
        force: result.force.toString(), // Drizzle espera string para o tipo 'decimal'
      }));

      // 3. Insere os resultados
      await tx.insert(testResult).values(resultsToInsert);
    });
    
    // 2. Revalida o cache da página de listagem de testes
    revalidatePath("/testes");

    return { success: true, message: "Teste registrado com sucesso!" };

  } catch (error) {
    console.error("Erro no servidor:", error);
    return {
      success: false,
      message: "Ocorreu um erro no servidor. Não foi possível salvar o teste.",
    };
  }
}
