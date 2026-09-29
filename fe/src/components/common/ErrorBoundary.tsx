import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BHTT ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-[#f0f2f5] font-['Tahoma',sans-serif]">
          <div className="w-full max-w-lg bg-white rounded-lg border border-red-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header 56px chuẩn BHTT */}
            <div className="h-14 min-h-[56px] px-6 bg-heritage-indigo text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide">BHTT</span>
                <span className="text-white/40">|</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>THÔNG BÁO HỆ THỐNG</span>
                </div>
              </div>
            </div>

            {/* Nội dung thông báo lỗi */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    Không thể hiển thị nội dung trang này
                  </h3>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    Hệ thống ghi nhận sự gián đoạn trong quá trình xử lý dữ liệu. Vui lòng tải lại trang hoặc quay về trang chủ.
                  </p>
                </div>
              </div>

              {process.env.NODE_ENV !== 'production' && this.state.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-800 max-h-36 overflow-auto">
                  {this.state.error.toString()}
                </div>
              )}

              {/* Thanh thao tác nút bấm chuẩn Neo-Heritage */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  THOÁT VỀ TRANG CHỦ
                </button>
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="px-6 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#1677ff] hover:bg-blue-600 shadow flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  TẢI LẠI TRANG
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
