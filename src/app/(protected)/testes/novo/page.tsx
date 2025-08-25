import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateTestForm } from "./components/CreateTestForm"

export default function CreateTestPage() {
  return (
    <div className="flex w-full flex-col items-center p-4 md:p-10">
      <div className="w-full max-w-2xl mb-6">
        <Button asChild variant="outline" size="sm">
          <a href="/testes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Testes
          </a>
        </Button>
      </div>
      <CreateTestForm />
    </div>
  )
}
