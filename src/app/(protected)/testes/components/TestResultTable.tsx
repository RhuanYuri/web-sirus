'use client'; // 1. Componente agora é do lado do cliente

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2 } from "lucide-react"; // Ícone de lixeira
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteTest } from "@/actions/test/delete";
import Link from "next/link";

// Tipo para os dados que a tabela espera
type TestItem = {
  id: string;
  name: string;
  createdAt: Date; // Usando createdAt para consistência com o schema
  isPublic: boolean; // Supondo que o status possa ser derivado de algum campo
  user: {
    name: string | null;
  };
};

interface TestResultTableProps {
  items: TestItem[];
}

export function TestResultTable({ items }: TestResultTableProps) {
  // 2. Estados para controlar o diálogo e a transição
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 3. Função para lidar com a exclusão
  const handleDelete = () => {
    if (!selectedTestId) return;

    startTransition(async () => {
      const result = await deleteTest(selectedTestId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setIsAlertOpen(false);
      setSelectedTestId(null);
    });
  };

  const openConfirmationDialog = (testId: string) => {
    setSelectedTestId(testId);
    setIsAlertOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título do Teste</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Visibilidade</TableHead>
              <TableHead className="text-right">Data de Criação</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((test) => (
              <TableRow key={test.id}>
                <TableCell className="font-medium">{test.name}</TableCell>
                <TableCell>{test.user?.name ?? "Não atribuído"}</TableCell>
                <TableCell>
                  <Badge variant={test.isPublic ? "outline" : "secondary"}>
                    {test.isPublic ? "Público" : "Privado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {new Date(test.createdAt).toLocaleDateString("pt-BR", {
                    day: '2-digit',
                    month: 'short',
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
                      <DropdownMenuItem asChild>
                        <Link href={`/testes/${test.id}`}>Ver detalhes</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onSelect={() => openConfirmationDialog(test.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 4. Diálogo de confirmação de exclusão */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              teste e todos os seus dados dos nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Excluindo..." : "Sim, excluir teste"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}