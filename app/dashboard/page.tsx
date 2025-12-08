import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DiscordStyleContacts from '@/components/contacts/DiscordStyleContacts';

function DashboardLoading() {
  return (
    <div className="flex h-screen bg-[#36393f] items-center justify-center">
      <div className="text-gray-400">Loading dashboard...</div>
    </div>
  );
}

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/login');
  }

  // Fetch contacts
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DiscordStyleContacts contacts={contacts || []} error={error?.message} />
    </Suspense>
  );
}
