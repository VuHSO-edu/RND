# TÀI LIỆU ĐẶC TẢ YÊU CẦU CHỨC NĂNG HỆ THỐNG
**Dự án:** Nền tảng Di sản Văn hóa & Thương mại Điện tử Làng nghề

---

## 1. Bảng tổng hợp tính năng

| STT | Phân nhóm tính năng | Tên chức năng | Mô tả chi tiết | Đối tượng sử dụng |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **1. Hộ chiếu di sản (Heritage Passport)** | Mã QR/NFC định danh sản phẩm | Gắn mã QR/NFC vật lý lên từng sản phẩm để tra cứu thông tin định danh độc bản của sản phẩm đó. | Nghệ nhân, Khách hàng |
| **2** | | Video quy trình chế tác | Hiển thị video tư liệu quy trình chế tác (dùng video chung hoặc theo từng dòng sản phẩm). | Khách hàng |
| **3** | | Câu chuyện nghệ nhân | Nội dung phỏng vấn, tâm huyết và tiểu sử của nghệ nhân tạo tác. | Khách hàng |
| **4** | | Chứng nhận nguồn gốc số | Tích hợp blockchain nhẹ (Polygon/BNB Chain hoặc permissioned blockchain) để lưu trữ chứng nhận bất biến, chống làm giả/chỉnh sửa. | Nghệ nhân, Khách hàng |
| **5** | | Tra cứu lịch sử sản phẩm | Cho phép người mua theo dõi hành trình của sản phẩm từ xưởng sản xuất đến tay mình. | Khách hàng |
| **6** | | Chống hàng giả | Cảnh báo khi phát hiện mã quét bất thường hoặc trùng lặp vị trí/thời gian. | Hệ thống, Khách hàng |
| **7** | **2. Thương mại điện tử** | Gian hàng số | Trang định danh riêng cho từng làng nghề/nghệ nhân trưng bày và bán sản phẩm. | Nghệ nhân, Khách hàng |
| **8** | | Giỏ hàng & thanh toán | Hỗ trợ đa dạng phương thức: ví điện tử, thẻ ngân hàng, COD; quản lý trạng thái đơn hàng và vận chuyển. | Khách hàng |
| **9** | | Bộ lọc & tìm kiếm | Tìm kiếm đa tiêu chí: chất liệu, vùng miền, mức giá, làng nghề truyền thống. | Khách hàng |
| **10** | | Đặt hàng theo yêu cầu | Chức năng đấu giá hoặc custom order cho các dòng sản phẩm thủ công cao cấp, độc bản. | Khách hàng, Nghệ nhân |
| **11** | | Đánh giá có xác thực | Chỉ tài khoản đã mua sản phẩm thành công mới được đánh giá, bảo đảm tính trung thực. | Khách hàng |
| **12** | | Gợi ý sản phẩm bằng AI | Đề xuất sản phẩm cá nhân hóa dựa trên lịch sử xem, hành vi và sở thích của khách hàng. | Khách hàng |
| **13** | **3. Dành cho nghệ nhân / làng nghề** | Đăng ký & xác thực hồ sơ | Đăng ký hồ sơ nghệ nhân, quy trình định danh (KYC đơn giản, thân thiện). | Nghệ nhân |
| **14** | | Công cụ tạo hộ chiếu di sản | Giao diện tối giản hóa để nghệ nhân lớn tuổi cũng có thể dễ dàng thao tác tạo Passport. | Nghệ nhân |
| **15** | | Quản lý kho & đơn hàng | Theo dõi số lượng tồn kho, xử lý đơn đặt, cập nhật trạng thái đóng gói và giao vận. | Nghệ nhân |
| **16** | | Ví thanh toán & rút tiền | Quản lý doanh thu bán hàng, thực hiện rút tiền về tài khoản ngân hàng liên kết. | Nghệ nhân |
| **17** | | Dashboard thống kê | Báo cáo trực quan: sản phẩm bán chạy, lượt quét QR/NFC, tỷ lệ khách hàng quay lại. | Nghệ nhân |
| **18** | **4. Cộng đồng & bảo tồn** | Bản đồ số làng nghề | Bản đồ tương tác hiển thị vị trí, lịch sử hình thành, số lượng nghệ nhân còn hoạt động. | Khách hàng, Cộng đồng |
| **19** | | Blog / Tạp chí văn hóa | Chuyên mục bài viết, phỏng vấn chuyên sâu kể câu chuyện văn hóa, lịch sử nghề truyền thống. | Khách hàng, Cộng đồng |
| **20** | | Tour trải nghiệm làng nghề | Đặt lịch tham quan, trải nghiệm thực tế (học làm gốm, dệt lụa,...) trực tiếp tại làng nghề. | Khách hàng |
| **21** | | Gây quỹ cộng đồng | Mô hình Crowdfunding hỗ trợ truyền nghề cho nghệ nhân trẻ hoặc phục dựng nghề có nguy cơ thất truyền. | Cộng đồng |
| **22** | **5. Quản trị hệ thống (Admin)** | Duyệt hồ sơ & sản phẩm | Kiểm duyệt thông tin nghệ nhân, tính hợp pháp và chất lượng sản phẩm trước khi mở bán. | Quản trị viên |
| **23** | | Quản lý blockchain ledger | Giám sát dữ liệu giao dịch/xác thực trên blockchain, giải quyết khiếu nại và tranh chấp nguồn gốc. | Quản trị viên |
| **24** | | Phân tích dữ liệu thị trường | Dashboard tổng quan: xu hướng tiêu dùng, báo cáo hiệu quả tài chính và kinh doanh toàn sàn. | Quản trị viên |
| **25** | | Quản lý phí & hoa hồng | Cấu hình mức thu phí hoa hồng giao dịch và biểu phí dịch vụ nền tảng. | Quản trị viên |
| **26** | **6. Mở rộng (Điểm cộng)** | Đa ngôn ngữ | Hỗ trợ chuyển đổi nhiều ngôn ngữ nhằm phục vụ khách du lịch nước ngoài và mục tiêu xuất khẩu. | Khách hàng |
| **27** | | Xem trước bằng AR | Quét và hiển thị mô hình 3D thực tế ảo (AR) của sản phẩm trong không gian thực trước khi mua. | Khách hàng |
| **28** | | Bảo trợ nghệ nhân | Gói subscription định kỳ cho người dùng đăng ký hỗ trợ tài chính cho một nghệ nhân cụ thể. | Khách hàng |
| **29** | | Tích điểm / NFT sưu tầm | Cơ chế thưởng điểm hoặc mint NFT độc bản cho khách hàng sưu tầm nhiều sản phẩm từ cùng một làng nghề. | Khách hàng |

