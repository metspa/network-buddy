// Debug endpoint to test enrichment with full logging
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { searchGoogleMapsBusiness } from '@/lib/services/serpapi-gmb';

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'ymail.com',
  'live.com', 'msn.com', 'me.com', 'mac.com', 'inbox.com',
];

function extractCompanyFromEmail(email: string): string | null {
  try {
    // Get the ORIGINAL case domain (don't lowercase yet)
    const fullDomain = email.split('@')[1];
    if (!fullDomain) return null;
    const domainLower = fullDomain.toLowerCase();
    if (FREE_EMAIL_DOMAINS.includes(domainLower)) return null;

    // Get the domain without TLD, preserving original case
    const domainParts = fullDomain.split('.');
    let companyPart = domainParts[0];

    // Add spaces between camelCase
    companyPart = companyPart
      .replace(/([a-z])([A-Z])/g, '$1 $2')      // "electricalNYC" -> "electrical NYC"
      .replace(/([A-Z]{2,})([a-z])/g, '$1 $2'); // "GHelectrical" -> "GH electrical"

    // Format words
    const formatted = companyPart
      .split(' ')
      .map(word => {
        if (word === word.toUpperCase() && word.length > 1) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
    return formatted;
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(`${new Date().toISOString().slice(11, 23)} - ${msg}`);
  };

  try {
    log('=== ENRICHMENT DEBUG TEST ===');

    // Check for contact ID in query params
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');

    // Use service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        error: 'Missing Supabase configuration',
        logs,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get specific contact or most recent
    log(contactId ? `Fetching contact ${contactId}...` : 'Fetching most recent contact...');

    let query = supabase.from('contacts').select('*');
    if (contactId) {
      query = query.eq('id', contactId);
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: contacts, error: fetchError } = await query.limit(1);

    if (fetchError) {
      log(`ERROR fetching contacts: ${fetchError.message}`);
      return NextResponse.json({ error: fetchError.message, logs });
    }

    if (!contacts || contacts.length === 0) {
      log('No contacts found in database');
      return NextResponse.json({ error: 'No contacts found', logs });
    }

    const contact = contacts[0];
    log(`Found contact: ${contact.id}`);
    log(`  - first_name: ${contact.first_name || 'NULL'}`);
    log(`  - last_name: ${contact.last_name || 'NULL'}`);
    log(`  - company: ${contact.company || 'NULL'}`);
    log(`  - email: ${contact.email || 'NULL'}`);
    log(`  - phone: ${contact.phone || 'NULL'}`);
    log(`  - job_title: ${contact.job_title || 'NULL'}`);
    log(`  - enrichment_status: ${contact.enrichment_status}`);
    log(`  - reputation_score: ${contact.reputation_score || 'NULL'}`);
    log(`  - gmb_reviews: ${contact.gmb_reviews ? JSON.stringify(contact.gmb_reviews).slice(0, 100) : 'NULL'}`);
    log(`  - social_media: ${contact.social_media ? JSON.stringify(contact.social_media) : 'NULL'}`);

    // Test company extraction from email
    let effectiveCompany = contact.company;
    if (!contact.company && contact.email) {
      const companyFromEmail = extractCompanyFromEmail(contact.email);
      log(`Company from email: "${contact.email}" -> "${companyFromEmail}"`);
      effectiveCompany = companyFromEmail;
    }

    log(`Effective company name: ${effectiveCompany || 'NONE'}`);

    // Test GMB search with effective company
    if (effectiveCompany) {
      const phone = contact.phone || null;
      log(`Testing GMB search for: "${effectiveCompany}" with phone: ${phone}`);

      const gmbResult = await searchGoogleMapsBusiness(effectiveCompany, undefined, undefined, phone);

      log(`GMB Search Result:`);
      log(`  - success: ${gmbResult.success}`);
      log(`  - name: ${gmbResult.name || 'NULL'}`);
      log(`  - rating: ${gmbResult.rating || 'NULL'}`);
      log(`  - review_count: ${gmbResult.review_count || 'NULL'}`);
      log(`  - reviews found: ${gmbResult.reviews.length}`);
      log(`  - photos found: ${gmbResult.photos.length}`);
      log(`  - website: ${gmbResult.website || 'NULL'}`);
      log(`  - error: ${gmbResult.error || 'NONE'}`);

      if (gmbResult.reviews.length > 0) {
        log(`  First review: ${gmbResult.reviews[0].author} - ${gmbResult.reviews[0].rating} stars - "${gmbResult.reviews[0].text.slice(0, 50)}..."`);
      }

      // Now test updating the database
      log('Testing database update...');

      const updateData = {
        reputation_score: gmbResult.rating,
        review_count: gmbResult.review_count,
        gmb_reviews: gmbResult.reviews.length > 0 ? gmbResult.reviews : null,
        gmb_photos: gmbResult.photos.length > 0 ? gmbResult.photos : null,
        gmb_place_id: gmbResult.place_id,
        review_source: gmbResult.success ? 'serpapi_gmb' : null,
        enrichment_status: 'completed',
      };

      const { error: updateError } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', contact.id);

      if (updateError) {
        log(`DATABASE UPDATE ERROR: ${updateError.message}`);
        log(`  Code: ${updateError.code}`);
        log(`  Details: ${JSON.stringify(updateError.details)}`);
      } else {
        log('DATABASE UPDATE SUCCESS!');
      }

      // Verify the update
      const { data: updatedContact, error: verifyError } = await supabase
        .from('contacts')
        .select('reputation_score, review_count, gmb_reviews, enrichment_status')
        .eq('id', contact.id)
        .single();

      if (verifyError) {
        log(`VERIFY ERROR: ${verifyError.message}`);
      } else {
        log('Verification read:');
        log(`  - reputation_score: ${updatedContact.reputation_score}`);
        log(`  - review_count: ${updatedContact.review_count}`);
        log(`  - gmb_reviews count: ${updatedContact.gmb_reviews?.length || 0}`);
        log(`  - enrichment_status: ${updatedContact.enrichment_status}`);
      }

      return NextResponse.json({
        contact: {
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          company: contact.company,
          email: contact.email,
          effectiveCompany,
        },
        gmbResult: {
          success: gmbResult.success,
          name: gmbResult.name,
          rating: gmbResult.rating,
          reviewCount: gmbResult.review_count,
          reviewsFound: gmbResult.reviews.length,
          photosFound: gmbResult.photos.length,
          error: gmbResult.error,
        },
        databaseUpdate: updateError ? { error: updateError.message } : { success: true },
        verification: updatedContact || null,
        logs,
      });
    } else {
      log('NO COMPANY NAME AVAILABLE - Cannot search GMB');
      return NextResponse.json({
        error: 'No company name available from OCR or email',
        contact: {
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          company: contact.company,
          email: contact.email,
        },
        logs,
      });
    }
  } catch (error) {
    log(`FATAL ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      logs,
    });
  }
}
