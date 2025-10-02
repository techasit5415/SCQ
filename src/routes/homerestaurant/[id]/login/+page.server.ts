import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { query } from '$lib/server/db';
import { serialize } from 'cookie';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');

  if (session) {
    throw redirect(303, '/homerestaurant/login'); // หรือหน้า login
  }

  // ถ้าต้องการ ตรวจสอบ session กับฐานข้อมูลก็ทำตรงนี้

  return {};
};
export const actions: Actions = {
  default: async ({ request, cookies }) => {
    console.log('Action /restaurant called');
    const form = await request.formData();
    const username = String(form.get('username') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!username || !password) {
      return fail(400, { error: 'กรุณากรอก username และ password' });
    }

    // ดึงข้อมูล admin จาก DB
    const rows = await query<{ id: number; username: string; password: string }>(
      'SELECT id, username, password FROM admin WHERE username = ?',
      [username]
    );

    // console.log('DB rows:', rows); // ดูผล query ใน console

    if (rows.length === 0) {
      return fail(401, { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = rows[0];
    // console.log('Password input:', password);
    const match = await bcrypt.compare(password, user.password);
    // console.log('Password match result:', match);
    if (!match) {
      return fail(401, { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    cookies.set('session', String(user.id), {
      path: '/',
      httpOnly: false,     // เปลี่ยนเป็น false เพื่อให้ client-side เข้าถึงได้
      sameSite: 'lax',     // เปลี่ยนเป็น lax เพื่อความยืดหยุ่น
      secure: false,       // สำหรับ development (http)
      maxAge: 60 * 60 * 24 // 1 วัน
    });
    return { success: true };

  }

};