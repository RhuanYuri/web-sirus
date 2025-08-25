"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { test, testResult } from "@/db/schema" // Supondo que os tipos sejam importados

// --- DEFINIÇÃO DAS PROPRIEDADES E TIPOS ---

// Tipos inferidos a partir do seu schema para uso nas props
type TestResult = typeof testResult.$inferSelect
type Test = typeof test.$inferSelect

// Interface de propriedades para o novo componente de gráfico
interface TestResultChartProps {
  testData: Test & {
    results: TestResult[]
  }
}

// --- CONFIGURAÇÃO DO GRÁFICO ---

const chartConfig = {
  force: {
    label: "Força (kN)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

// --- COMPONENTE DO GRÁFICO ---

export function TestResultChart({ testData }: TestResultChartProps) {
  // Transforma a força de string (decimal) para número para o gráfico
  const chartData = testData.results.map((result) => ({
    ...result,
    force: parseFloat(result.force),
  })).sort((a: any, b: any) => a.second - b.second); // Garante que os dados estão ordenados pelo tempo

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Força vs. Tempo</CardTitle>
        <CardDescription>
          Resultados detalhados para o teste: <strong>{testData.name}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillForce" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-force)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-force)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="second"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}s`}
              name="Tempo"
            />
            <YAxis
              tickFormatter={(value) => `${value} kN`}
              name="Força"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Tempo: ${value}s`}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="force"
              type="natural"
              fill="url(#fillForce)"
              stroke="var(--color-force)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
