'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SubscriptionBanner from '@/components/subscription/SubscriptionBanner';

type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  enrichment_status: string;
  favorited: boolean;
  created_at: string;
  tags: string[] | null;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
};

type CustomCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type DiscordStyleContactsProps = {
  contacts: Contact[];
  error?: string;
};

export default function DiscordStyleContacts({ contacts, error }: DiscordStyleContactsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddManualModal, setShowAddManualModal] = useState(false);

  // Custom categories from database
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Manual contact form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch custom categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCustomCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Auto-start checkout if redirected from pricing page
  useEffect(() => {
    const startCheckout = searchParams.get('startCheckout');
    if (startCheckout && (startCheckout === 'starter' || startCheckout === 'growth')) {
      // Clear the URL parameter
      router.replace('/dashboard', { scroll: false });

      // Start checkout
      async function initiateCheckout() {
        try {
          const response = await fetch('/api/stripe/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: startCheckout }),
          });

          const data = await response.json();
          if (data.url) {
            window.location.href = data.url;
          } else if (data.error) {
            console.error('Checkout error:', data.error);
            alert('Failed to start checkout: ' + data.error);
          }
        } catch (err) {
          console.error('Checkout error:', err);
        }
      }
      initiateCheckout();
    }
  }, [searchParams, router]);

  // Handle creating a new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomCategories(prev => [...prev, data.category]);
        setNewCategoryName('');
        setShowAddCategory(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create category');
      }
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('Failed to create category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCustomCategories(prev => prev.filter(c => c.id !== categoryId));
        if (selectedCategory === `custom-${categoryId}`) {
          setSelectedCategory('all');
        }
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  // Default categories
  const defaultCategories: Category[] = [
    { id: 'all', name: 'All Contacts', icon: '👥', count: contacts.length },
    { id: 'favorites', name: 'Favorites', icon: '⭐', count: contacts.filter(c => c.favorited).length },
    { id: 'recent', name: 'Recent', icon: '🕐', count: contacts.slice(0, 10).length },
  ];

  // Custom categories from tags
  const tagCategories: Category[] = useMemo(() => {
    const tagMap = new Map<string, number>();
    contacts.forEach(contact => {
      if (contact.tags && Array.isArray(contact.tags)) {
        contact.tags.forEach(tag => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      }
    });
    return Array.from(tagMap.entries()).map(([tag, count]) => ({
      id: `tag-${tag}`,
      name: tag,
      icon: '📁',
      count,
    }));
  }, [contacts]);

  // Convert custom categories to display format
  const customCategoryItems: Category[] = customCategories.map(cat => ({
    id: `custom-${cat.id}`,
    name: cat.name,
    icon: cat.icon,
    count: contacts.filter(c => c.tags?.includes(cat.name)).length,
  }));

  const categories = [...defaultCategories, ...customCategoryItems, ...tagCategories];

  // Filter contacts based on selected category and search
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Apply category filter
    if (selectedCategory === 'favorites') {
      result = result.filter(c => c.favorited);
    } else if (selectedCategory === 'recent') {
      result = result.slice(0, 10);
    } else if (selectedCategory.startsWith('tag-')) {
      const tag = selectedCategory.replace('tag-', '');
      result = result.filter(c => c.tags?.includes(tag));
    } else if (selectedCategory.startsWith('custom-')) {
      // Custom category - filter by category name as tag
      const customCat = customCategories.find(c => `custom-${c.id}` === selectedCategory);
      if (customCat) {
        result = result.filter(c => c.tags?.includes(customCat.name));
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(contact => {
        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
        const company = (contact.company || '').toLowerCase();
        const email = (contact.email || '').toLowerCase();
        return fullName.includes(query) || company.includes(query) || email.includes(query);
      });
    }

    return result;
  }, [contacts, selectedCategory, searchQuery]);

  const handleSendEmail = (email: string | null) => {
    if (email) {
      window.open(`mailto:${email}`, '_blank');
    }
  };

  const handleSendSMS = (phone: string | null) => {
    if (phone) {
      // Clean phone number
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`sms:${cleanPhone}`, '_blank');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate that at least one enrichment field is provided
    if (!formData.email && !formData.phone && !formData.company) {
      setFormError('Please provide at least an email, phone number, or company name for enrichment');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contacts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName || null,
          last_name: formData.lastName || null,
          email: formData.email || null,
          phone: formData.phone || null,
          company: formData.company || null,
          job_title: formData.jobTitle || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create contact');
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
      });
      setShowAddManualModal(false);

      // Refresh the page to show new contact
      router.refresh();

      // Optionally redirect to the new contact
      if (data.contact?.id) {
        router.push(`/contacts/${data.contact.id}`);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#36393f]">
      {/* Left Sidebar - Categories */}
      <div className="w-64 bg-[#2f3136] flex flex-col">
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#202225] shadow-md">
          <h2 className="text-white font-semibold">Contacts</h2>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="p-2 rounded hover:bg-[#36393f] text-gray-400 hover:text-white transition-colors"
              title="Add contact"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#18191c] rounded-lg shadow-lg border border-[#202225] py-2 z-50">
                <Link
                  href="/scan"
                  className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-[#36393f] hover:text-white transition-colors"
                  onClick={() => setShowAddMenu(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">Scan Business Card</span>
                </Link>
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    setShowAddManualModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-[#36393f] hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">Add Contact Manually</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Banner */}
        <div className="p-2">
          <SubscriptionBanner />
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">Categories</div>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between px-2 py-2 rounded mb-1 text-gray-300 hover:bg-[#36393f] transition-colors ${
                selectedCategory === category.id ? 'bg-[#36393f] text-white' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <span className="text-xs bg-[#202225] px-2 py-0.5 rounded-full">{category.count}</span>
            </button>
          ))}

          {/* Add Category Button */}
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded mt-2 text-gray-400 hover:text-white hover:bg-[#36393f] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">Add Category</span>
          </button>

          {showAddCategory && (
            <div className="mt-2 px-2">
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                className="w-full bg-[#202225] text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCreateCategory}
                disabled={isCreatingCategory || !newCategoryName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-3 py-2 rounded mt-2 text-sm font-medium transition-colors"
              >
                {isCreatingCategory ? 'Creating...' : 'Create'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 px-4 flex items-center border-b border-[#202225] bg-[#36393f] shadow-md">
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-white font-semibold">
              {categories.find(c => c.id === selectedCategory)?.name || 'All Contacts'}
            </h1>
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#202225] text-white px-4 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="m-4 bg-red-900 border border-red-700 rounded-lg p-4 text-red-200">
              <p>Failed to load contacts: {error}</p>
            </div>
          )}

          {filteredContacts.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery ? 'Try a different search term' : 'Start by scanning your first business card'}
              </p>
              <Link
                href="/scan"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Scan Business Card
              </Link>
            </div>
          )}

          {filteredContacts.length > 0 && (
            <div className="divide-y divide-[#202225]">
              {filteredContacts.map(contact => {
                const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown';
                const initials = fullName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={contact.id}
                    className="px-4 py-3 hover:bg-[#32353b] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <Link href={`/contacts/${contact.id}`} className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {initials}
                        </div>
                      </Link>

                      {/* Info */}
                      <Link href={`/contacts/${contact.id}`} className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium truncate">{fullName}</h3>
                          {contact.favorited && <span className="text-yellow-400">⭐</span>}
                          {contact.enrichment_status === 'completed' && (
                            <span className="text-green-400" title="Enriched">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          {contact.job_title && <span>{contact.job_title}</span>}
                          {contact.job_title && contact.company && <span>•</span>}
                          {contact.company && <span>{contact.company}</span>}
                        </div>
                      </Link>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Email Button */}
                        <button
                          onClick={() => handleSendEmail(contact.email)}
                          disabled={!contact.email}
                          className="p-2 rounded hover:bg-[#36393f] text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={contact.email ? `Email ${contact.email}` : 'No email available'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>

                        {/* SMS Button */}
                        <button
                          onClick={() => handleSendSMS(contact.phone)}
                          disabled={!contact.phone}
                          className="p-2 rounded hover:bg-[#36393f] text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={contact.phone ? `Text ${contact.phone}` : 'No phone available'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </button>

                        {/* More Options */}
                        <Link
                          href={`/contacts/${contact.id}`}
                          className="p-2 rounded hover:bg-[#36393f] text-gray-400 hover:text-white transition-colors"
                          title="View details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Active Now (optional) */}
      <div className="hidden xl:block w-64 bg-[#2f3136] border-l border-[#202225] p-4">
        <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="bg-[#202225] rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Total Contacts</div>
            <div className="text-white text-2xl font-bold">{contacts.length}</div>
          </div>
          <div className="bg-[#202225] rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Enriched</div>
            <div className="text-white text-2xl font-bold">
              {contacts.filter(c => c.enrichment_status === 'completed').length}
            </div>
          </div>
          <div className="bg-[#202225] rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Favorites</div>
            <div className="text-white text-2xl font-bold">
              {contacts.filter(c => c.favorited).length}
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Manually Modal */}
      {showAddManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#36393f] rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#202225] flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Add Contact Manually</h2>
              <button
                onClick={() => {
                  setShowAddManualModal(false);
                  setFormError(null);
                  setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    company: '',
                    jobTitle: '',
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <form onSubmit={handleManualSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1">
              {formError && (
                <div className="mb-4 bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-red-200 text-sm">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#202225] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#202225] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-gray-500 text-xs">(for enrichment)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202225] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone <span className="text-gray-500 text-xs">(for enrichment)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202225] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                    Company <span className="text-gray-500 text-xs">(for enrichment)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202225] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Acme Inc."
                  />
                </div>

                {/* Job Title */}
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#202225] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Software Engineer"
                  />
                </div>

                {/* Info message */}
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 text-blue-200 text-xs">
                  <p>💡 Provide at least an email, phone, or company name to trigger automatic enrichment with LinkedIn, company info, and more.</p>
                </div>
              </div>
              </div>

              {/* Modal Footer - Fixed at bottom */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-[#202225] flex-shrink-0 bg-[#36393f]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddManualModal(false);
                    setFormError(null);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      company: '',
                      jobTitle: '',
                    });
                  }}
                  className="px-4 py-2 bg-[#202225] text-gray-300 rounded-lg hover:bg-[#2c2f33] transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
