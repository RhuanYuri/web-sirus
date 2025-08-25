// /app/components/DynamicBreadcrumb.tsx

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import React from "react";

// Mapeia os segmentos da URL para nomes amigáveis
const pathTranslations: { [key: string]: string } = {
  jogos: "Jogos",
  combinacoes: "Combinações",
  sorteios: "Sorteios",
  admin: "Admin",
  novo: "Novo",
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  // Divide a URL em segmentos, ignorando a primeira barra vazia
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Início</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          // Traduz o segmento ou usa o nome original se não houver tradução
          const translatedSegment = pathTranslations[segment] || segment;

          return (
            // Usa Fragment para renderizar a lista sem um nó extra no DOM
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  // O último item não é um link
                  <BreadcrumbPage>{translatedSegment}</BreadcrumbPage>
                ) : (
                  // Itens intermediários são links
                  <BreadcrumbLink asChild>
                    <Link href={href}>{translatedSegment}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
