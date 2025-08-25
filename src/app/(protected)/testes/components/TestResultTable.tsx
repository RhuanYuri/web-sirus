import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Tipo para os dados que a tabela espera
type TestItem = {
  id: string;
  name: string;
  date: Date;
  isSuccess: boolean;
  user: {
    name: string | null;
  };
};

interface TestResultTableProps {
  items: TestItem[];
}

export function TestResultTable({ items }: TestResultTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Título do Teste</TableHead>
            <TableHead>Supervisor</TableHead>
            <TableHead className="text-right">Data de Realização</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((test) => (
            <TableRow key={test.id}>
              <TableCell>
                <Badge variant={test.isSuccess ? "default" : "destructive"}>
                  {test.isSuccess ? "Sucesso" : "Falha"}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{test.name}</TableCell>
              <TableCell>{test.user?.name ?? "Não atribuído"}</TableCell>
              <TableCell className="text-right">
                {new Date(test.date).toLocaleDateString("pt-BR", {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <a href={`/testes/${test.id}`}>Ver detalhes</a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
