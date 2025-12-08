import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DiscordStyleContacts from '@/components/contacts/DiscordStyleContacts';

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

  return <DiscordStyleContacts contacts={contacts || []} error={error?.message} />;
}
