import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tomomeet-secret-key'
)

export interface TokenPayload {
  userId: string
  email: string
  name: string
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export async function getSession(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('session')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.userId ?? null
}
