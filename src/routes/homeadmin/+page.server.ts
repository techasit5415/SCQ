// import type { Actions } from './$types';

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
// import type { PageServerLoad } from './$types';
// import { redirect } from '@sveltejs/kit';

// export const load: PageServerLoad = async ({ cookies }) => {
//   const session = cookies.get('session');

//   if (!session) {
//     throw redirect(303, '/admin'); // หรือหน้า login
//   }

//   // ถ้าต้องการ ตรวจสอบ session กับฐานข้อมูลก็ทำตรงนี้

//   return {
//     userId: session
//   };
// };
