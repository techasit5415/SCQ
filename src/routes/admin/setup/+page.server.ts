import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { query, execute } from '$lib/server/db';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const username = String(formData.get('username') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const confirm = String(formData.get('confirm') ?? '');

    if (!username) {
      return fail(400, { error: 'ต้องใส่ชื่อผู้ใช้', values: { username } });
    }
    if (password.length < 8) {
      return fail(400, { error: 'รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร', values: { username } });
    }
    if (password !== confirm) {
      return fail(400, { error: 'รหัสผ่านไม่ตรงกัน', values: { username } });
    }

    const hash = await bcrypt.hash(password, 12);

    const existing = await query('SELECT id FROM admin LIMIT 1');
    if (existing.length === 0) {
      await execute('INSERT INTO admin (username, password) VALUES (?, ?)', [username, hash]);
    } else {
      await execute('UPDATE admin SET username=?, password=? WHERE id=?', [username, hash, existing[0].id]);
    }

    throw redirect(303, '/admin');
  }
};
