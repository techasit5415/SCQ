# 🇹🇭 ระบบชำระเงิน PromptPay QR Code

## ✅ สิ่งที่เราได้ทำเสร็จแล้ว

### 1. 📦 ติดตั้ง Libraries
- ✅ `qrcode` - สร้าง QR Code
- ✅ `promptpay-qr` - สร้าง PromptPay payload ตามมาตรฐานไทย

### 2. 🎨 Component ที่สร้าง

#### `PromptPayQR.svelte`
Component สำหรับแสดง QR Code พร้อมข้อมูลการชำระเงิน
- รับ props: `phoneNumber`, `amount`, `shopName`
- แปลงเบอร์โทรเป็นรูปแบบ PromptPay (เอา 0 ออก)
- สร้าง QR Code แบบ Dynamic (มียอดเงินกำหนดอัตโนมัติ)
- แสดงคำแนะนำวิธีชำระเงิน
- มี Loading state และ Error handling
- UI สวยงาม responsive

### 3. 🛣️ Routes ที่สร้าง

#### `/customer/payment/[orderId]`
หน้าชำระเงินสำหรับลูกค้า
- แสดง QR Code PromptPay ของร้านค้า
- แสดงข้อมูล Order และยอดเงิน
- ฟอร์มอัพโหลดสลิปการโอนเงิน
- Preview รูปก่อนอัพโหลด
- ตรวจสอบประเภทไฟล์และขนาด (สูงสุด 5MB)

**Server Actions:**
- `uploadSlip` - อัพโหลดหลักฐานการโอนเงินและอัพเดทสถานะ Order

### 4. 🔄 ปรับปรุง Cart System

#### `cart/+page.svelte`
- เพิ่ม logic redirect ไปหน้า payment เมื่อเลือกชำระด้วย QR Code
- แยก flow การชำระเงินตามประเภท

#### `cart/+page.server.ts`
- เพิ่มสถานะ `pending_payment` สำหรับ Order ที่รอชำระเงิน
- ไม่สร้าง Payment record ถ้าเลือก QR (สร้างหลังอัพโหลดสลิป)
- เพิ่ม field `Payment` ใน Order record

### 5. 📋 ปรับปรุง Orders Page

#### `orders/+page.svelte`
- เพิ่มสถานะใหม่: `pending_payment`, `pending_confirmation`
- เพิ่มปุ่ม "ชำระเงิน" สำหรับ Order ที่รอชำระ
- เพิ่ม badge "รอยืนยัน" สำหรับ Order ที่รอร้านตรวจสอบสลิป
- อัพเดท color coding ตามสถานะ

## 🎯 Flow การทำงาน

### การสั่งอาหารด้วย QR Code:

```
1. ลูกค้าเลือกเมนู ใส่ตะกร้า
   ↓
2. เลือกชำระเงินด้วย "QR Code"
   ↓
3. กดสั่งอาหาร → สร้าง Order (status: pending_payment)
   ↓
4. Redirect ไปหน้า /customer/payment/[orderId]
   ↓
5. แสดง PromptPay QR Code ของร้าน (ดึงจาก Shop.Phone)
   ↓
6. ลูกค้าสแกน QR และโอนเงินผ่านแอปธนาคาร
   ↓
7. ลูกค้าถ่ายภาพสลิปและอัพโหลด
   ↓
8. อัพเดท Order (status: pending_confirmation)
   ↓
9. เจ้าของร้านเข้ามาตรวจสอบสลิป
   ↓
10. ยืนยัน → Order (status: Pending) → เริ่มทำอาหาร
```

## 📝 Database Schema

### Order Collection
- `Status`: 
  - `pending_payment` - รอลูกค้าชำระเงิน
  - `pending_confirmation` - รอร้านยืนยันการชำระเงิน
  - `Pending` - กำลังเตรียมอาหาร
  - `Completed` - เสร็จสิ้น
- `Payment`: "Qr Code" | "Cash" | "Point"
- `Payment_slip`: file (หลักฐานการโอนเงิน)

### Shop Collection
- `Phone`: หมายเลข PromptPay ของร้าน (เบอร์โทรศัพท์)

## 🎨 UI/UX Features

