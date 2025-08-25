import { PlusCircle, Inbox } from "lucide-react"

import { Button } from "@/components/ui/button"
// import Link from "next/link"; // Removido para compatibilidade, usando <a>
// import { getPaginatedTests } from "@/lib/data/tests"; // Função hipotética para buscar dados
// import { PaginationControls } from "./components/TestClientComponents"; // Componente hipotético
import { TestResultTable } from "./components/TestResultTable";
import { getAllTests } from "@/actions/test/get-all-tests";




export default async function TestsPage({ searchParams }: any) {
  const { tests } = await getAllTests();

  if(!tests || tests === null) {
    return <div className="p-4">Nenhum teste encontrado. Registre um novo teste para visualizar os dados aqui.</div>
  }
  

  return (
    <div className="space-y-6 p-4 md:p-10">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Testes</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie os testes estáticos registrados.
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <a href="/testes/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Novo Teste
          </a>
        </Button>
      </header>
      
      <main className="space-y-4">
        {tests.length > 0 ? (
          <>
            <TestResultTable items={tests} />
            {/* <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
            /> 
            */}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">Nenhum teste encontrado</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Comece registrando um novo teste para visualizar os dados aqui.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}