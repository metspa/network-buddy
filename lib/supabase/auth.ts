import { createClient } from './client'

export async function signUp(email: string, password: string, returnUrl?: string) {
  const supabase = createClient()

  const redirectTo = `${window.location.origin}/auth/callback${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  })

  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  return { error }
}

export async function getCurrentUser() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  return { user, error }
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  // Redirect through callback first, then to reset-password page
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
  })

  return { data, error }
}

export async function signInWithGoogle(returnUrl?: string) {
  const supabase = createClient()

  const redirectTo = `${window.location.origin}/auth/callback${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  })

  return { data, error }
}

export async function signInWithApple(returnUrl?: string) {
  const supabase = createClient()

  const redirectTo = `${window.location.origin}/auth/callback${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo,
    },
  })

  return { data, error }
}
