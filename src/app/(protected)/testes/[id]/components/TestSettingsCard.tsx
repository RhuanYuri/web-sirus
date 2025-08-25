"use client";

import { useRouter } from "next/navigation"; // NOVO: Importa o hook para atualizar a página
import { changeStatusPublic } from "@/actions/test/change-status-public";
import { changeTestStatus } from "@/actions/test/change-status-test";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Usando Switch da UI
import { Settings, Globe, Lock, CheckCircle, XCircle } from "lucide-react"; // NOVOS: Ícones para o status
import { useState } from "react";
import { toast } from "sonner";

interface TestSettingsCardProps {
  testId: string;
  isPublic: boolean;
  isSuccess: boolean;
}

export function TestSettingsCard({
  testId,
  isPublic: initialIsPublic,
  isSuccess: initialIsSuccess,
}: TestSettingsCardProps) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isSuccess, setIsSuccess] = useState(initialIsSuccess); // NOVO: Estado para o status de sucesso

  const handleToggleVisibility = async (checked: boolean) => {
    setIsPublic(checked); // Atualização otimista
    const result = await changeStatusPublic({ id: testId, isPublic: checked });

    if (!result) {
      toast.error("Não foi possível alterar a visibilidade do teste.");
      setIsPublic(!checked); // Reverte o estado
      return;
    }

    toast.success("Visibilidade do teste atualizada com sucesso.");
    router.refresh(); // Atualiza a página para refletir a mudança
  };

  const handleToggleSuccess = async (checked: boolean) => {
    setIsSuccess(checked); // NOVO: Atualização otimista do estado de sucesso
    const result = await changeTestStatus({ id: testId, isSuccess: checked });

    if (!result) {
      toast.error("Não foi possível alterar o status do teste.");
      setIsSuccess(!checked); // NOVO: Reverte o estado de sucesso
      return;
    }

    toast.success("Status do teste atualizado com sucesso.");
    router.refresh(); // NOVO: Atualiza a página para refletir a mudança no badge principal
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Configurações</CardTitle>
        <CardDescription>Gerencie a visibilidade e o resultado do teste.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Switch para Visibilidade */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="visibility-switch" className="flex items-center gap-2">
              {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              Visibilidade
            </Label>
            <p className="text-xs text-muted-foreground">
              {isPublic ? "Qualquer um pode ver." : "Apenas membros da equipe."}
            </p>
          </div>
          <Switch
            id="visibility-switch"
            checked={isPublic}
            onCheckedChange={handleToggleVisibility}
          />
        </div>

        {/* NOVO: Switch para o Status de Sucesso */}
        <div className="mt-4 flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="success-switch" className="flex items-center gap-2">
              {isSuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              Resultado
            </Label>
            <p className="text-xs text-muted-foreground">
              {isSuccess ? "O teste foi um sucesso." : "O teste falhou."}
            </p>
          </div>
          <Switch
            id="success-switch"
            checked={isSuccess}
            onCheckedChange={handleToggleSuccess}
          />
        </div>
      </CardContent>
    </Card>
  );
}