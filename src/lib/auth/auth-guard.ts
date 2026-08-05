import { auth } from './auth.config'
import { prisma } from '../db/prisma'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'

/**
 * Wrapper around NextAuth auth() function to fetch the server-side session.
 */
export async function getServerSession() {
  return await auth()
}

/**
 * Checks database to determine if the user has active, provisioned dashboard access.
 */
export async function checkDashboardAccess(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.isActive) {
    return false
  }

  if (user.role !== 'CLIENT') {
    return true
  }

  if (!user.linkedLeadId) {
    return false
  }

  const lead = await prisma.lead.findUnique({
    where: { id: user.linkedLeadId },
  })

  return lead?.dashboardAccessStatus === 'GRANTED'
}

/**
 * Protects server routes / components by requiring authentication.
 * Throws a redirect to /login on authentication or role mismatch.
 */
export async function requireAuth(requiredRole?: Role) {
  const session = await getServerSession()

  if (!session || !session.user) {
    redirect('/login')
  }

  if (requiredRole && session.user.role !== requiredRole) {
    redirect('/login')
  }

  return session
}

/**
 * Protects client dashboard paths by verifying dashboard provisioning.
 */
export async function requireDashboardAccess() {
  const session = await getServerSession()

  if (!session || !session.user || !session.user.email) {
    redirect('/login')
  }

  const hasAccess = await checkDashboardAccess(session.user.email)
  if (!hasAccess) {
    redirect('/login')
  }

  return session
}
