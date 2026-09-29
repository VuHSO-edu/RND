/**
 * Tiện ích nén ảnh phía Client trước khi upload lên MinIO Storage
 * Tuân thủ quy tắc Antigravity Rule: Nén ảnh camera xưởng (5-10MB) xuống <= 1.5MB
 */
export async function compressImageClientSide(
  file: File,
  maxSizeMB: number = 1.5,
  maxWidthOrHeight: number = 1920
): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Nếu ảnh đã nhỏ hơn mức trần thì giữ nguyên
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Giữ nguyên tỷ lệ, co về giới hạn maxWidthOrHeight
        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          } else {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Bắt đầu nén với chất lượng 0.85
        let quality = 0.85;

        const toBlobCallback = (blob: Blob | null) => {
          if (!blob) {
            resolve(file);
            return;
          }

          if (blob.size <= maxSizeBytes || quality <= 0.4) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            quality -= 0.15;
            canvas.toBlob(toBlobCallback, 'image/jpeg', quality);
          }
        };

        canvas.toBlob(toBlobCallback, 'image/jpeg', quality);
      };

      img.onerror = () => {
        resolve(file);
      };
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
}
