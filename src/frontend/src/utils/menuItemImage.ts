/**
 * Utility functions for handling menu item image selection and conversion
 */

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate if a file is a valid image
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)',
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: 'Image size must be less than 5MB',
    };
  }

  return { valid: true };
}

/**
 * Convert a File to Uint8Array for blob storage
 */
export async function fileToBytes(file: File): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result) as Uint8Array<ArrayBuffer>);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Create an object URL for preview
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke an object URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
