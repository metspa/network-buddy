'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import SearchBar, { type FilterOptions } from './SearchBar';
import ContactCard from './ContactCard';

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
};

type ContactsListClientProps = {
  contacts: Contact[];
};

const ITEMS_PER_PAGE = 20;

export default function ContactsListClient({ contacts }: ContactsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    favorited: false,
    sortBy: 'newest',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort contacts
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((contact) => {
        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
        const company = (contact.company || '').toLowerCase();
        const email = (contact.email || '').toLowerCase();
        return fullName.includes(query) || company.includes(query) || email.includes(query);
      });
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter((contact) => contact.enrichment_status === filters.status);
    }

    // Favorites filter
    if (filters.favorited) {
      result = result.filter((contact) => contact.favorited);
    }

    // Sort
    result.sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (filters.sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (filters.sortBy === 'name') {
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim() || 'Unknown';
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'Unknown';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return result;
  }, [contacts, searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} totalCount={filteredContacts.length} />

      {/* Main Content */}
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        {/* No results state */}
        {filteredContacts.length === 0 && searchQuery && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No contacts found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ status: 'all', favorited: false, sortBy: 'newest' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors min-h-[48px] active:scale-95 touch-manipulation"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Contact List */}
        {paginatedContacts.length > 0 && (
          <>
            <div className="space-y-3">
              {paginatedContacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] active:scale-95 touch-manipulation"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg font-medium transition-colors active:scale-95 touch-manipulation ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] active:scale-95 touch-manipulation"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
