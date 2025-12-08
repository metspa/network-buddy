// Supabase Storage helpers for business card images
import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'business-cards';

/**
 * Upload a business card image to Supabase Storage (server-side)
 * Images are stored in user-specific folders: {userId}/{timestamp}-{filename}
 */
export async function uploadBusinessCardImage(
  file: File,
  userId: string
): Promise<{ path: string; url: string; error: Error | null }> {
  try {
    const supabase = await createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl,
      error: null,
    };
  } catch (error) {
    return {
      path: '',
      url: '',
      error: error instanceof Error ? error : new Error('Failed to upload image'),
    };
  }
}

/**
 * Upload a business card image from buffer (for API routes)
 */
export async function uploadBusinessCardImageFromBuffer(
  buffer: Buffer,
  fileName: string,
  userId: string
): Promise<{ path: string; url: string; error: Error | null }> {
  try {
    const supabase = await createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${uniqueFileName}`;

    // Upload buffer
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl,
      error: null,
    };
  } catch (error) {
    return {
      path: '',
      url: '',
      error: error instanceof Error ? error : new Error('Failed to upload image'),
    };
  }
}

/**
 * Delete a business card image from storage
 */
export async function deleteBusinessCardImage(filePath: string): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Failed to delete image'),
    };
  }
}

/**
 * Client-side upload helper
 */
export async function uploadBusinessCardImageClient(
  file: File
): Promise<{ path: string; url: string; error: Error | null }> {
  try {
    const supabase = createBrowserClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl,
      error: null,
    };
  } catch (error) {
    return {
      path: '',
      url: '',
      error: error instanceof Error ? error : new Error('Failed to upload image'),
    };
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error: string | null } {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { valid: true, error: null };
}

/**
 * Compress image before upload (client-side)
 */
export async function compressImage(file: File, maxWidth = 1200): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create new file
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          0.9 // Quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
