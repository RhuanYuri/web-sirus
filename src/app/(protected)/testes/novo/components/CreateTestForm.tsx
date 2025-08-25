"use client"

import { useState, ChangeEvent, FormEvent, useTransition } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { createTestAction } from "@/actions/test/create-test"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type TestResultData = { second: number; force: number }

export function CreateTestForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | null>(new Date())
  const [isSuccess, setIsSuccess] = useState(false)
  const [results, setResults] = useState<TestResultData[]>([])
  const [fileName, setFileName] = useState("")
  const router = useRouter()
  
  // Substitui o useState de isSubmitting
  const [isPending, startTransition] = useTransition()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setFileName("")
      setResults([])
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return

      try {
        const lines = text.trim().split(/\r?\n/)
        const dataLines = lines.filter(line => line.trim() && !line.trim().startsWith('#'))

        if (dataLines.length === 0) throw new Error("Nenhum dado válido encontrado no arquivo.")

        const parsed: TestResultData[] = dataLines.map((line, index) => {
          const parts = line.trim().split(/\s+/)
          if (parts.length !== 2) throw new Error(`Formato inválido na linha ${index + 1}. Use: [tempo] [força]`)

          const second = parseFloat(parts[0])
          const force = parseFloat(parts[1])
          if (isNaN(second) || isNaN(force)) throw new Error(`Valor inválido na linha ${index + 1}.`)

          return { second, force }
        })

        setResults(parsed)
      } catch (err: any) {
        toast.error(err.message)
        setResults([])
      }
    }
    reader.readAsText(file)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!date) {
      toast.error("Selecione uma data para o teste.")
      return
    }
    if (results.length === 0) {
      toast.error("Carregue um arquivo de resultados válido.")
      return
    }

    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)
    formData.append("date", date.toISOString())
    formData.append("isSuccess", String(isSuccess))
    formData.append("results", JSON.stringify(results))

    // Envolve a chamada da Server Action em startTransition
    startTransition(async () => {
      const result = await createTestAction(formData)

      if (result.success) {
        toast.success(result.message)
        // reset state
        setName("")
        setDescription("")
        setDate(new Date())
        setIsSuccess(false)
        setResults([])
        setFileName("")
        router.push("/testes")
        
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Registrar Novo Teste Estático</CardTitle>
        <CardDescription>
          Preencha os detalhes e carregue o arquivo de resultados (.txt).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block mb-1 font-medium">Nome do Teste</label>
            <Input
              placeholder="Ex: Teste do Motor 'Phoenix' TR-34B"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block mb-1 font-medium">Descrição</label>
            <Textarea
              placeholder="Descreva os objetivos e condições do teste..."
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Data */}
          <div>
            <label className="block mb-1 font-medium">Data do Teste</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar selected={date!} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Arquivo */}
          <div>
            <label className="block mb-1 font-medium">Arquivo de Resultados</label>
            <Input type="file" accept=".txt" onChange={handleFileChange} />
            {fileName && results.length > 0 && (
              <p className="text-green-600 font-medium mt-1">
                Arquivo "{fileName}" carregado com sucesso. {results.length} registros encontrados.
              </p>
            )}
          </div>

          {/* Sucesso */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="font-medium">O teste foi bem-sucedido?</span>
            <Switch checked={isSuccess} onCheckedChange={setIsSuccess} />
          </div>

          {/* Botão */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Registro do Teste"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}