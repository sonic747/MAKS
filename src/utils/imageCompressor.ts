/**
 * Utility to compress image files client-side before uploading to Firestore or local DB.
 * Firestore document maximum size is 1,048,576 bytes (1 MB).
 * This utility resizes and compresses images to JPEG under 450 KB, preserving high visual quality
 * while preventing any Firestore 1MB document limit exceed error.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  maxSizeBytes?: number; // target size in bytes, default 450KB
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.8,
    maxSizeBytes = 450 * 1024, // 450 KB limit
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = (e) => reject(e);
    reader.onload = () => {
      const img = new Image();
      img.onerror = (e) => reject(e);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Compress progressively if size is still too large
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);

        // If data URL length exceeds maxSizeBytes (approx bytes = base64.length * 0.75)
        let estimatedBytes = dataUrl.length * 0.75;
        let iterations = 0;
        while (estimatedBytes > maxSizeBytes && currentQuality > 0.4 && iterations < 4) {
          currentQuality -= 0.15;
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          estimatedBytes = dataUrl.length * 0.75;
          iterations++;
        }

        resolve(dataUrl);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress an existing base64 data URL if it exceeds the limit
 */
export async function compressDataUrl(
  dataUrl: string,
  options: CompressOptions = {}
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.8,
    maxSizeBytes = 450 * 1024,
  } = options;

  // If already small enough (under 400KB), return as is
  if (dataUrl.length * 0.75 <= maxSizeBytes) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      let curQ = quality;
      let result = canvas.toDataURL('image/jpeg', curQ);
      while (result.length * 0.75 > maxSizeBytes && curQ > 0.4) {
        curQ -= 0.15;
        result = canvas.toDataURL('image/jpeg', curQ);
      }
      resolve(result);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
