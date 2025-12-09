import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AutoEnrichment from '@/components/contacts/AutoEnrichment';
import ContactDetailClient from '@/components/contacts/ContactDetailClient';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/login');
  }

  // Fetch contact
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !contact) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Auto-Enrichment (hidden, runs in background) */}
      <AutoEnrichment contact={contact} />

      {/* Contact Details - Full dark theme */}
      <ContactDetailClient initialContact={contact} />
    </div>
  );
}
