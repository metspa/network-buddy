import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function DELETE() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Delete user data in order (respecting foreign key constraints)
    // 1. Delete enrichment transactions
    await supabase
      .from('enrichment_transactions')
      .delete()
      .eq('user_id', userId);

    // 2. Delete contacts (this will also handle any associated data)
    const { data: contacts } = await supabase
      .from('contacts')
      .select('card_image_url')
      .eq('user_id', userId);

    // Delete card images from storage if they exist
    if (contacts && contacts.length > 0) {
      const imagePaths = contacts
        .filter((c) => c.card_image_url)
        .map((c) => {
          // Extract path from URL
          const url = c.card_image_url;
          if (url && url.includes('/storage/v1/object/public/')) {
            const parts = url.split('/storage/v1/object/public/');
            if (parts[1]) {
              return parts[1].replace('card-images/', '');
            }
          }
          return null;
        })
        .filter(Boolean) as string[];

      if (imagePaths.length > 0) {
        await supabase.storage.from('card-images').remove(imagePaths);
      }
    }

    await supabase.from('contacts').delete().eq('user_id', userId);

    // 3. Delete GHL integrations
    await supabase.from('ghl_integrations').delete().eq('user_id', userId);

    // 4. Delete user credits
    await supabase.from('user_credits').delete().eq('user_id', userId);

    // 5. Delete subscriptions
    await supabase.from('subscriptions').delete().eq('user_id', userId);

    // 6. Delete profile
    await supabase.from('profiles').delete().eq('id', userId);

    // 7. Delete the auth user using admin client
    // This requires the service role key
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
