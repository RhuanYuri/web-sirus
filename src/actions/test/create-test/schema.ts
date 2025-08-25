import { z } from 'zod';

export const TestResultSchema = z.object({
  // Garante que o tempo pode ser um número decimal
  second: z.number().nonnegative('O tempo não pode ser negativo.'),
  force: z.number(),
});

export const CreateTestSchema = z.object({
  name: z.string().min(3, "O nome precisa ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  date: z.date("A data do teste é obrigatória."),
  isSuccess: z.boolean(),
  results: z.array(TestResultSchema).min(1, "É necessário carregar um arquivo com dados de resultado."),
});