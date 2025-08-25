import { ArrowLeft, CheckCircle, Upload, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestResultChart } from "@/components/chart-area-interactive";
import { getTest } from "@/actions/test/get-test";
import { redirect } from "next/navigation";
import { TestSettingsCard } from "./components/TestSettingsCard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function TestDetailPage({ params }: { params: { id: string } }) {
  const { test } = await getTest({ id: params.id });
  if (!test || test === null) {
    redirect("/testes");
  }

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Define uma variável para a condição, o que torna o código mais limpo
  const showSettingsCard = session?.user.id === test.userId;

  return (
    <div className="space-y-6 p-4 md:p-10">
      {/* Cabeçalho da Página */}
      <header className="space-y-4">
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/testes"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Listagem</Link>
        </Button>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{test.name}</h1>
            <p className="text-muted-foreground">
              Realizado em {new Date(test.date).toLocaleDateString("pt-BR", { dateStyle: 'long' })} por <strong>{test.user.name}</strong>
            </p>
          </div>
          <Badge variant={test.isSuccess ? "default" : "destructive"} className="text-base gap-2">
            {test.isSuccess ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {test.isSuccess ? "Sucesso" : "Falha"}
          </Badge>
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href={`./${params.id}/video`}><Upload className="mr-2 h-4 w-4" /> Upload de arquivo</Link>
          </Button>
        </div>
      </header>

      {/* Conteúdo Principal com Layout Adaptável */}
      <main className={`grid grid-cols-1 gap-6 ${showSettingsCard ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        <div className={`${showSettingsCard ? 'lg:col-span-2' : ''} space-y-6`}>
          <TestResultChart testData={test} />
          <Card>
            <CardHeader><CardTitle>Descrição do Teste</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{test.description}</p></CardContent>
          </Card>
        </div>
        
        {/* Renderiza o card de configurações apenas se a condição for verdadeira */}
        {showSettingsCard && (
          <div className="lg:col-span-1 space-y-6">
            <TestSettingsCard
              testId={test.id}
              isPublic={test.isPublic}
              isSuccess={test.isSuccess}
            />
          </div>
        )}
      </main>
    </div>
  );
}