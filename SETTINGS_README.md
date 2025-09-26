# Settings Page Documentation

## Overview
หน้า Settings เป็นส่วนสำคัญของ Admin Panel ที่ให้ผู้ดูแลระบบสามารถจัดการการตั้งค่าต่างๆ ของแพลตฟอร์ม SCQ ได้อย่างครบถ้วน

## Features Implemented

### 1. System Configuration
- ตั้งค่าชื่อแพลตฟอร์ม และคำอธิบาย
- เลือก Timezone, ภาษา, สกุลเงิน
- กำหนดรูปแบบวันที่

### 2. Branding & Appearance
- อัปโหลดโลโก้และ Favicon
- ตั้งค่าสีหลักและสีรอง
- ปรับแต่งธีมของแพลตฟอร์ม

### 3. Restaurant Management
- กำหนดนีโยบายการอนุมัติร้านอาหารใหม่
- ตั้งค่าอัตราค่าคอมมิชชั่น
- จัดการหมวดหมู่ร้านอาหาร
- กำหนดขีดจำกัดเมนูและรูปภาพ

### 4. Payment Configuration
- เปิด/ปิดช่องทางการชำระเงิน
- ตั้งค่าอัตราภาษี
- กำหนดรอบการจ่ายเงิน

### 5. Security Settings
- ตั้งค่า Session Timeout
- กำหนดจำนวนครั้งการล็อกอินสูงสุด
- เปิด/ปิด Two-Factor Authentication
- ตั้งค่าการสำรองข้อมูล

## User Interface Features

### Navigation
- Tab-based navigation สำหรับแต่ละหมวดหมู่
- Responsive design รองรับหลายขนาดหน้าจอ
- Icon และ label ที่ชัดเจน

### Form Controls
- Input validation
- Auto-save draft ทุก 30 วินาที
- Unsaved changes warning
- Success/Error notifications

### Data Management
- Export settings เป็น JSON
- Reset to defaults option
- Real-time form validation

## File Structure
```
src/routes/admin/settings/
├── +page.server.ts    # Server-side data fetching และ business logic
└── +page.svelte       # UI components และ client-side logic
```

## Usage
1. เข้าสู่ระบบ Admin
2. เลือกเมนู "Settings" จาก sidebar
3. เลือก tab ที่ต้องการแก้ไข
4. แก้ไขค่าต่างๆ
5. กดปุ่ม "Save Changes" เพื่อบันทึก

## Technical Notes
- ใช้ SvelteKit framework
- TypeScript support
- Material Icons สำหรับ icons
- Responsive CSS Grid layout
- Session-based authentication
- Auto-save functionality

## Future Enhancements
- User Management tab
- Notifications tab
- Integrations tab
- Advanced security options
- Role-based permissions
- Multi-language support

## API Integration
หน้า Settings พร้อมสำหรับการเชื่อมต่อกับ API backend เพื่อ:
- บันทึกการตั้งค่าจริง
- ดึงข้อมูลการตั้งค่าปัจจุบัน
- ตรวจสอบสิทธิ์ผู้ใช้
- Audit logging สำหรับการเปลี่ยนแปลง