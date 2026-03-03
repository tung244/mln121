# TÀI LIỆU ĐẶC TẢ YÊU CẦU DỰ ÁN (PRD)
**Tên sản phẩm:** KHỐI LẬP PHƯƠNG ĐỔI MỚI (The Innovation Cube)
**Sự kiện:** Triển lãm và Talkshow "14 Khoảnh khắc mùa xuân"
**Địa điểm tổ chức:** Hội trường tầng 5 - Gamma, Trường Đại học FPT Hà Nội
**Phân khu:** KHU VỰC 3. MÙA XUÂN ĐỔI MỚI (Giai đoạn Đại hội VI - XI)
**Chủ đề học thuật:** Kinh tế thị trường định hướng xã hội chủ nghĩa, cách mạng công nghiệp
**Thời gian phát triển (Sprint):** 07 ngày

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
### 1.1. Bối cảnh
Nhằm hưởng ứng triển lãm "14 Khoảnh khắc mùa xuân", dự án được xây dựng để trưng bày các sản phẩm sáng tạo của sinh viên tham gia vào triển lãm. Sản phẩm nhằm góp phần đổi mới phương pháp dạy – học theo hướng sáng tạo, lấy người học làm trung tâm, chuyển hóa các kiến thức vĩ mô của môn Kinh tế chính trị Mác - Lênin thành một trải nghiệm công nghệ trực quan.

### 1.2. Mục tiêu (Objectives)
* **Về học thuật:** Giúp sinh viên vận dụng kiến thức Lý luận chính trị vào thực tiễn xã hội, cụ thể là hiểu rõ sự lột xác của nền kinh tế sang Kinh tế thị trường định hướng xã hội chủ nghĩa và cách mạng công nghiệp.
* **Về công nghệ:** Tạo không gian học tập – trải nghiệm dưới dạng Web Application kết hợp không gian 3D tương tác theo thời gian thực (Real-time 3D Rendering) và Trí tuệ nhân tạo (Generative AI).

## 2. CHÂN DUNG NGƯỜI DÙNG (USER PERSONAS)
1. **Giảng viên / Ban Giám khảo (Tổ LLCT):** Những người kiểm tra khắt khe về tính chính xác của kiến thức lịch sử Đảng và Kinh tế chính trị. Cần giao diện dễ thao tác, có chiều sâu học thuật.
2. **Sinh viên tham quan:** Đối tượng mục tiêu cần được khích lệ, phát huy niềm yêu thích, đam mê học tập, nghiên cứu lịch sử. Yêu thích sự mới mẻ, các hiệu ứng thị giác (Wow-factor), thích tương tác (Gamification) thay vì chỉ đọc chữ.

## 3. ĐẶC TẢ YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS - FR)

Dưới đây là chi tiết các module chức năng hệ thống cần đáp ứng:

| Mã FR | Tên Chức năng | Mô tả chi tiết (User Story) | Tiêu chí nghiệm thu (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **FR1** | **Hiển thị Không gian 3D cốt lõi** | Người dùng (ND) có thể nhìn thấy một sa bàn 3D ở giữa màn hình, có thể dùng chuột kéo để xoay góc nhìn 360 độ và cuộn chuột để phóng to/thu nhỏ. | - Sa bàn tải thành công dưới 3 giây.<br>- Thao tác xoay/zoom mượt mà (60fps).<br>- Giới hạn góc zoom để ND không bị lọt vào bên trong vật thể. |
| **FR2** | **Điều hướng Thời gian (Timeline Slider)** | ND kéo thanh trượt từ mốc 1986 đến 2011 để xem sự khởi xướng, kiên định và phát triển đường lối Đổi mới, công nghiệp hoá, hiện đại hoá đất nước qua các kỳ Đại hội VI - XI. Khối 3D sẽ lột xác tương ứng với mốc thời gian. | - Thanh trượt có min=1986, max=2011.<br>- **Mốc 1986:** Hiển thị nhà máy cũ (khói đen), rào chắn, cửa hàng mậu dịch.<br>- **Mốc 2011:** Hiển thị nhà máy robot, cảng biển hội nhập, trung tâm thương mại kính.<br>- Hiệu ứng chuyển đổi (Morphing/Opacity) diễn ra mượt mà theo giá trị thanh trượt. |
| **FR3** | **Cập nhật Chỉ số Vĩ mô (Real-time HUD)** | Khi ND kéo thanh trượt (FR2), hệ thống biểu đồ và các chỉ số kinh tế trên màn hình HUD sẽ thay đổi theo số liệu giả lập tương ứng với thời kỳ đó. | - Số lạm phát năm 1986 hiển thị màu đỏ rực, mức ~700%. Kéo về sau giảm dần xuống 1 chữ số (màu xanh).<br>- Cột đồ thị Tăng trưởng xuất khẩu tự động kéo cao lên theo thời gian.<br>- Các con số có hiệu ứng nhảy số (Count-up animation). |
| **FR4** | **Tương tác Gỡ rối cơ chế (Gamification)** | ND thấy 3 đốm đỏ nhấp nháy trên mô hình ở mốc 1986. ND click vào đốm đỏ để giải quyết điểm nghẽn nhằm khơi dậy sức mạnh kinh tế và hội nhập. | - Đốm đỏ có hiệu ứng Pulse (nhịp đập) thu hút sự chú ý.<br>- Khi click trúng, phát âm thanh "Ting", đốm đỏ biến mất, bắn tia sáng.<br>- Hiển thị Popup Toast thông báo: "+100 Điểm Đổi Mới!". |
| **FR5** | **Trợ lý AI Cố vấn (AI Chatbox)** | ND có thể gõ câu hỏi vào khung chat ở góc phải. Hệ thống sử dụng AI đóng vai chuyên gia để trả lời các câu hỏi về Kinh tế chính trị. | - Khung chat có UI dạng hội thoại (Glassmorphism).<br>- Có hiệu ứng "AI đang gõ..." khi chờ phản hồi.<br>- Trả lời đúng trọng tâm về Kinh tế thị trường định hướng xã hội chủ nghĩa, không bịa đặt kiến thức lịch sử.<br>- Thời gian phản hồi API dưới 2 giây. |

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)
* **Giao diện (UI/UX):** * Sử dụng phong cách thiết kế **Sci-fi / Glassmorphism** (kính mờ, đổ bóng viền neon).
    * Bố cục chia lớp rõ ràng: Lớp dưới cùng là Không gian 3D (Z-index: 0), lớp phủ bên trên là Bảng điều khiển và Text (Z-index: 10+).
    * Phông chữ: `Inter` hoặc `Roboto Mono` cho các đoạn hiển thị số liệu.
