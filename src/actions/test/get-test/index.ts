"use server"

import { db } from "@/db"
import { test } from "@/db/schema"
import { auth } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function getTest({ id }: { id: string }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if(!session?.user) {
    redirect('/login')
  }
  const tests = await db.query.test.findFirst({
    where: eq(test.id, id),
    with: {
      results: true,
      user: {
        columns: {
          id: true,
          name: true,
        }
      }
    }
  })

  if(!tests) {
    return { test: null }
  }

  return { test: tests }
}