---

## 2. Chi tiết phân loại theo tác nhân (Actors)

### Khách hàng & Cộng đồng
- Tra cứu Hộ chiếu di sản (QR/NFC, xem video, nguồn gốc blockchain, chống giả).
- Mua sắm (Bộ lọc, giỏ hàng, đặt hàng theo yêu cầu, thanh toán, đánh giá mua thật, nhận gợi ý AI).
- Khám phá di sản (Bản đồ số, blog văn hóa, đặt tour trải nghiệm, gây quỹ bảo tồn).
- Tính năng mở rộng: AR xem trước 3D, đa ngôn ngữ, gói bảo trợ nghệ nhân, NFT thành viên/sưu tầm.

### Nghệ nhân & Đại diện Làng nghề
- Khởi tạo Hộ chiếu di sản số và gắn mã QR/NFC.
- Quản trị gian hàng cá nhân / làng nghề.
- Tiếp nhận đơn đặt hàng riêng (custom/đấu giá).
- Quản trị vận hành: Quản lý kho, xử lý đơn, theo dõi doanh thu và rút tiền về ngân hàng.
- Báo cáo thống kê (lượt quét passport, doanh số, khách trung thành).

### Quản trị viên (Admin)
- Thẩm định hồ sơ nghệ nhân và phê duyệt sản phẩm niêm yết.
- Giám sát luồng blockchain ledger và giải quyết tranh chấp xác thực.
- Cấu hình tỷ lệ hoa hồng, biểu phí sàn.
- Khai thác báo cáo thị trường và định hướng phát triển nền tảng.