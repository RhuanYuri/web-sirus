// /app/page.tsx

import { getDashboardData } from "@/lib/data/dashboard";
import { SectionCards } from "./components/section-cards";
import { TestResultChart } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";

import data from "./data.json";
import { getAllTests } from "@/actions/test/get-all-tests";
import { nullable } from "zod";

export default async function Page() {
  const { tests } = await getAllTests()
  if(!tests || tests === null) {
    return <div className="p-4">Nenhum teste encontrado. Registre um novo teste para visualizar os dados aqui.</div>
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards tests={tests} />
          <div className="px-4 lg:px-6">
            <TestResultChart testData={tests[0]} />
          </div>
          {/* <DataTable data={data} /> */}
        </div>
      </div>
    </div>
  );
}
