import { PlusCircle, Inbox } from "lucide-react"
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { TestResultTable } from "./components/TestResultTable";
import { getAllTests } from "@/actions/test/get-all-tests";
import { FilterInput, PaginationControls } from "./components/testClientComponents";
import { Suspense } from "react";

// Componente de carregamento para a tabela
function TableSkeleton() {
  return <div className="rounded-lg border w-full h-64 bg-muted animate-pulse" />;
}

export default async function TestsPage({ 
  searchParams 
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const limit = 10; // Itens por página

  const { tests, totalCount } = await getAllTests({ query, page: currentPage, limit });
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6 p-4 md:p-10">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Testes</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie os testes estáticos registrados.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
          <Button asChild className="w-full md:w-auto">
            <Link href="/testes/novo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Novo Teste
            </Link>
          </Button>
        </div>
      </header>
      
      <main className="space-y-4">
        <div className="w-full max-w-sm">
          <FilterInput />
        </div>

        {totalCount > 0 ? (
          <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
            <TestResultTable items={tests} />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
            /> 
          </Suspense>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">Nenhum teste encontrado</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {query 
                ? "Nenhum resultado corresponde à sua busca."
                : "Comece registrando um novo teste para visualizar os dados aqui."
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
}