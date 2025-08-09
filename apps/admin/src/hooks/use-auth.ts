'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { LoginPayload, SignupPayload } from '@nexus/shared'

interface LoginResponse {
  ok: true
}

async function postLogin(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const json = (await res.json().catch(() => ({ error: 'Login failed' }))) as {
      error?: string
    }
    throw new Error(json.error ?? 'Login failed')
  }

  // The route sets auth cookies on response
  return (await res.json()) as LoginResponse
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: postLogin,
    onSuccess: async () => {
      // Ensure user cache reflects new session
      await qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

async function postSignup(payload: SignupPayload): Promise<LoginResponse> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const json = (await res.json().catch(() => ({ error: 'Signup failed' }))) as {
      error?: string
    }
    throw new Error(json.error ?? 'Signup failed')
  }

  return (await res.json()) as LoginResponse
}

export function useSignup() {
  const qc = useQueryClient()
  return useMutation<LoginResponse, Error, SignupPayload>({
    mutationFn: postSignup,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}
