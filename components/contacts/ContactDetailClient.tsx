'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Executive = {
  name: string;
  title: string;
  linkedin_url: string | null;
  decision_maker_score?: number;
  decision_maker_rank?: number;
  is_primary_decision_maker?: boolean;
};

type SmsTemplate = {
  message: string;
};

type EmailTemplate = {
  subject: string;
  body: string;
};

type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  met_at: string | null;
  notes: string | null;
  tags: string[] | null;
  favorited: boolean;
  card_image_url: string | null;
  ai_summary: string | null;
  icebreakers: string[] | null;
  sms_templates: SmsTemplate[] | null;
  email_templates: EmailTemplate[] | null;
  linkedin_url: string | null;
  company_website: string | null;
  company_industry: string | null;
  company_size?: string | null;
  company_revenue?: string | null;
  company_funding?: string | null;
  company_founded?: number | null;
  company_employees?: string | null;
  company_description?: string | null;
  founders?: string[] | null;
  competitors?: string[] | null;
  technologies?: string[] | null;
  job_openings?: number | null;
  locations?: string[] | null;
  crunchbase_url?: string | null;
  social_media?: {
    twitter: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    linkedin_company: string | null;
  } | null;
  recent_news: string[] | null;
  ocr_confidence: number | null;
  is_service_provider?: boolean;
  service_category?: string | null;
  reputation_score?: number | null;
  review_count?: number | null;
  review_source?: string | null;
  reputation_summary?: string | null;
  website_status?: string | null;
  reputation_checked_at?: string | null;
  reputation_error?: string | null;
  gmb_photos?: { url: string; thumbnail: string; title?: string }[] | null;
  gmb_reviews?: { author: string; rating: number; text: string; date: string; likes: number }[] | null;
  executives?: Executive[] | null;
  ghl_contact_id?: string | null;
  ghl_synced_at?: string | null;
  ghl_sync_error?: string | null;
  created_at: string;
};

type ContactDetailClientProps = {
  initialContact: Contact;
};

// Info row component for consistent styling
function InfoRow({ label, value, href, icon }: { label: string; value: string | null | undefined; href?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <div className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        {value ? (
          href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 truncate block">
              {value}
            </a>
          ) : (
            <p className="text-sm text-gray-200">{value}</p>
          )
        ) : (
          <p className="text-sm text-gray-600 italic">Not found</p>
        )}
      </div>
    </div>
  );
}

