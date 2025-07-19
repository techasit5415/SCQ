// import * as db from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ cookies }) => {
	// const user = await db.getUserFromSession(cookies.get('sessionid'));
	// return { user };
};

export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		// const user = await db.getUser(email);
		// cookies.set('sessionid', await db.createSession(user), { path: '/' });

		return { success: true };
	},
	register: async (event) => {
		// TODO register the user
	}
} satisfies Actions;