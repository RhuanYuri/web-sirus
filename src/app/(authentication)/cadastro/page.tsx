import { auth } from "@/lib/auth";
import { SignUpForm } from "./components/sing-up-form";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if(session?.user) {
     redirect("/dashboard");
  }
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignUpForm />
      </div>
    </div>
  )
}
