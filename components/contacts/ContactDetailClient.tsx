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
  linkedin_url: string | null;
  company_website: string | null;
  company_industry: string | null;
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

// Helper function to determine if decision makers section should be shown
function shouldShowDecisionMakers(contact: Contact): boolean {
  return Boolean(
    contact.company &&
      (!contact.first_name || !contact.last_name || !contact.email) &&
      contact.executives &&
      contact.executives.length > 0 &&
      contact.executives.some(e => e.decision_maker_rank && e.linkedin_url)
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
  const [isSyncingGHL, setIsSyncingGHL] = useState(false);
  const [ghlSyncMessage, setGhlSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (field: keyof Contact, value: any) => {
    setContact((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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

    // Email validation
    if (contact.email && !/^[\w.-]+@[\w.-]+\.\w+$/.test(contact.email)) {
      newErrors.email = 'Invalid email format';
    }

    // At least first name or last name required
    if (!contact.first_name && !contact.last_name) {
      newErrors.first_name = 'First or last name required';
      newErrors.last_name = 'First or last name required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

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

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

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
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      router.push('/contacts');
      router.refresh();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setContact(initialContact);
    setErrors({});
    setIsEditing(false);
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
        throw new Error('Failed to update favorite');
        // Revert on error
        setContact((prev) => ({ ...prev, favorited: !newFavorited }));
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      setContact((prev) => ({ ...prev, favorited: !newFavorited }));
    }
  };

  const handleSyncToGHL = async () => {
    setIsSyncingGHL(true);
    setGhlSyncMessage(null);

    try {
      const response = await fetch('/api/integrations/ghl/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contact.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync to GoHighLevel');
      }

      setGhlSyncMessage({ type: 'success', text: 'Successfully synced to GoHighLevel!' });

      // Update contact with sync data
      setContact((prev) => ({
        ...prev,
        ghl_contact_id: data.ghlContactId,
        ghl_synced_at: data.syncedAt,
        ghl_sync_error: null,
      }));

      // Refresh the page to get latest data
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync';
      setGhlSyncMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSyncingGHL(false);

      // Clear message after 5 seconds
      setTimeout(() => setGhlSyncMessage(null), 5000);
    }
  };

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown Name';

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-h-[48px] active:scale-95 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Contact
              </button>
              <button
                onClick={toggleFavorite}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 min-h-[48px] active:scale-95 touch-manipulation ${
                  contact.favorited
                    ? 'bg-yellow-50 text-yellow-700 border-2 border-yellow-200'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill={contact.favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-3 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 min-h-[48px] active:scale-95 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[48px] active:scale-95 touch-manipulation"
              >
                {isSaving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-3 bg-gray-100 text-gray-700 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px] active:scale-95 touch-manipulation"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Contact?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete {fullName}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors min-h-[48px] touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors min-h-[48px] touch-manipulation"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GHL Sync Status */}
      {(contact.ghl_contact_id || contact.ghl_sync_error || ghlSyncMessage) && (
        <div className={`rounded-lg border p-4 ${
          contact.ghl_contact_id && !ghlSyncMessage
            ? 'bg-green-50 border-green-200'
            : contact.ghl_sync_error || ghlSyncMessage?.type === 'error'
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              {/* Icon */}
              {contact.ghl_contact_id && !ghlSyncMessage ? (
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : contact.ghl_sync_error || ghlSyncMessage?.type === 'error' ? (
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}

              {/* Message */}
              <div className="flex-1 min-w-0">
                {ghlSyncMessage ? (
                  <p className={`text-sm font-medium ${
                    ghlSyncMessage.type === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {ghlSyncMessage.text}
                  </p>
                ) : contact.ghl_contact_id ? (
                  <>
                    <p className="text-sm font-medium text-green-900">
                      Synced to GoHighLevel
                    </p>
                    {contact.ghl_synced_at && (
                      <p className="text-xs text-green-700">
                        Last synced: {new Date(contact.ghl_synced_at).toLocaleString()}
                      </p>
                    )}
                  </>
                ) : contact.ghl_sync_error ? (
                  <>
                    <p className="text-sm font-medium text-red-900">
                      GoHighLevel Sync Failed
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      {(() => {
                        try {
                          const error = JSON.parse(contact.ghl_sync_error);
                          return error.message || 'Unknown error';
                        } catch {
                          return contact.ghl_sync_error;
                        }
                      })()}
                    </p>
                  </>
                ) : null}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleSyncToGHL}
              disabled={isSyncingGHL}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                contact.ghl_contact_id && !contact.ghl_sync_error
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : contact.ghl_sync_error
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSyncingGHL ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Syncing...
                </span>
              ) : contact.ghl_contact_id && !contact.ghl_sync_error ? (
                'Re-sync'
              ) : contact.ghl_sync_error ? (
                'Retry Sync'
              ) : (
                'Sync Now'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Two-Column Layout: Photos and Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Business Photos */}
        {contact.gmb_photos && contact.gmb_photos.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Business Photos</h2>
            <div className="grid grid-cols-2 gap-2">
              {contact.gmb_photos.slice(0, 6).map((photo, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                  <Image
                    src={photo.url}
                    alt={photo.title || `Business photo ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
            {contact.gmb_photos.length > 6 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                +{contact.gmb_photos.length - 6} more photos
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Business Photos</h2>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500">No business photos available</p>
            </div>
          </div>
        )}

        {/* Right Column: Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h2>
        <div className="space-y-3">
          {/* Name Fields */}
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="block text-xs text-gray-500 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={contact.first_name || ''}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] touch-manipulation ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-xs text-gray-500 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={contact.last_name || ''}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] touch-manipulation ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm font-medium text-gray-900">{fullName}</p>
            </div>
          )}

          {/* Job Title */}
          <div>
            <label htmlFor="job_title" className="block text-xs text-gray-500 mb-1">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                id="job_title"
                value={contact.job_title || ''}
                onChange={(e) => handleChange('job_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] touch-manipulation"
              />
            ) : contact.job_title ? (
              <p className="text-sm font-medium text-gray-900">{contact.job_title}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Not specified</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-xs text-gray-500 mb-1">
              Company
            </label>
            {isEditing ? (
              <input
                type="text"
                id="company"
                value={contact.company || ''}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] touch-manipulation"
              />
            ) : contact.company ? (
              <p className="text-sm font-medium text-gray-900">{contact.company}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Not specified</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs text-gray-500 mb-1">
              Email
            </label>
            {isEditing ? (
              <>
                <input
                  type="email"
                  id="email"
                  value={contact.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] touch-manipulation ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </>
            ) : contact.email ? (
              <a href={`mailto:${contact.email}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                {contact.email}
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">Not specified</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs text-gray-500 mb-1">
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                id="phone"
                value={contact.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] touch-manipulation"
              />
            ) : contact.phone ? (
              <a href={`tel:${contact.phone}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                {contact.phone}
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">Not specified</p>
            )}
          </div>

          {/* Met At */}
          <div>
            <label htmlFor="met_at" className="block text-xs text-gray-500 mb-1">
              Met At
            </label>
            {isEditing ? (
              <input
                type="text"
                id="met_at"
                value={contact.met_at || ''}
                onChange={(e) => handleChange('met_at', e.target.value)}
                placeholder="e.g., Tech Conference 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] touch-manipulation"
              />
            ) : contact.met_at ? (
              <p className="text-sm font-medium text-gray-900">{contact.met_at}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Not specified</p>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* AI Summary */}
      {contact.ai_summary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">AI Summary</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{contact.ai_summary}</p>
        </div>
      )}

      {/* Icebreakers */}
      {contact.icebreakers && contact.icebreakers.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Conversation Starters</h2>
          <ul className="space-y-2">
            {contact.icebreakers.map((icebreaker: string, index: number) => (
              <li key={index} className="flex gap-2 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                  {index + 1}
                </span>
                <span className="flex-1">{icebreaker}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Research Data */}
      {(contact.linkedin_url || contact.company_website || contact.company_industry) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Research</h2>
          <div className="space-y-3">
            {contact.linkedin_url && (
              <div>
                <p className="text-xs text-gray-500">LinkedIn</p>
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View Profile
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
            {contact.company_website && (
              <div>
                <p className="text-xs text-gray-500">Company Website</p>
                <a
                  href={contact.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Visit Website
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
            {contact.company_industry && (
              <div>
                <p className="text-xs text-gray-500">Industry</p>
                <p className="text-sm font-medium text-gray-900">{contact.company_industry}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Provider Reputation */}
      {contact.is_service_provider && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Service Provider Reputation</h2>
            {contact.service_category && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                {contact.service_category.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {contact.reputation_score ? (
            <>
              {/* Star Rating */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(contact.reputation_score || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {contact.reputation_score.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({contact.review_count} {contact.review_count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                <p className="text-xs text-gray-500">Source: Google My Business</p>
              </div>

              {/* AI Recommendation */}
              {contact.reputation_summary && (
                <div
                  className={`p-3 rounded-lg mb-2 ${
                    contact.reputation_score >= 4.0
                      ? 'bg-green-50 border border-green-200'
                      : contact.reputation_score >= 3.0
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p className="text-sm text-gray-700 mb-2">{contact.reputation_summary}</p>
                  <div className="flex items-center gap-2">
                    {contact.reputation_score >= 4.0 ? (
                      <>
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-semibold text-green-700">Recommended</span>
                      </>
                    ) : contact.reputation_score >= 3.0 ? (
                      <>
                        <svg
                          className="w-4 h-4 text-yellow-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-semibold text-yellow-700">
                          Proceed with Caution
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-semibold text-red-700">Not Recommended</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-gray-500">No online reviews found</p>
              <p className="text-xs text-gray-400 mt-1">
                This business may be new or not listed on Google
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detailed Reviews from Google */}
      {contact.gmb_reviews && contact.gmb_reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Customer Reviews</h2>
          <div className="space-y-4">
            {contact.gmb_reviews.slice(0, 5).map((review, index) => (
              <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                  </div>
                  {review.likes > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {review.likes}
                    </div>
                  )}
                </div>
                {review.text && (
                  <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>
                )}
              </div>
            ))}
          </div>
          {contact.gmb_reviews.length > 5 && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              Showing 5 of {contact.gmb_reviews.length} reviews
            </p>
          )}
        </div>
      )}

      {/* Decision Makers - Show when contact info is incomplete */}
      {shouldShowDecisionMakers(contact) && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">Can't reach this person? Try these decision makers</h2>
              <p className="text-sm text-gray-700 mt-1">
                We found key people at {contact.company} who may be helpful
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {contact.executives
              ?.filter(e => e.decision_maker_rank && e.decision_maker_rank <= 5)
              .map((exec, index) => (
                <div key={index} className="bg-white rounded-lg border border-blue-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Name and badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900">{exec.name}</h3>
                        {exec.is_primary_decision_maker && (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 border border-yellow-400 rounded text-xs font-semibold text-yellow-900">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Top Decision Maker
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 border border-blue-300 rounded text-xs font-medium text-blue-900">
                          Rank #{exec.decision_maker_rank}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="text-sm font-medium text-gray-700 mb-3">{exec.title}</p>

                      {/* Authority score bar */}
                      {exec.decision_maker_score && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600">Decision Authority</span>
                            <span className="text-xs font-bold text-blue-700">{exec.decision_maker_score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${exec.decision_maker_score}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        {exec.linkedin_url && (
                          <a
                            href={exec.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0077B5] hover:bg-[#006399] rounded-lg text-white text-sm font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            View LinkedIn
                          </a>
                        )}

                        <button
                          onClick={() => {
                            // Pre-fill new contact form with this executive's info
                            const nameParts = exec.name.split(' ');
                            const firstName = nameParts[0] || '';
                            const lastName = nameParts.slice(1).join(' ') || '';
                            const prefillData = {
                              first_name: firstName,
                              last_name: lastName,
                              company: contact.company,
                              job_title: exec.title,
                              linkedin_url: exec.linkedin_url,
                            };
                            router.push(`/contacts/create?prefill=${encodeURIComponent(JSON.stringify(prefillData))}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Create Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 flex items-start gap-2 bg-blue-100 border border-blue-300 rounded-lg p-3">
            <svg className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-blue-900 leading-relaxed">
              <strong>How we rank decision makers:</strong> We analyze job titles and seniority to identify who has purchasing authority at this company. Higher ranked individuals are more likely to make or influence buying decisions.
            </p>
          </div>
        </div>
      )}

      {/* Recent News */}
      {contact.recent_news && contact.recent_news.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent News</h2>
          <ul className="space-y-2">
            {contact.recent_news.map((news: string, index: number) => (
              <li key={index} className="flex gap-2 text-sm text-gray-700">
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                    clipRule="evenodd"
                  />
                  <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                </svg>
                <span>{news}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Notes</h2>
        {isEditing ? (
          <textarea
            value={contact.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add notes about this contact..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none touch-manipulation"
          />
        ) : contact.notes ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">No notes yet</p>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h2 className="text-xs font-semibold text-gray-500 mb-2">Metadata</h2>
        <div className="space-y-1 text-xs text-gray-600">
          <p>Added: {new Date(contact.created_at).toLocaleDateString()}</p>
          {contact.ocr_confidence && <p>OCR Confidence: {contact.ocr_confidence.toFixed(1)}%</p>}
        </div>
      </div>
    </div>
  );
}
