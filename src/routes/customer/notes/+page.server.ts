import type { PageServerLoad } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
	try {
		// ดึง User ID จาก session
		const userId = cookies.get('session') || "2giyhm2due2kb1g"; // fallback สำหรับ debug
		
		console.log('📝 Loading notes for User ID:', userId);
		
		// ดึงข้อมูล Note ทั้งหมดของผู้ใช้
		const notes = await pb.collection('Note').getFullList({
			filter: `User_ID = "${userId}"`,
			sort: '-created',
			expand: 'Shop_ID,User_ID'
		});
		
		console.log('📝 Found notes:', notes.length);
		
		// ดึงข้อมูล Order ที่มี Note เชื่อมโยง
		const orders = await pb.collection('Order').getFullList({
			filter: `Note != ""`,
			sort: '-created',
			expand: 'Note,Shop_ID'
		});
		
		console.log('📦 Found orders with notes:', orders.length);
		
		// รวมข้อมูล Note กับ Order ที่เกี่ยวข้อง
		const notesWithOrders = notes.map(note => {
			const relatedOrder = orders.find(order => order.Note === note.id);
			return {
				...note,
				relatedOrder
			};
		});
		
		return {
			notes: notesWithOrders,
			ordersWithNotes: orders
		};
	} catch (error: any) {
		console.error('❌ Error loading notes:', error);
		return { 
			notes: [],
			ordersWithNotes: [],
			error: error?.message || 'Unknown error'
		};
	}
};