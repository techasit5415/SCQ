// import type { Actions } from './$types.js';

// export const actions: Actions = {
//   default: async ({ request }) => {
//     // ดึงข้อมูลฟอร์ม
//     const formData = await request.formData();
//     const username = formData.get('username');
//     const password = formData.get('password');

//     // ตรวจสอบข้อมูล (ตัวอย่าง)
//     if (username !== 'admin' || password !== '1234') {
//       return { status: 401, errors: { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' } };
//     }

//     // ถ้าล็อกอินสำเร็จ
//     return { success: true };
//   }
// };
