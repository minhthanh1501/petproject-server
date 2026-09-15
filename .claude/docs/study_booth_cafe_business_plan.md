# KẾ HOẠCH TOÀN DIỆN: KINH DOANH QUÁN CÀ PHÊ TỰ HỌC DẠNG Ô/HỘP (STUDY BOOTH CAFE)

> **Định hướng cốt lõi:** Mô hình **walk-in + seat/session management**. Khách chủ yếu đến trực tiếp quán, kiểm tra chỗ trống, chọn gói, thanh toán tại quầy và nhận booth. **Booking online chỉ là tính năng bổ sung**, không phải luồng chính.

---

# 1. Tổng quan mô hình

## 1.1 Khái niệm

**Tên gọi:**
- Study Booth Cafe
- Micro-Study Space
- Study Cafe
- Cà phê tự học dạng ô/hộp

**Bản chất:**

Kết hợp giữa:
- Café
- Co-working space thu nhỏ
- Study space
- Booth/seat rental theo thời gian

**Giá trị cốt lõi:**

> Khách hàng không thực sự mua một ly cà phê; họ đang trả tiền cho **một khoảng thời gian có thể tập trung**.

Khách hàng trả tiền để có:
- Không gian yên tĩnh.
- Sự riêng tư.
- Bàn học phù hợp.
- Ghế thoải mái.
- Wi-Fi ổn định.
- Ổ cắm điện.
- Điều hòa.
- Ánh sáng tốt.
- Có thể ngồi nhiều giờ mà không cảm thấy "chiếm chỗ" như ở café truyền thống.
- Không phải tự tìm chỗ trong thư viện hoặc café thông thường.

### Sản phẩm chính

**Study Space + Time**

### Sản phẩm bổ trợ

**Coffee / Tea / Snack / Printing / Stationery / Locker**

---

# 2. Chân dung khách hàng mục tiêu

## 2.1 Học sinh cấp 2, cấp 3

Ước tính:
- 35–40%

Nhu cầu:
- Tự học.
- Ôn thi chuyển cấp.
- Ôn thi THPT.
- Học thêm.
- Học nhóm nhỏ.

## 2.2 Sinh viên đại học

Ước tính:
- 40–45%

Nhu cầu:
- Ôn thi học kỳ.
- Làm đồ án.
- Học chứng chỉ.
- IELTS / TOEIC / JLPT.
- Học cá nhân.

## 2.3 Freelancer / Người đi học thêm

Ước tính:
- 15–20%

Nhu cầu:
- Làm việc yên tĩnh.
- Freelance.
- Học nâng cao.
- Chạy deadline.

---

# 3. Customer behavior: Walk-in là luồng chính

## 3.1 Hành vi tự nhiên

Thay vì:

```text
Tìm quán
→ Booking online
→ Chọn ngày
→ Chọn giờ
→ Thanh toán online
→ Nhận confirmation
→ Đến quán
```

Nên ưu tiên:

```text
Có nhu cầu học
→ Tìm quán gần đây
→ Đi thẳng tới quán
→ Kiểm tra chỗ trống
→ Chọn gói
→ Thanh toán tại quầy
→ Nhận booth
→ Học
```

### Lý do

Học sinh/sinh viên thường có nhu cầu phát sinh khá nhanh:

> "Hôm nay cần một chỗ yên tĩnh để học."

Họ không nhất thiết muốn lên kế hoạch và booking trước.

Do đó:

> **Walk-in + POS + real-time availability** nên là core business flow.

---

# 4. User Journey đề xuất

```text
                    CUSTOMER
                       │
                       ▼
                 WALK INTO CAFE
                       │
                       ▼
              CHECK AVAILABILITY
                       │
                       ▼
                 CHOOSE PLAN
                       │
                       ▼
                  PAY AT POS
                       │
                       ▼
             CREATE STUDY SESSION
                       │
                       ▼
                ASSIGN BOOTH
                       │
                       ▼
                    STUDY
                       │
              ┌────────┴────────┐
              │                 │
           EXTEND             FINISH
              │                 │
              ▼                 ▼
           PAYMENT           CHECKOUT
              │                 │
              └────────┬────────┘
                       ▼
                 BOOTH CLEANING
                       │
                       ▼
                   AVAILABLE
```

