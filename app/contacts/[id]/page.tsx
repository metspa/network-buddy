import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
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

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown Name';

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/contacts"
            className="text-blue-600 hover:text-blue-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
            {contact.company && (
              <p className="text-sm text-gray-600">{contact.company}</p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        {/* Auto-Enrichment Status */}
        <div className="mb-6">
          <AutoEnrichment contact={contact} />
        </div>

        {/* Contact Details */}
        <ContactDetailClient initialContact={contact} />
      </div>
    </main>
  );
}