### PromptPay QR Component
- 📱 Header พร้อมโลโก้ PromptPay
- 🖼️ QR Code ขนาดใหญ่ชัดเจน
- 💰 แสดงยอดเงินที่ต้องชำระ
- 📋 คำแนะนำวิธีชำระเงินทีละขั้นตอน
- ℹ️ แสดงหมายเลข PromptPay
- 🎨 สีฟ้า (Blue theme) สอดคล้องกับธนาคารไทย

### Payment Page
- 📄 Card แสดงข้อมูล Order
- 📸 Upload area พร้อม drag & drop
- 🖼️ Preview รูปก่อนส่ง
- ⚠️ ตรวจสอบประเภทและขนาดไฟล์
- 💡 Info box คำแนะนำ

### Orders Page
- 🔴 สีแดง - รอชำระเงิน (มีปุ่มชำระเงิน)
- 🟡 สีเหลือง - รอยืนยัน (แสดง badge)
- 🟢 สีเขียว - เสร็จสิ้น

## 🚀 การใช้งาน

### ติดตั้งร้านค้า
1. เจ้าของร้านไปที่หน้า Settings
2. ใส่หมายเลข PromptPay (เบอร์โทร 10 หลัก)
3. บันทึก

### ลูกค้าชำระเงิน
1. เลือกเมนู → ใส่ตะกร้า
2. เลือก "QR Code" → สั่งอาหาร
3. สแกน QR ผ่านแอปธนาคาร
4. โอนเงินตามยอดที่แสดง
5. ถ่ายภาพสลิปและอัพโหลด
6. รอร้านยืนยัน

### เจ้าของร้านยืนยัน
1. เข้าหน้าจัดการ Orders
2. ดู Order ที่สถานะ "รอยืนยัน"
3. ตรวจสอบสลิปการโอนเงิน
4. กด "ยืนยัน" หรือ "ปฏิเสธ"

## 🔐 Security Features
- ✅ ตรวจสอบ authentication ก่อนเข้าหน้า payment
- ✅ ตรวจสอบว่า Order เป็นของ User คนนั้นจริง
- ✅ ไม่อนุญาตให้ชำระเงินซ้ำ (redirect ถ้าชำระแล้ว)
- ✅ ตรวจสอบประเภทไฟล์ (เฉพาะรูปภาพ)
- ✅ จำกัดขนาดไฟล์ (5MB)
- ✅ Server-side validation

## 📱 ธนาคารที่รองรับ
PromptPay รองรับทุกแอป Mobile Banking ในไทย:
- ธนาคารกสิกรไทย (K PLUS)
- ธนาคารไทยพาณิชย์ (SCB Easy)
- ธนาคารกรุงเทพ (Bualuang mBanking)
- ธนาคารกรุงไทย (Krungthai NEXT)
- ธนาคารกรุงศรีอยุธยา (Krungsri Mobile)
- และอื่นๆ ทุกธนาคาร

## 🎉 ข้อดี
- ✅ ไม่มีค่าธรรมเนียม
- ✅ โอนเงินได้ทันที Real-time
- ✅ ไม่ต้องผูกบัตรเครดิต
- ✅ ปลอดภัย (ผ่านธนาคาร)
- ✅ มาตรฐานไทย (ทุกธนาคารรองรับ)
- ✅ มีหลักฐานการโอนเงินชัดเจน

## 📂 ไฟล์ที่สร้าง/แก้ไข

```
src/
├── lib/
│   ├── Components/
│   │   └── payment/
│   │       └── PromptPayQR.svelte          ✨ NEW
│   └── index.ts                            📝 UPDATED
│
├── routes/
│   └── customer/
│       ├── cart/
│       │   ├── +page.svelte                📝 UPDATED
│       │   └── +page.server.ts             📝 UPDATED
│       ├── orders/
│       │   └── +page.svelte                📝 UPDATED
│       └── payment/
│           └── [orderId]/
│               ├── +page.svelte            ✨ NEW
│               └── +page.server.ts         ✨ NEW
```

---

**🎊 ระบบ PromptPay QR Payment พร้อมใช้งานแล้ว!**

ต่อไปสามารถ:
- ✅ ทดสอบการสั่งอาหารด้วย QR Code
- ✅ ทดสอบอัพโหลดสลิป
- ✅ เพิ่มหน้าจัดการ Orders สำหรับร้านค้า (ยืนยันการชำระเงิน)
