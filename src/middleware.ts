// /middleware.ts

import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Como o matcher só inclui rotas protegidas,
  // a única tarefa desta função é verificar se existe uma sessão.
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    // Se não houver sessão, redireciona para a página de login.
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Se houver sessão, permite o acesso.
  return NextResponse.next();
}

export const config = {
  // O segredo está aqui: aplique o middleware APENAS às rotas protegidas.
  // A página inicial ('/') não está nesta lista, então ela é pública por padrão.
  matcher: [
    "/dashboard/:path*",
    "/testes/:path*",
  ],
};