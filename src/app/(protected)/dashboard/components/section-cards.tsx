import {
  Plus,
  Rocket,
  TrendingUp,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { test } from "@/db/schema"
import Link from "next/link"

interface SectionCardsProps {
  tests: typeof test.$inferSelect[]
}

export function SectionCards({ tests }: SectionCardsProps) {
  const sortedTests = tests.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastTest = sortedTests.length > 0 ? sortedTests[0] : null;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const testsThisMonth = tests.filter((test) => {
    const testDate = new Date(test.date);
    return (
      testDate.getMonth() === currentMonth && testDate.getFullYear() === currentYear
    );
  });

  const successfulTestsThisMonth = testsThisMonth.filter(
    (test) => test.isSuccess,
  ).length;
  const failedTestsThisMonth = testsThisMonth.length - successfulTestsThisMonth;


  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      <Card>
        <CardHeader>
          <CardDescription>Total de Testes</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {tests.length}
          </CardTitle>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/testes/novo">
              <Plus className="mr-2 h-4 w-4" /> Cadastrar novo teste
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Último Teste Realizado</CardDescription>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold truncate">
            <Rocket className="h-6 w-6 text-primary" />
            {lastTest ? lastTest.name : "Nenhum teste"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          {lastTest
            ? `Realizado em: ${new Date(lastTest.date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}`
            : "Ainda não há registros de testes."}
        </CardFooter>
      </Card>

      {/* Card 3: Testes Bem-Sucedidos (Mês) */}
      <Card>
        <CardHeader>
          <CardDescription>Bem-Sucedidos (Mês)</CardDescription>
          <CardTitle className="text-3xl font-bold text-green-500">
            {successfulTestsThisMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Desempenho positivo no mês.</span>
          </div>
        </CardFooter>
      </Card>

      {/* Card 4: Testes Mal-Sucedidos (Mês) */}
      <Card>
        <CardHeader>
          <CardDescription>Mal-Sucedidos (Mês)</CardDescription>
          <CardTitle className="text-3xl font-bold text-red-500">
            {failedTestsThisMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <X className="h-4 w-4 text-red-500" />
            <span>Falhas registradas no mês.</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
