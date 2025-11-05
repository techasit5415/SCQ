// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = ({ cookies }) => {
  console.log('Logout GET handler called');
  console.log('Current session cookie:', cookies.get('session'));
  
  // ลบ cookie โดยไม่ระบุ domain
  cookies.delete('session', { 
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'lax'
  });
  
  console.log('Session cookie deleted');
  
  throw redirect(303, '/login');
};
