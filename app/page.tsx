import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LandingPage from '@/components/landing/LandingPage';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;

  // If OAuth redirected here with a code, forward to callback handler
  if (params.code) {
    const code = Array.isArray(params.code) ? params.code[0] : params.code;
    const returnUrl = params.returnUrl
      ? (Array.isArray(params.returnUrl) ? params.returnUrl[0] : params.returnUrl)
      : undefined;
    redirect(`/auth/callback?code=${code}${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard');
  }

  // Show landing page to unauthenticated users
  return <LandingPage />;
}