---

# 5. Trải nghiệm khi khách bước vào quán

Điều khách quan tâm đầu tiên thường không phải:

> "Quán có loại coffee nào?"

Mà là:

> **"Còn chỗ không?"**

Do đó cần có cách trả lời rất nhanh.

Ví dụ màn hình tại cửa/quầy:

```text
┌──────────────────────────────────┐
│       STUDY SPACE AVAILABILITY   │
│                                  │
│ 🟢 Available                     │
│                                  │
│ Single Booth       12 / 20       │
│ Double Booth        3 / 6        │
│ Group Room          1 / 2        │
│                                  │
│ Current Occupancy: 63%           │
└──────────────────────────────────┘
```

Hoặc đơn giản:

> **12 Single Booths Available**

Nhân viên có thể hỏi:

> "Hiện còn 12 bàn đơn. Anh/chị muốn học 2 tiếng, 4 tiếng hay cả ngày?"

Mục tiêu là khách có thể quyết định nhanh.

---

# 6. Check-in tại quầy

Không nên tạo quá nhiều friction.

### Không nên

```text
Login
→ Create account
→ Select date
→ Select time
→ Booking
→ Email confirmation
→ QR
→ Check-in
```

### Nên

```text
Customer:
"I want to study for 4 hours."

Staff:
"Single booth or double booth?"

Customer:
"Single."

Staff:
"55,000 VND including one drink."

Customer:
"Okay."

Payment
→ POS creates session
→ System assigns Booth A17
→ Customer receives booth number / QR
→ Start studying
```

### Mục tiêu

**Check-in khoảng 30–60 giây.**

---

# 7. Không cần booking booth trong luồng chính

Thay vì tư duy:

> Booth A17 được booking từ 14:00–18:00.

Nên tư duy:

> Booth A17 đang được sử dụng bởi một **Study Session**.

Ví dụ:

```text
Booth
├── A01
├── A02
├── A03
└── A04

Study Session
├── Customer
├── Booth
├── StartTime
├── EndTime
├── Plan
└── Status
```

Ví dụ một session:

```text
Session #10231

Customer: Student
Booth: A17
Start: 14:03
End: 18:03
Plan: 4 Hours
Status: Active
```

Đây là:

> **Seat / Booth / Session Management**

chứ không phải reservation management thuần túy.

---

# 8. Booth status

Nên quản lý booth bằng trạng thái:

```text
AVAILABLE
OCCUPIED
TEMPORARILY_AWAY
CLEANING
MAINTENANCE
RESERVED
```

Trong MVP có thể bắt đầu đơn giản với:

```text
AVAILABLE
OCCUPIED
CLEANING
MAINTENANCE
```

---

# 9. Trường hợp khách tạm rời booth

Ví dụ khách học 4 tiếng nhưng đi toilet hoặc ra ngoài mua đồ.

Họ không muốn mất booth.

Có thể có chức năng:

> **I'm taking a break**

Trạng thái:

```text
OCCUPIED
    ↓
TEMPORARILY_AWAY
    ↓
OCCUPIED
```

Ví dụ:

```text
Booth A17
Status: Temporarily Away

Reserved for:
Customer

Return before:
15:35
```

Nếu quá thời gian:

```text
TEMPORARILY_AWAY
       ↓
TIMEOUT
       ↓
AVAILABLE
```

Tính năng này có thể để **Phase 2**, không nhất thiết phải có trong MVP.

---

# 10. Hết giờ và gia hạn

Không nên tạo cảm giác nhân viên "đuổi khách".

### 30 phút trước

```text
Your study session ends at 18:00.
```

### 10 phút trước

```text
Your session ends in 10 minutes.

[ Extend 1 Hour ]
[ Extend 2 Hours ]
[ Checkout ]
```

Nếu gia hạn:

```text
Current:
14:00 → 18:00

Extend 2 hours

New:
14:00 → 20:00

+30,000 VND
```

Sau khi thanh toán:

> Session tiếp tục.

---

# 11. Có cần mobile app không?

## Không nhất thiết.

MVP không nên bắt khách:
- Download app.
- Đăng ký tài khoản.
- Nhớ password.

