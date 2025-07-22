// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  throw redirect(303, '/admin');
};
