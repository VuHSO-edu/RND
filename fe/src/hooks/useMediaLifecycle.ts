import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook quản lý vòng đời Media để triệt tiêu rò rỉ bộ nhớ (Memory Leaks)
 * Tự động gọi URL.revokeObjectURL() khi thay đổi ảnh và khi component unmount
 * Bảo vệ trình duyệt di động (iOS Safari / Android) không bị crash khi chụp nhiều ảnh
 */
export function useMediaLifecycle() {
  const activeUrlsRef = useRef<Set<string>>(new Set());

  // Tạo URL và đăng ký vào danh sách quản lý
  const createManagedUrl = useCallback((blobOrFile: Blob | File): string => {
    const url = URL.createObjectURL(blobOrFile);
    activeUrlsRef.current.add(url);
    return url;
  }, []);

  // Thu hồi một URL cụ thể
  const revokeUrl = useCallback((url: string | null | undefined) => {
    if (url && activeUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      activeUrlsRef.current.delete(url);
    }
  }, []);

  // Thu hồi toàn bộ URL đang quản lý
  const revokeAllUrls = useCallback(() => {
    activeUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    activeUrlsRef.current.clear();
  }, []);

  // Tự động dọn dẹp toàn bộ bộ nhớ khi component unmount
  useEffect(() => {
    return () => {
      activeUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      activeUrlsRef.current.clear();
    };
  }, []);

  return {
    createManagedUrl,
    revokeUrl,
    revokeAllUrls
  };
}

/**
 * Hook quản lý vòng đời Web Speech Recognition & Phản hồi Rung cảm ứng (Haptic Feedback)
 * Đảm bảo dừng mic khi rời màn hình và rung điện thoại để báo hiệu cho nghệ nhân
 */
export function useSpeechLifecycle({
  onResult,
  onError,
  lang = 'vi-VN'
}: {
  onResult: (text: string) => void;
  onError?: (err: any) => void;
  lang?: string;
}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Kích hoạt Rung phản hồi cảm ứng (Haptic Feedback)
  const triggerHaptic = useCallback((pattern: number[] = [50, 100, 50]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Trình duyệt không cấp quyền rung -> bỏ qua
      }
    }
  }, []);

  const toggleSpeech = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      triggerHaptic([40]); // Rung nhẹ khi tắt mic
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Trình duyệt hiện tại chưa hỗ trợ Web Speech API trực tiếp.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        triggerHaptic([50, 100, 50]); // Rung xác nhận bắt đầu thu âm
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          onResult(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.error('Lỗi nhận diện giọng nói:', err);
        setIsListening(false);
        if (onError) onError(err);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  }, [isListening, lang, onResult, onError, triggerHaptic]);

  // Giải phóng Microphone khi unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Bỏ qua lỗi stop khi đã đóng
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    toggleSpeech,
    triggerHaptic
  };
}

/**
 * Hook tự động lưu Bản nháp (Auto-Save Draft) vào LocalStorage
 * Ngăn chặn việc mất trắng nội dung khi hết phiên (Token Expired) hoặc vô tình reload trang
 */
export function useFormDraft<T extends Record<string, any>>(draftKey: string, initialValues: T) {
  const [data, setData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`draft_${draftKey}`);
      if (saved) {
        return { ...initialValues, ...JSON.parse(saved) };
      }
    } catch (e) {
      // Bỏ qua nếu lỗi parse
    }
    return initialValues;
  });

  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    return !!localStorage.getItem(`draft_${draftKey}`);
  });

  // Tự động lưu khi data thay đổi
  const saveDraft = useCallback((newData: Partial<T>) => {
    setData((prev) => {
      const merged = { ...prev, ...newData };
      try {
        localStorage.setItem(`draft_${draftKey}`, JSON.stringify(merged));
        setHasDraft(true);
      } catch (e) {
        console.error('Không thể lưu bản nháp:', e);
      }
      return merged;
    });
  }, [draftKey]);

  // Xóa bản nháp sau khi submit thành công
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`draft_${draftKey}`);
      setHasDraft(false);
    } catch (e) {
      console.error('Không thể xóa bản nháp:', e);
    }
  }, [draftKey]);

  return {
    data,
    saveDraft,
    clearDraft,
    hasDraft
  };
}