Có thể sử dụng:

> **QR-based customer experience**

Sau khi thanh toán, khách nhận QR.

Quét QR sẽ mở mobile web:

```text
STUDY BOOTH

A17

Session: 4 Hours

14:00 ───────── 18:00

2h 35m remaining

[ Extend Session ]
[ My Session ]
[ Request Help ]
```

Ưu điểm:
- Không cần app.
- Không cần account phức tạp.
- Dễ triển khai.
- Phù hợp walk-in.

---

# 12. Customer needs

## 12.1 Must-have

| Feature | Importance |
|---|---:|
| Bàn đủ rộng | ⭐⭐⭐⭐⭐ |
| Ghế thoải mái | ⭐⭐⭐⭐⭐ |
| Điều hòa | ⭐⭐⭐⭐⭐ |
| Wi-Fi ổn định | ⭐⭐⭐⭐⭐ |
| Ổ điện | ⭐⭐⭐⭐⭐ |
| Ánh sáng tốt | ⭐⭐⭐⭐⭐ |
| Yên tĩnh | ⭐⭐⭐⭐⭐ |
| Nhà vệ sinh sạch | ⭐⭐⭐⭐⭐ |
| Nước uống | ⭐⭐⭐⭐ |
| An ninh | ⭐⭐⭐⭐ |

### Core experience

```text
Wi-Fi
+
Power
+
Silence
+
Comfortable Chair
+
Good Lighting
```

---

# 13. Convenience features

Những tiện ích giúp tăng retention:

- Free water.
- Tissue.
- Trash bin.
- Locker.
- Charging.
- Printer.
- Stationery.
- Whiteboard.
- Phone booth.
- Personal storage.
- Cup holder.
- Bag hook.

Ví dụ khách có thể chấp nhận giá cao hơn café thông thường vì:

> Có locker + nước miễn phí + ổ điện + chỗ ngồi ổn định.

Đây là **retention driver**.

---

# 14. Study-specific features

## Single Booth

Có thể bao gồm:

```text
┌───────────────────┐
│                   │
│      LIGHT        │
│       💡          │
│                   │
│   ┌───────────┐   │
│   │   LAPTOP  │   │
│   └───────────┘   │
│                   │
│   🔌 🔌           │
│                   │
└───────────────────┘
```

Nên có:
- Adjustable lamp.
- Power socket.
- USB-C.
- Bag hook.
- Cup holder.
- Small storage.
- Ergonomic chair.
- Privacy partition.

---

# 15. Zoning

Không nên chỉ chia theo "booth".

Nên chia theo **noise level**.

## Zone 1 — Silent Zone

```text
🤫 SILENT
```

- Không gọi điện.
- Điện thoại để rung.
- Tai nghe khi học online.
- Không nói chuyện.

## Zone 2 — Normal Study

```text
📚 STUDY
```

Cho phép trao đổi nhỏ.

## Zone 3 — Group Discussion

```text
👥 GROUP
```

Dành cho:
- 2–8 người.
- Học nhóm.
- Thảo luận.
- Làm project.

### Lợi ích

Nếu nhóm 4 người nói chuyện trong Silent Zone, trải nghiệm của nhiều khách khác sẽ bị ảnh hưởng.

---

# 16. Privacy không đồng nghĩa với "hộp kín"

Không nên thiết kế tất cả booth thành phòng kín hoàn toàn.

Khách cần:

> **Privacy**

nhưng không nhất thiết cần:

> **Completely enclosed space**

Nên ưu tiên:
- Partition.
- Hạn chế tầm nhìn.
- Có không gian riêng.
- Thông thoáng.
- Nhân viên có thể quan sát.
- Không tạo cảm giác nguy hiểm.
- Không cản trở PCCC.

---

# 17. Food & Beverage

Không nên biến F&B thành trung tâm business.

## Included

- Water.
- Tea.
- Instant coffee.

## Paid add-ons

- Espresso.
- Latte.
- Matcha.
- Soft drinks.
- Sandwich.
- Snack.

Ví dụ:

