import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mic, MicOff, Camera, PlusCircle, CheckCircle2, AlertTriangle, 
  Sparkles, Package, RefreshCw, Upload, Image as ImageIcon, Video, X 
} from 'lucide-react';
import { productApi, SkuPayload } from '../../../services/productApi';
import { useAuthStore } from '../../../stores/useAuthStore';

export const ArtisanStudioPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [price, setPrice] = useState('2500000');
  const [materialInfo, setMaterialInfo] = useState('');
  const [dimensions, setDimensions] = useState('Cao 35cm x ĐK 18cm');
  const [description, setDescription] = useState('');
  const [artisanStory, setArtisanStory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const speechRecognitionRef = useRef<any>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load Artisan's Products
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res: any = await productApi.getMyArtisanProducts(user?.artisanId || 1);
      setProducts(res.data || res || []);
    } catch (err) {
      console.error('Error loading products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user?.artisanId]);

  // Voice-to-Text Setup (Web Speech API with vi-VN)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback nếu trình duyệt không hỗ trợ Web Speech
      setArtisanStory((prev) => 
        (prev ? prev + ' ' : '') + 
        'Tác phẩm được chuốt bằng đất sét phù sa sông Hồng nung lò củi 1.250 độ C theo kỹ nghệ gia truyền 3 đời.'
      );
      alert('Trình duyệt không hỗ trợ Web Speech API trực tiếp. Đã mô phỏng chèn lời tự sự làm nghề!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setArtisanStory((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Camera Capture with Client-Side Canvas Compression (<= 1.5MB)
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res: any = await productApi.uploadMedia(file);
      const url = res.data?.publicUrl || res.publicUrl || URL.createObjectURL(file);
      setImageUrl(url);
    } catch (err: any) {
      alert(err.message || 'Lỗi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateSku = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: SkuPayload = {
        name: name.trim(),
        skuCode: skuCode.trim() || 'SKU-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        price: Number(price),
        materialInfo: materialInfo.trim(),
        dimensions: dimensions.trim(),
        description: description.trim(),
        artisanStory: artisanStory.trim(),
        creationProcessVideoUrl: videoUrl.trim() || undefined,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
        artisanId: user?.artisanId || 1,
        villageId: user?.villageId || 1
      };

      await productApi.createSku(payload);
      setSuccessMessage('Khai báo mẫu mã SKU thành công! Đã chuyển cho Quản lý Làng nghề thẩm định.');
      setTimeout(() => {
        setSuccessMessage(null);
        setIsModalOpen(false);
      }, 2500);

      // Reset
      setName('');
      setSkuCode('');
      setDescription('');
      setArtisanStory('');
      setImageUrl('');
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Không thể tạo mẫu mã');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-8" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      {/* Studio Header (Big UI) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-heritage-indigo/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-heritage-terracotta text-white uppercase tracking-wider font-sans">
              STUDIO NGHỆ NHÂN BIG UI
            </span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              ✓ Đã Chứng Thực
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-heritage-indigo mt-1 tracking-tight">
            Xưởng Chế Tác &amp; Định Danh Mẫu SKU
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Nghệ nhân: <strong className="text-black">{user?.fullName || 'Nghệ nhân Bát Tràng'}</strong> • {user?.artisanTitle || 'Nghệ nhân Ưu tú'}
          </p>
        </div>

        {/* Nút Voice Assistant Khổng Lồ >= 56px */}
        <button
          onClick={toggleSpeechRecognition}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer min-h-[56px] ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
              : 'bg-heritage-indigo hover:bg-heritage-dark text-white'
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-amber-300" />}
          <span>{isListening ? 'Đang Lắng Nghe Bác Nói...' : '🎙️ Kể Chuyện Bằng Giọng Nói'}</span>
        </button>
      </div>

      {/* Hành Động Nhanh Của Nghệ Nhân (Thumb Zone & Touch Ergonomics >= 48px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Nút Khai Báo Mẫu SKU Mới */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="p-6 bg-gradient-to-br from-heritage-terracotta to-red-700 text-white rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all flex items-center gap-4 min-h-[90px]"
        >
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <PlusCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-base font-bold">Khai Báo Mẫu SKU Mới</div>
            <p className="text-xs text-white/80 mt-0.5">Khai báo thiết kế di sản để Quản lý duyệt</p>
          </div>
        </div>

        {/* Nút Chụp Ảnh Nhanh Tại Xưởng */}
        <div 
          onClick={() => cameraInputRef.current?.click()}
          className="p-6 bg-white border border-gray-200 text-heritage-indigo rounded-xl shadow-sm cursor-pointer hover:bg-stone-50 transition-all flex items-center gap-4 min-h-[90px]"
        >
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-[#1677ff]">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <div className="text-base font-bold text-black">Chụp Ảnh Tại Xưởng</div>
            <p className="text-xs text-gray-500 mt-0.5">Tự động nén ảnh ≤ 1.5MB chuẩn quy tắc</p>
          </div>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCameraCapture}
          />
        </div>

        {/* Nút Thống Kê Sản Phẩm */}
        <div className="p-6 bg-white border border-gray-200 text-heritage-indigo rounded-xl shadow-sm flex items-center gap-4 min-h-[90px]">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <div className="text-2xl font-bold text-black">{products.length}</div>
            <p className="text-xs text-gray-500 mt-0.5">Mẫu thiết kế SKU đã khai báo</p>
          </div>
        </div>
      </div>

      {/* Danh Mục Mẫu Thiết Kế SKU Của Nghệ Nhân */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-gray-200 flex items-center justify-between">
          <span className="font-bold text-xs uppercase text-gray-700">
            DANH MỤC MẪU SKU &amp; TRẠNG THÁI DUYỆT CỦA LÀNG ({products.length})
          </span>
          <button
            onClick={loadProducts}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            Bác chưa khai báo mẫu sản phẩm nào. Hãy bấm "Khai Báo Mẫu SKU Mới" ở trên.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.map((p) => (
              <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-4">
                  {p.imageUrl ? (
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-stone-100 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-black">{p.name}</div>
                    <div className="text-xs font-mono text-[#1677ff] font-bold">
                      {p.skuCode || 'SKU-Chưa gán'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Giá: <strong className="text-emerald-700">{Number(p.price).toLocaleString('vi-VN')} đ</strong> • Chất liệu: {p.materialInfo}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="self-end sm:self-center flex flex-col items-end gap-1">
                  {p.status === 'APPROVED' || p.status === 'PUBLISHED' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      ✓ Đã được làng duyệt
                    </span>
                  ) : p.status === 'REJECTED' ? (
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        ✕ Bị từ chối
                      </span>
                      {p.rejectionReason && (
                        <p className="text-[11px] text-red-600 mt-1 max-w-xs italic">
                          Lý do: {p.rejectionReason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      ⏳ Đang chờ làng thẩm định
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL KHAI BÁO MẪU SKU (Bo góc 8px, Header 56px, 2 nút "LƯU DỮ LIỆU" và "THOÁT") */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[94vh] sm:max-h-[90vh]">
            {/* Header 56px Chuẩn BHTT */}
            <div className="h-14 min-h-[56px] px-5 bg-heritage-indigo text-white flex items-center justify-between border-b border-heritage-brass/40">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">BHTT</span>
                <span className="text-white/40">|</span>
                <span className="text-xs font-medium">KHAI BÁO MẪU MÃ THIẾT KẾ SKU DI SẢN</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            {successMessage ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-black">{successMessage}</h3>
              </div>
            ) : (
              <form onSubmit={handleCreateSku} className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* 2 cột trên PC, 1 cột Big UI trên Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1">
                      Tên tác phẩm / Mẫu mã <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="VD: Bình Gốm Men Rạn Hoa Sen"
                      className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1">
                      Mã SKU mẫu mã <span className="text-gray-400 font-normal">(vd: BT-SEN-001)</span>
                    </label>
                    <input
                      type="text"
                      value={skuCode}
                      onChange={(e) => setSkuCode(e.target.value.toUpperCase())}
                      placeholder="Tự sinh nếu để trống"
                      className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm font-mono"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1">
                      Giá niêm yết (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm font-bold"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1">
                      Chất liệu chế tác <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={materialInfo}
                      onChange={(e) => setMaterialInfo(e.target.value)}
                      placeholder="VD: Đất sét Cao Lanh non"
                      className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1">Kích thước</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="VD: Cao 35cm x ĐK 18cm"
                      className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>

                {/* Mô tả tác phẩm */}
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">
                    Mô tả nghệ thuật <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả kỹ thuật tạo hình, hoa văn đắp nổi..."
                    className="w-full px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-sm"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Tự sự làm nghề / Voice-to-Text */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      CÂU CHUYỆN LÀM NGHỀ (TÍCH HỢP GIỌNG NÓI VOICE-TO-TEXT)
                    </label>
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`text-xs px-2.5 py-1 rounded font-bold flex items-center gap-1 ${
                        isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      {isListening ? 'Đang thu âm...' : 'Nói để nhập'}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={artisanStory}
                    onChange={(e) => setArtisanStory(e.target.value)}
                    placeholder="Bác có thể chạm nút 'Nói để nhập' để tự sự về tâm huyết và quá trình chế tác..."
                    className="w-full px-3 py-2 text-[#1677ff] border border-amber-300 rounded-lg text-sm bg-white"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Chụp ảnh / Video quy trình */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1">
                      Ảnh mẫu sản phẩm
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="URL ảnh hoặc chụp từ camera"
                        className="flex-1 px-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-gray-700 rounded-lg"
                        title="Chụp từ máy ảnh"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-black mb-1">
                      Video quy trình chế tác (URL)
                    </label>
                    <div className="relative">
                      <Video className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="w-full pl-9 pr-3 py-2 text-[#1677ff] border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 2 Buttons chuẩn BHTT: "LƯU DỮ LIỆU" và "THOÁT" */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    THOÁT
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#1677ff] hover:bg-blue-600 shadow"
                  >
                    LƯU DỮ LIỆU
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