export default function ContactDetailClient({ initialContact }: ContactDetailClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contact, setContact] = useState(initialContact);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCardImage, setShowCardImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleChange = (field: keyof Contact, value: any) => {
    setContact((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (contact.email && !/^[\w.-]+@[\w.-]+\.\w+$/.test(contact.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!contact.first_name && !contact.last_name) {
      newErrors.first_name = 'First or last name required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          job_title: contact.job_title,
          met_at: contact.met_at,
          notes: contact.notes,
          tags: contact.tags,
          favorited: contact.favorited,
        }),
      });
      if (!response.ok) throw new Error('Failed to update contact');
      const updatedContact = await response.json();
      setContact(updatedContact);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete contact');
      router.push('/contacts');
      router.refresh();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact. Please try again.');
      setIsDeleting(false);
    }
  };

  const toggleFavorite = async () => {
    const newFavorited = !contact.favorited;
    setContact((prev) => ({ ...prev, favorited: newFavorited }));
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorited: newFavorited }),
      });
      if (!response.ok) {
        setContact((prev) => ({ ...prev, favorited: !newFavorited }));
      } else {
        router.refresh();
      }
    } catch (error) {
      setContact((prev) => ({ ...prev, favorited: !newFavorited }));
    }
  };

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown';
  const initials = [contact.first_name?.[0], contact.last_name?.[0]].filter(Boolean).join('').toUpperCase() || contact.company?.[0]?.toUpperCase() || '?';

  // Get primary image - card image, GMB photo, or placeholder
  // Check for valid URLs (not empty strings)
  const cardImageUrl = contact.card_image_url && contact.card_image_url.trim() ? contact.card_image_url : null;
  const gmbPhotoUrl = contact.gmb_photos && contact.gmb_photos[0]?.url;
  const primaryImage = !imageError ? (cardImageUrl || gmbPhotoUrl) : null;

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition-colors ${contact.favorited ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-400 hover:text-yellow-400'}`}
            >
              <svg className="w-5 h-5" fill={contact.favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Edit
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setContact(initialContact); setIsEditing(false); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section - Image + Basic Info */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Image */}
            <div className="relative bg-gray-900 aspect-square md:aspect-auto md:min-h-[300px]">
              {primaryImage ? (
                <>
                  <Image
                    src={primaryImage}
                    alt={fullName}
                    fill
                    className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowCardImage(true)}
                    onError={() => setImageError(true)}
                    unoptimized
                  />
                  <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white">
                    {contact.card_image_url ? 'Business Card' : 'Business Photo'}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-600/20 to-blue-600/20">
                  <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-white">{initials}</span>
                  </div>
                  <p className="text-gray-500 text-sm">No image available</p>
                </div>
              )}
            </div>

            {/* Right: Basic Info */}
            <div className="p-6">
              <div className="mb-6">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={contact.first_name || ''}
                        onChange={(e) => handleChange('first_name', e.target.value)}
                        placeholder="First Name"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={contact.last_name || ''}
                        onChange={(e) => handleChange('last_name', e.target.value)}
                        placeholder="Last Name"
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <input
                      type="text"
                      value={contact.job_title || ''}
                      onChange={(e) => handleChange('job_title', e.target.value)}
                      placeholder="Job Title"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={contact.company || ''}
                      onChange={(e) => handleChange('company', e.target.value)}
                      placeholder="Company"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white mb-1">{fullName}</h1>
                    <p className="text-gray-400">{contact.job_title || 'No title'}</p>
                    <p className="text-violet-400 font-medium">{contact.company || 'No company'}</p>
                  </>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-1 border-t border-gray-700 pt-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={contact.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Email"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      value={contact.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="Phone"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <>
                    <InfoRow
                      label="Email"
                      value={contact.email}
                      href={contact.email ? `mailto:${contact.email}` : undefined}
                      icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    />
                    <InfoRow
                      label="Phone"
                      value={contact.phone}
                      href={contact.phone ? `tel:${contact.phone}` : undefined}
                      icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                    />
                    <InfoRow
                      label="LinkedIn"
                      value={contact.linkedin_url ? 'View Profile' : null}
                      href={contact.linkedin_url || undefined}
                      icon={<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>}
                    />
                  </>
                )}
              </div>

              {/* Quick Actions */}
              {!isEditing && (contact.phone || contact.email) && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium text-center transition-colors">
                      Call
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium text-center transition-colors">
                      Email
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`sms:${contact.phone}`} className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium text-center transition-colors">
                      Text
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* AI Summary */}
            {contact.ai_summary && (
              <div className="bg-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Summary
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">{contact.ai_summary}</p>
              </div>
            )}

            {/* SMS Templates */}
            {contact.sms_templates && contact.sms_templates.length > 0 && contact.phone && (
              <div className="bg-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Quick Text Messages
                </h2>
                <div className="space-y-3">
                  {contact.sms_templates.slice(0, 3).map((template, i) => (
                    <div key={i} className="bg-gray-700/50 rounded-xl p-3">
                      <p className="text-gray-300 text-sm mb-2">{template.message}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(template.message); }} className="flex-1 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs font-medium transition-colors">
                          Copy
                        </button>
                        <a href={`sms:${contact.phone}?body=${encodeURIComponent(template.message)}`} className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium text-center transition-colors">
                          Send
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Templates */}
            {contact.email_templates && contact.email_templates.length > 0 && contact.email && (
              <div className="bg-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Templates
                </h2>
                <div className="space-y-3">
                  {contact.email_templates.slice(0, 2).map((template, i) => (
                    <div key={i} className="bg-gray-700/50 rounded-xl p-3">
                      <p className="text-white text-sm font-medium mb-1">{template.subject}</p>
                      <p className="text-gray-400 text-xs mb-2 line-clamp-2">{template.body}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(`Subject: ${template.subject}\n\n${template.body}`); }} className="flex-1 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs font-medium transition-colors">
                          Copy
                        </button>
                        <a href={`mailto:${contact.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium text-center transition-colors">
                          Send
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Starters */}
            {contact.icebreakers && contact.icebreakers.length > 0 && (
              <div className="bg-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Conversation Starters
                </h2>
                <ul className="space-y-2">
                  {contact.icebreakers.map((icebreaker, i) => (
                    <li key={i} className="flex items-start gap-3 p-2 bg-gray-700/50 rounded-lg">
                      <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                      <p className="text-gray-300 text-sm flex-1">{icebreaker}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            <div className="bg-gray-800 rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Notes
              </h2>
              {isEditing ? (
                <textarea
                  value={contact.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Add notes..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : contact.notes ? (
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{contact.notes}</p>
              ) : (
                <p className="text-gray-600 text-sm italic">No notes yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Enrichment Data */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-gray-800 rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Company Information
              </h2>
              <div className="space-y-1">
                <InfoRow label="Website" value={contact.company_website ? contact.company_website.replace(/^https?:\/\//, '') : null} href={contact.company_website || undefined} />
                <InfoRow label="Industry" value={contact.company_industry} />
                <InfoRow label="Company Size" value={contact.company_size || contact.company_employees} />
                <InfoRow label="Founded" value={contact.company_founded?.toString()} />
                <InfoRow label="Revenue" value={contact.company_revenue} />
                <InfoRow label="Funding" value={contact.company_funding} />
                {contact.locations && contact.locations.length > 0 && (
                  <InfoRow label="Locations" value={contact.locations.join(', ')} />
                )}
                {contact.crunchbase_url && (
                  <InfoRow label="Crunchbase" value="View Profile" href={contact.crunchbase_url} />
                )}
              </div>
              {contact.company_description && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">About</p>
                  <p className="text-sm text-gray-300">{contact.company_description}</p>
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="bg-gray-800 rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Social Profiles
              </h2>
              <div className="space-y-1">
                <InfoRow label="Personal LinkedIn" value={contact.linkedin_url ? 'View Profile' : null} href={contact.linkedin_url || undefined} />
                <InfoRow label="Company LinkedIn" value={contact.social_media?.linkedin_company ? 'View Page' : null} href={contact.social_media?.linkedin_company || undefined} />
                <InfoRow label="Twitter / X" value={contact.social_media?.twitter ? '@' + contact.social_media.twitter.split('/').pop() : null} href={contact.social_media?.twitter || undefined} />
                <InfoRow label="Instagram" value={contact.social_media?.instagram ? '@' + contact.social_media.instagram.split('/').pop() : null} href={contact.social_media?.instagram || undefined} />
                <InfoRow label="Facebook" value={contact.social_media?.facebook ? 'View Page' : null} href={contact.social_media?.facebook || undefined} />
                <InfoRow label="TikTok" value={contact.social_media?.tiktok ? '@' + contact.social_media.tiktok.split('/').pop()?.replace('@', '') : null} href={contact.social_media?.tiktok || undefined} />
              </div>
            </div>

            {/* Reputation & Reviews */}
            {contact.is_service_provider && (
              <div className="bg-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Reviews & Reputation
                </h2>
                {contact.reputation_score ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl font-bold text-white">{contact.reputation_score.toFixed(1)}</span>
                      <div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`w-4 h-4 ${star <= Math.round(contact.reputation_score!) ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-400 text-xs">{contact.review_count || 0} reviews</p>
                      </div>
                    </div>
                    {contact.reputation_summary && (
                      <p className="text-gray-300 text-sm mb-4">{contact.reputation_summary}</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm italic mb-4">No rating found for this business</p>
                )}

                {/* Individual Reviews */}
                {contact.gmb_reviews && contact.gmb_reviews.length > 0 ? (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-400 mb-3">Recent Reviews</p>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {contact.gmb_reviews.slice(0, 5).map((review, i) => (
                        <div key={i} className="bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{review.author}</span>
                          </div>
                          {review.text && <p className="text-gray-300 text-xs line-clamp-3">{review.text}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <p className="text-gray-500 text-sm italic">No reviews found</p>
                  </div>
                )}
              </div>
            )}

            {/* Business Photos */}
            {contact.is_service_provider && (
              <div className="bg-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Business Photos
                </h2>
                {contact.gmb_photos && contact.gmb_photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {contact.gmb_photos.slice(0, 6).map((photo, i) => (
                      <a key={i} href={photo.url} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-lg overflow-hidden bg-gray-700 hover:opacity-90 transition-opacity">
                        <Image src={photo.thumbnail || photo.url} alt={photo.title || `Photo ${i + 1}`} fill className="object-cover" unoptimized />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No photos found</p>
                )}
              </div>
            )}

            {/* Technologies */}
            {contact.technologies && contact.technologies.length > 0 && (
              <div className="bg-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Technologies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {contact.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-xs">{tech}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent News */}
            {contact.recent_news && contact.recent_news.length > 0 && (
              <div className="bg-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Recent News
                </h2>
                <ul className="space-y-2">
                  {contact.recent_news.slice(0, 3).map((news, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-orange-400">•</span>
                      <span>{news}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-800/50 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">Metadata</h2>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Added: {new Date(contact.created_at).toLocaleDateString()}</p>
                {contact.met_at && <p>Met at: {contact.met_at}</p>}
                {contact.ocr_confidence && <p>OCR Confidence: {contact.ocr_confidence.toFixed(1)}%</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-white mb-2">Delete Contact?</h3>
            <p className="text-sm text-gray-400 mb-6">Are you sure you want to delete {fullName}? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Image Modal */}
      {showCardImage && primaryImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowCardImage(false)}>
          <div className="relative max-w-3xl max-h-[80vh] w-full">
            <Image src={primaryImage} alt={fullName} width={800} height={600} className="w-full h-auto object-contain rounded-lg" unoptimized />
            <button onClick={() => setShowCardImage(false)} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