```text
STUDY PLAN

2 HOURS       35K
4 HOURS       55K
8 HOURS       99K

Includes:
✓ Study Booth
✓ Wi-Fi
✓ Electricity
✓ Water
✓ Tea
```

Add-ons:

```text
Latte          +25K
Matcha         +30K
Sandwich       +30K
Printing       +1K/page
Locker         +10K/day
```

Thông điệp phải rõ:

> **Khách đang trả tiền cho Study Space; F&B là phần bổ trợ.**

---

# 18. Pricing Strategy

## 18.1 Theo giờ

Khoảng:

- 15.000–25.000 VNĐ/giờ.

Có thể bao gồm:
- Study booth.
- Wi-Fi.
- Electricity.
- Water / tea / instant coffee.

## 18.2 Combo

### 4 giờ

- 55.000–65.000 VNĐ.
- Kèm 1 nước pha chế.

### Cả ngày

- 99.000–120.000 VNĐ.
- 8 giờ.
- Kèm 1 nước + 1 snack.

## 18.3 Membership

Ví dụ:

> 30 giờ/tháng: 350.000 VNĐ.

---

# 19. Online booking chỉ là Secondary Flow

Booking online vẫn nên tồn tại, nhưng không phải core.

### Use case

Khách nói:

> "Ngày mai tôi muốn chắc chắn có booth lúc 19:00."

Khi đó:

```text
Website
→ Select date
→ Select time
→ Select booth
→ Pay deposit / booking fee
→ Receive confirmation
→ Come to cafe
→ Check-in
```

### Customer types

#### Type 1 — Walk-in

```text
Google Maps
→ Visit
→ Pay
→ Study
```

#### Type 2 — Regular

```text
Membership
→ Scan QR
→ Choose available booth
→ Study
```

#### Type 3 — Reservation

```text
Website
→ Reserve
→ Come
→ Check-in
```

Booking có thể phục vụ một phần nhỏ khách cần đảm bảo chỗ, trong khi walk-in vẫn là flow chính.

---

# 20. Business model

```text
                 STUDY SPACE
                      │
        ┌─────────────┼─────────────┐
        │             │             │
       TIME          BOOTH          F&B
        │             │             │
   2h / 4h / 8h     Single        Coffee
   Day / Monthly    Double        Snack
                    Group          Drinks
        │             │             │
        └─────────────┼─────────────┘
                      │
                MAIN REVENUE
                      │
                STUDY SESSION
```

### Main revenue

**Study Session / Booth Time**

### Secondary revenue

- Coffee.
- Tea.
- Snack.
- Printing.
- Stationery.
- Locker.
- Membership.
- Group room.

---

# 21. Inventory thật sự của business

Nếu có:

> 40 booths

thì không nên chỉ nghĩ:

> "Tôi có 40 chỗ."

Nên nghĩ:

> **Tôi có bao nhiêu paid booth-hours?**

Ví dụ mở cửa 16 giờ/ngày:

```text
40 booths × 16 hours
= 640 booth-hours/day
```

Đây là **maximum capacity**.

Nếu bán được:

```text
320 booth-hours/day
```

thì:

```text
Occupancy
= 320 / 640
= 50%
```

---

# 22. Điều chỉnh cách tính doanh thu hiện tại

Giả định:

```text
40 booths
×
7 paid hours/day
=
280 booth-hours/day
```

Nếu giá trung bình:

```text
18.000 VNĐ/hour
```

Doanh thu:

```text
280 × 18.000
= 5.040.000 VNĐ/day
```

Trong 30 ngày:

```text
≈ 151.200.000 VNĐ/month
```

Tuy nhiên cần phân biệt:

### Capacity

```text
40 × 16
= 640 booth-hours/day
```

### Actual utilization

```text
280 booth-hours/day
```

### Occupancy

```text
280 / 640
= 43.75%
```

Vì vậy khi nói:

> "Mục tiêu occupancy 50–60%"

cần xác định rõ 50–60% của **operating hours** hay của một cách tính khác.

---

# 23. Địa điểm và mặt bằng

## Vị trí

Ưu tiên:
- Bán kính 1–2 km quanh trường cấp 3.
- Đại học.
- Cụm trường.
- Khu nhiều sinh viên.
- Khu dân cư có nhu cầu học tập.
- Hẻm xe máy rộng hoặc đường nội bộ yên tĩnh.