* **Hiệu suất (Performance):** Trang web phải chạy mượt trên các thiết bị trình chiếu. Các model 3D phải được tối ưu hóa số lượng đa giác (Low-poly).
* **Khả năng tương thích:** Tối ưu hóa hiển thị cho màn hình ngang (Landscape - 16:9) phục vụ việc trình chiếu tại Hội trường tầng 5 - Gamma.

## 5. THIẾT KẾ LUỒNG NGƯỜI DÙNG (USER FLOW)
1. **Khởi chạy:** ND mở trang web. Màn hình loading hiện ra (1-2s) -> Giao diện chính hiển thị trạng thái năm 1986.
2. **Khám phá ban đầu:** ND dùng chuột xoay sa bàn 3D để xem cơ chế bao cấp.
3. **Thao tác 1 (Gamification):** ND click vào các đốm đỏ (FR4) để sửa lỗi hệ thống kinh tế. Nhận điểm XP.
4. **Thao tác 2 (Timeline):** ND kéo thanh trượt dưới đáy màn hình sang phải (FR2). Sa bàn 3D bừng sáng, chuyển hóa thành thành phố công nghệ. Các chỉ số hai bên màn hình (FR3) nhảy múa liên tục.
5. **Thao tác 3 (Học thuật sâu):** ND gõ câu hỏi vào khung Chat AI (FR5). AI phân tích và đưa ra câu trả lời dựa trên đường lối Đổi mới.

## 6. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (TECH STACK)
* **Ngôn ngữ & Framework:** HTML5, CSS3, JavaScript (React.js / Vite).
* **Thư viện UI/CSS:** Tailwind CSS.
* **3D Engine:** Spline (spline.design) & package `@splinetool/react-spline`.
* **Data Visualization:** Chart.js.
* **AI Integration:** Google Cloud Console - Gemini API.
* **Hosting:** Vercel (CI/CD tự động).

## 7. KẾ HOẠCH TRIỂN KHAI (TIMELINE THỰC THI 7 NGÀY)
* **Ngày 1-2:** Hoàn thiện Model 3D trên Spline. Thiết lập State (1986 vs 2011) và Transition.
* **Ngày 3:** Dựng base React, chia Layout Glassmorphism (HUD, Slider, Chatbox).
* **Ngày 4:** Tích hợp API Spline vào React. Kết nối logic Thanh trượt <-> Khối 3D <-> Cập nhật dữ liệu HUD.
* **Ngày 5:** Tích hợp Gemini API. Viết System Prompt chuyên sâu về Lịch sử Đảng và Kinh tế chính trị.
* **Ngày 6:** Thêm hiệu ứng âm thanh, xử lý responsive màn hình, kiểm thử.
* **Ngày 7:** Deploy sản phẩm lên Vercel. Viết kịch bản demo trình bày tại Triển lãm.