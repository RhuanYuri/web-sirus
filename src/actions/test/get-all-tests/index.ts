"use server"

import { db } from "@/db"
import { test } from "@/db/schema"
import { auth } from "@/lib/auth"
import { eq, or } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function getAllTests() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if(!session?.user) {
    redirect('/login')
  }
  const tests = await db.query.test.findMany({
    where: or(eq(test.userId, session.user.id), eq(test.isPublic, true)),
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
    return { tests: null }
  }

  return { tests }
}