Tránh:
- Đường quá lớn.
- Nơi nhiều tiếng còi xe.
- Khu vực quá ồn.
- Khu vực khó gửi xe.

## Diện tích

Khoảng:

> 80–150 m²

Có thể chứa:

> 30–60 booth + không gian chung

---

# 24. Quy hoạch không gian

## Khu vực 1 — Study Booths

Khoảng 70% diện tích.

### Single Booth

- Rộng: 0.9–1.1m.
- Sâu: 0.9–1.0m.
- Vách: 1.4–1.6m.
- Có thể dùng rèm nếu cần.

### Double Booth

- Rộng: 1.5–1.8m.

## Khu vực 2 — Group Discussion

Khoảng 15%.

- Bàn 6–8 người.
- Vách cách âm tương đối.

## Khu vực 3 — Bar / Reception / Utility

Khoảng 15%.

Bao gồm:
- Quầy.
- Pha chế.
- Máy bán nước.
- Máy in.
- Văn phòng phẩm.
- Nhà vệ sinh.

---

# 25. Nội thất và thiết bị

## Nội thất

- MDF chống ẩm.
- Thạch cao cách âm.
- Rèm dày.
- Bàn học.
- Ghế ergonomic.
- Ghế nệm có tựa lưng.

## Ánh sáng

Mỗi booth:
- Đèn học.
- Điều chỉnh độ sáng.
- Có thể có 3 mức màu:
  - Warm.
  - Neutral.
  - White.

## Điện

Mỗi booth:
- Tối thiểu 2 ổ cắm.
- USB.
- USB-C.

---

# 26. Hạ tầng kỹ thuật

## Wi-Fi

Có thể cân nhắc:
- Ruckus.
- Aruba.
- Hoặc hệ thống Wi-Fi business tương đương.

Mục tiêu:

> 80–120 thiết bị kết nối đồng thời.

## Điều hòa và thông gió

Cần:
- Điều hòa đủ công suất.
- Thông gió.
- Quạt hút.
- Đặc biệt quan trọng với booth có vách cao hoặc kín.

Không nên chỉ làm phòng kín rồi phụ thuộc hoàn toàn vào máy lạnh.

---

# 27. Technology / Software

## POS

Có thể tham khảo:
- Sapo.
- KiotViet.
- iPOS.

## Booth management

Quản lý:
- Booth availability.
- Session.
- Start time.
- End time.
- Extension.
- Cleaning.
- Maintenance.

## Check-in

Có thể dùng:
- QR Code.
- RFID / thẻ từ.
- Booth number.

MVP chỉ cần:

> POS + Booth Status + Study Session + QR

IoT tự động ngắt điện có thể để phase sau.

---

# 28. Software architecture / domain model

Nếu xây hệ thống riêng, nên chia thành:

## 28.1 POS

```text
Customer
Payment
Product
Plan
Invoice
Discount
```

## 28.2 Booth Management

```text
Booth
Zone
BoothType
Status
Availability
```

## 28.3 Study Session

```text
Session
Customer
Booth
StartTime
EndTime
Plan
Status
Extension
```

## 28.4 Customer

```text
Customer
Membership
StudyHours
VisitHistory
Rewards
```

---

# 29. Dashboard cho chủ quán

Dashboard không nên chỉ hiển thị:

> Today's Revenue

Mà cần operational metrics.

Ví dụ:

```text
TODAY

Revenue              8.2M
Customers            127
Active Sessions       32
Occupancy             68%

────────────────────────

BOOTH STATUS

Available             8
Occupied             32
Cleaning              2
Maintenance           1

────────────────────────

REVENUE

Study Plans          6.5M
F&B                  1.3M
Other                0.4M
```

---

# 30. Occupancy by hour

Một metric cực kỳ quan trọng:

```text
08  █████
09  ███████
10  █████████
11  ███████
12  █████
13  ██████
14  █████████
15  ███████████
16  ████████████
17  ██████████████
18  ████████████████
19  █████████████████
20  █████████████████
21  ██████████████
```

Mục tiêu:

> Biết khách đến lúc nào để tối ưu pricing, staffing và capacity.

