"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Banner from "@/components/authentication/banner";
import Footer from "@/components/authentication/footer";
import Header from "@/components/authentication/header";
import { authClient } from "@/lib/auth-client";

// Schema de validação com Zod (sem alterações)
const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um endereço de e-mail válido.",
  }),
  password: z.string().min(8, {
    message: "A senha deve ter pelo menos 8 caracteres.",
  }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  // 1. Hook useTransition para gerenciar o estado de carregamento
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Função para lidar com o envio dos dados
  function onSubmit(values: z.infer<typeof formSchema>) {
    // 2. Envolve a lógica de autenticação com startTransition
    startTransition(async () => {
      await authClient.signIn.email({
        email: values.email,
        password: values.password,
        fetchOptions: {
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (ctx) => {
            if (ctx.error.code === "USER_NOT_FOUND") {
              toast.error("E-mail não encontrado.");
              return form.setError("email", {
                message: "E-mail não encontrado.",
              });
            }
            if (ctx.error.code === "INVALID_EMAIL_OR_PASSWORD") {
              toast.error("E-mail ou senha inválidos.");
              form.setError("password", {
                message: "E-mail ou senha inválidos.",
              });
              return form.setError("email", {
                message: "E-mail ou senha inválidos.",
              });
            }
            toast.error(ctx.error.message);
          },
        },
      });
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6 md:p-8"
            >
             <Header title="Bem-Vindo" description="Faça login para acessar sua conta" />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@example.com"
                        type="email"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Senha</FormLabel>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Esqueceu a senha?
                      </a>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 3. Botão atualizado com estado de carregamento */}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Entrando..." : "Login"}
              </Button>

              <Footer  text="Não possui uma conta?" name="Cadastre-se" link="cadastro" />
            </form>
          </Form>

          <Banner />
        </CardContent>
      </Card>
    </div>
  );
}
