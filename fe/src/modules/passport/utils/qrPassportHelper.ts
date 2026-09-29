import QRCode from 'qrcode';
import jsQR from 'jsqr';

/**
 * Trích xuất mã Hộ chiếu chuẩn hóa (VD: VN-BT882194) từ chuỗi quét thô, URL hoặc JSON
 */
export function extractPassportCode(rawInput: string): string {
  if (!rawInput) return '';
  const trimmed = rawInput.trim();

  // 1. Kiểm tra nếu là JSON object
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.passportCode) return String(parsed.passportCode).trim().toUpperCase();
    if (parsed.code) return String(parsed.code).trim().toUpperCase();
    if (parsed.id) return String(parsed.id).trim().toUpperCase();
  } catch {
    // Không phải JSON, tiếp tục xử lý
  }

  // 2. Kiểm tra nếu là URL chứa path /passport/VN-...
  const pathMatch = trimmed.match(/passport\/([A-Za-z0-9_-]+)/i);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1].toUpperCase();
  }

  // 3. Kiểm tra query param ?code=...
  const queryMatch = trimmed.match(/[?&]code=([A-Za-z0-9_-]+)/i);
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1].toUpperCase();
  }

  // 4. Tìm chuỗi khớp mẫu tiền tố mã di sản VN-XXXXX
  const vnMatch = trimmed.match(/(VN-[A-Z0-9_-]+)/i);
  if (vnMatch && vnMatch[1]) {
    return vnMatch[1].toUpperCase();
  }

  // 5. Chuỗi thô bất kỳ (chuyển sang chữ hoa không dấu)
  return trimmed.replace(/\s+/g, '').toUpperCase();
}

/**
 * Lấy URL tra cứu công khai chính thức của Hộ chiếu
 */
export function getPassportCanonicalUrl(passportCode: string): string {
  const code = (passportCode || '').trim().toUpperCase();
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/passport?code=${encodeURIComponent(code)}`;
  }
  return `https://heritage.vn/passport/${encodeURIComponent(code)}`;
}

/**
 * Tạo Data URL của mã QR chất lượng cao (PNG)
 */
export async function generatePassportQrDataUrl(
  passportCode: string,
  options?: {
    width?: number;
    margin?: number;
    colorDark?: string;
    colorLight?: string;
  }
): Promise<string> {
  const url = getPassportCanonicalUrl(passportCode);
  return QRCode.toDataURL(url, {
    width: options?.width || 800,
    margin: options?.margin !== undefined ? options.margin : 2,
    color: {
      dark: options?.colorDark || '#1A365D', // Màu xanh men lam Neo-Heritage
      light: options?.colorLight || '#FFFFFF'
    },
    errorCorrectionLevel: 'H' // High error tolerance (30%)
  });
}

/**
 * Tạo mã QR định dạng vector SVG
 */
export async function generatePassportQrSvg(
  passportCode: string,
  options?: {
    width?: number;
    margin?: number;
    colorDark?: string;
    colorLight?: string;
  }
): Promise<string> {
  const url = getPassportCanonicalUrl(passportCode);
  return QRCode.toString(url, {
    type: 'svg',
    width: options?.width || 800,
    margin: options?.margin !== undefined ? options.margin : 2,
    color: {
      dark: options?.colorDark || '#1A365D',
      light: options?.colorLight || '#FFFFFF'
    },
    errorCorrectionLevel: 'H'
  });
}

/**
 * Giải mã mã QR từ tệp tin hình ảnh được tải lên hoặc kéo thả
 */
export async function decodeQrFromImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Tệp tải lên không phải là định dạng hình ảnh hợp lệ.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh.'));

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Lỗi giải mã dữ liệu hình ảnh.'));

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            return reject(new Error('Trình duyệt không hỗ trợ Canvas 2D.'));
          }

          // Kích thước tối ưu cho giải mã QR
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, width, height);
          const codeResult = jsQR(imageData.data, width, height, {
            inversionAttempts: 'attemptBoth'
          });

          if (codeResult && codeResult.data) {
            const extracted = extractPassportCode(codeResult.data);
            return resolve(extracted);
          }

          // Thử lần 2: Tăng độ tương phản (Binarization filter) nếu ảnh chụp hơi mờ
          const d = imageData.data;
          for (let i = 0; i < d.length; i += 4) {
            const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
            const threshold = avg > 128 ? 255 : 0;
            d[i] = threshold;
            d[i + 1] = threshold;
            d[i + 2] = threshold;
          }
          ctx.putImageData(imageData, 0, 0);

          const secondPass = jsQR(d, width, height, {
            inversionAttempts: 'attemptBoth'
          });

          if (secondPass && secondPass.data) {
            const extracted = extractPassportCode(secondPass.data);
            return resolve(extracted);
          }

          reject(new Error('Không tìm thấy mã QR hợp lệ trong ảnh. Vui lòng chọn ảnh rõ nét hơn.'));
        } catch (err: any) {
          reject(new Error(err?.message || 'Lỗi phân tích mã QR.'));
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