Ví dụ:

```text
08:00–12:00  Off-peak
12:00–17:00  Normal
17:00–22:00  Peak
```

Có thể áp dụng dynamic / time-based pricing nếu thị trường chấp nhận.

---

# 31. CAPEX dự kiến cho quy mô 100m² / 40 booth

| Mục chi phí | Chi tiết | Dự toán |
|---|---|---:|
| Cọc & thuê mặt bằng | Cọc 3 tháng + trả trước 1 tháng, giả định 20tr/tháng | 80.000.000 |
| Thi công & nội thất | Booth, vách, bàn ghế, thạch cao, sàn | 150.000.000–200.000.000 |
| Điện / Wi-Fi / đèn | Điện 3 pha, mạng, ổ cắm, đèn | 40.000.000–50.000.000 |
| Điều hòa & thông gió | 3–4 máy lạnh lớn + quạt hút | ~60.000.000 |
| Pha chế & máy in | Máy pha café, tủ lạnh, máy in | ~30.000.000 |
| Software / PCCC / pháp lý | POS, QR/RFID, PCCC, giấy phép | ~20.000.000 |
| Dự phòng | Vốn vận hành dự phòng | ~50.000.000 |
| **Tổng** | | **430.000.000–510.000.000** |

> Đây là **ước tính ban đầu để research**, cần khảo sát giá thực tế theo địa điểm, diện tích, tiêu chuẩn PCCC, thiết kế và nhà cung cấp trước khi quyết định đầu tư.

---

# 32. OPEX hàng tháng

Ước tính:

| Khoản | Chi phí |
|---|---:|
| Mặt bằng | 20.000.000 |
| Điện, nước, Internet | 12.000.000–15.000.000 |
| Nhân sự | ~20.000.000 |
| Nguyên vật liệu | ~8.000.000 |
| Marketing & khác | ~5.000.000 |
| **Tổng** | **~65.000.000/tháng** |

Cần bổ sung khi lập financial model chính thức:
- Thuế.
- Phí thanh toán.
- Bảo trì.
- Hao mòn.
- Chi phí thay mới bàn ghế.
- Điều hòa.
- Thiết bị mạng.
- PCCC.
- Vệ sinh.
- Chi phí thất thoát.
- Chi phí bảo hiểm nếu có.

---

# 33. Ví dụ revenue model

Giả định:

```text
40 booths
×
7 paid hours/day
=
280 paid booth-hours/day
```

Average revenue:

```text
18.000 VNĐ/hour
```

Daily:

```text
280 × 18.000
= 5.040.000 VNĐ
```

Monthly:

```text
5.040.000 × 30
≈ 151.200.000 VNĐ
```

Nếu OPEX khoảng:

```text
65.000.000
```

thì contribution trước các khoản chưa tính:

```text
151.200.000
-
65.000.000
=
86.200.000 VNĐ
```

**Không nên coi đây là lợi nhuận ròng.**

Cần tiếp tục trừ:
- Thuế.
- Khấu hao.
- Bảo trì.
- Payment fee.
- Chi phí phát sinh.
- Chi phí vốn.
- Các chi phí chưa được đưa vào OPEX.

Do đó ROI 6–10 tháng trong bản sơ bộ cần được **validate lại bằng unit economics thực tế**.

---

# 34. Marketing strategy

## 34.1 Online

### TikTok / Facebook Reels

Content:
- Study with me.
- Một ngày học ở study booth.
- Review quán.
- "Một nơi yên tĩnh để chạy deadline."
- Before/after khi học ở café thường vs study booth.
- Tour booth.
- Tour quán.

### KOL / Study Creator

Hợp tác với:
- Studygrammer.
- Study-toker.
- Student creator.
- IELTS creator.

## 34.2 Google Maps

Tập trung từ khóa:
- Quán cà phê tự học.
- Study space.
- Study cafe.
- Café học bài.
- Café học nhóm.
- Không gian học tập.
- Study space gần đây.

## 34.3 Community

Có thể xây:
- Group Facebook.
- Zalo community.
- Community dành cho học sinh/sinh viên.
- IELTS / TOEIC study group.

---

# 35. Offline marketing

## Voucher

