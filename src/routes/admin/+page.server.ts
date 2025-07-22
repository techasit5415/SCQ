// src/routes/admin/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { query } from '$lib/server/db';

export const actions: Actions = {
  default: async ({ request }) => {
    console.log('Action /admin called');
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

    console.log('DB rows:', rows); // ดูผล query ใน console

    if (rows.length === 0) {
      return fail(401, { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = rows[0];
    console.log('Password input:', password);
    const match = await bcrypt.compare(password, user.password);
    console.log('Password match result:', match);
    if (!match) {
      return fail(401, { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // ถ้าตรวจสอบผ่าน ให้ redirect ไปหน้า /homeadmin
    throw redirect(303, '/homeadmin');

  }
};