Phát voucher quanh:
- Trường THPT.
- Đại học.
- Trung tâm IELTS.
- Trung tâm ngoại ngữ.

Ví dụ:

> First study session -30%

## Mùa thi

Campaign:

> **Đồng hành mùa thi**

Ưu đãi:
- Group study.
- Gói 4h.
- Gói cả ngày.
- Membership.

## Night study

Nếu vận hành ban đêm:

> **22:00–06:00 Night Study**

Nhưng cần kiểm tra:
- Nhu cầu thực tế.
- An ninh.
- PCCC.
- Chi phí nhân sự.
- Quy định địa phương.
- Hiệu quả doanh thu.

---

# 36. House Rules

## Silent Zone

- Không gọi điện.
- Điện thoại rung.
- Tai nghe khi nghe media/học online.
- Không nói chuyện lớn.

## Food

Không mang đồ ăn mùi mạnh:
- Bún đậu.
- Mắm tôm.
- Đồ chiên.
- Các món có mùi mạnh.

## Seat usage

Không để đồ chiếm chỗ khi rời quá lâu.

Có thể áp dụng:

> Maximum temporary-away time: 30–60 phút.

Cần thiết kế rule rõ ràng để tránh tranh chấp.

---

# 37. Risk management

## 37.1 Vắng khách mùa hè / Tết

Giải pháp:
- Freelancer.
- Người học chứng chỉ.
- IELTS.
- TOEIC.
- Người làm việc remote.
- Workshop.
- English club.
- Study group.

## 37.2 Khách gây ồn

Quy trình:

```text
First warning
    ↓
Second warning
    ↓
Move to Normal / Group Zone
    ↓
If repeated → Ask customer to leave
```

Có thể dùng:
- Thẻ vàng.
- Thẻ đỏ.

## 37.3 Điện quá tải

Giải pháp:
- Kiểm tra tải điện.
- Phân mạch.
- Aptomat phù hợp.
- Thiết kế điện bởi đơn vị chuyên môn.
- Kiểm tra định kỳ.
- UPS cho POS / modem / router.

## 37.4 PCCC

Đặc biệt quan trọng vì:
- Nhiều booth.
- Vách ngăn.
- Gỗ / vật liệu nội thất.
- Thiết bị điện.
- Nhiều ổ cắm.

Cần đặc biệt chú ý:
- Lối thoát hiểm.
- Bình chữa cháy.
- Hệ thống báo cháy.
- Đèn exit.
- Khoảng cách thoát nạn.
- Vật liệu phù hợp.
- Không để booth/cấu trúc cản trở đường thoát.

---

# 38. Business metrics cần theo dõi

Đây là nhóm KPI quan trọng hơn số ly café bán ra.

## Core KPIs

### Occupancy

```text
Paid booth-hours
/
Available booth-hours
```

### Revenue per available booth-hour

```text
Total study revenue
/
Available booth-hours
```

### Revenue per occupied booth-hour

```text
Study revenue
/
Paid booth-hours
```

### Average Session Duration

```text
Total study hours
/
Number of sessions
```

### Average Revenue per Customer

```text
Total revenue
/
Number of customers
```

### Repeat Rate

```text
Returning customers
/
Total customers
```

### Membership conversion

```text
Members
/
Total active customers
```

---

# 39. 8 câu hỏi cần research trước khi đầu tư

Không nên vội xây hệ thống software hoặc đầu tư lớn trước khi validate customer behavior.

## 1. Khách sẵn sàng trả bao nhiêu?

So sánh:
- 2h.
- 4h.
- 8h.
- Full day.
- Monthly.

## 2. Khách thích loại booth nào?

- Open.
- Semi-private.
- Private.
- Single.
- Double.

## 3. Khách thường ngồi bao lâu?

Đây là input trực tiếp cho:
- Pricing.
- Capacity.
- Revenue.

## 4. Peak hour là khi nào?

Cần đo:
- Sáng.
- Trưa.
- Chiều.
- Tối.
- Cuối tuần.

## 5. Khách đi một mình hay theo nhóm?

Quyết định:
- Single booth ratio.
- Double booth ratio.
- Group room ratio.

## 6. Tại sao khách chọn study café?

Các lý do có thể là:
- Yên tĩnh.
- Riêng tư.
- Điều hòa.
- Ổ điện.
- Wi-Fi.
- Ghế.
- Không bị giới hạn thời gian.
- Gần nhà/trường.

Cần hỏi trực tiếp thay vì giả định.

## 7. Khách có chấp nhận walk-in không?

Nếu không còn chỗ:
- Họ chờ?
- Đặt chỗ?
- Đi nơi khác?
- Quay lại sau?

## 8. Khách có nhu cầu membership không?

Đây có thể là yếu tố giúp:
- Tăng retention.
- Tăng predictable revenue.
- Giảm CAC theo thời gian.

---

# 40. MVP business

## Không cần xây tất cả ngay từ đầu

### MVP physical

Cần:
- Booth.
- Bàn.
- Ghế.
- Điều hòa.
- Wi-Fi.
- Điện.
- Ánh sáng.
- Nước.
- POS.
- House rules.

### MVP software

Chỉ cần:

```text
POS
+
Booth Status
+
Study Session
+
QR
+
Payment
```

Không cần ngay:
- Mobile app.
- AI.
- IoT phức tạp.
- Automatic electricity control.
- Advanced booking.
- Loyalty system quá phức tạp.

---

# 41. Core operational workflow

```text
CUSTOMER ARRIVES
       │
       ▼
CHECK AVAILABLE BOOTHS
       │
       ▼
SELECT PLAN
       │
       ▼
PAY AT POS
       │
       ▼
CREATE SESSION
       │
       ▼
ASSIGN BOOTH
       │
       ▼
START TIMER
       │
       ▼
STUDY
       │
       ├───────────────┐
       │               │
       ▼               ▼
   EXTENSION         FINISH
       │               │
       ▼               ▼
    PAYMENT         CHECKOUT
       │               │
       └───────┬───────┘
               ▼
          CLEAN BOOTH
               │
               ▼
            AVAILABLE
```

---

# 42. Recommended business positioning

Thay vì chỉ định vị:

> "Café tự học dạng ô/hộp"

có thể định vị:

> ## **Pay for Focus**
> ### Một không gian yên tĩnh để học, làm việc và tập trung.

Hoặc:

> ## **Bạn trả tiền cho sự tập trung.**

Điều này giúp khách hiểu:

> Giá trị chính không phải là coffee.

Mà là:

```text
TIME
+
FOCUS
+
PRIVACY
+
COMFORT
```

---

# 43. Kết luận

Mô hình nên được nhìn nhận là:

> **Study Space business có F&B**, không phải **café có thêm booth học**.

Điểm khác biệt lớn nhất:

```text
Traditional Cafe
────────────────────────
Revenue → Drinks
Customer → Table
Time → Often unlimited
Seat → Shared
Privacy → Low


Study Booth Cafe
────────────────────────
Revenue → Study Time
Customer → Study Session
Time → Paid
Seat → Assigned booth
Privacy → High
```

## Core model

```text
WALK-IN
   ↓
CHECK AVAILABILITY
   ↓
PAY AT COUNTER
   ↓
GET BOOTH
   ↓
STUDY
   ↓
EXTEND / CHECKOUT
```

## Booking

> **Optional, not mandatory.**

## Main product

> **Paid study time**

## Secondary products

> Coffee + drinks + snacks + printing + stationery + locker + membership.

## Main business metric

> **Paid booth-hours / available booth-hours**

## Main validation questions

> **Price + duration + occupancy + repeat rate + customer reason for choosing the space.**

---

# 44. Recommended next research phase

Trước khi chốt CAPEX 430–510 triệu VNĐ, nên thực hiện theo thứ tự:

```text
1. Customer Research
       ↓
2. Competitor Research
       ↓
3. Location Research
       ↓
4. Pricing Test
       ↓
5. Demand / Occupancy Model
       ↓
6. Unit Economics
       ↓
7. MVP Design
       ↓
8. Pilot Store
       ↓
9. Measure Customer Behavior
       ↓
10. Scale / Optimize
```

**Đặc biệt, cần validate bằng dữ liệu thực tế trước khi kết luận ROI 6–10 tháng.**

