import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
    const shopId = params.id;

    // Check authentication
    if (!locals.user || locals.role !== 'restaurant') {
        throw error(401, 'Authentication required');
    }

    const pb = locals.pb;

    try {

        console.log(`=== Loading Active Orders for Shop: ${shopId} ===`);

        // Fetch shop information
        const shop = await pb.collection("Shop").getOne(shopId);

        // Fetch active orders for this shop
        const orders = await pb.collection("Order").getFullList({
            filter: `Shop_ID="${shopId}" && Status="In-progress"`,
            expand: "User_ID,Menu_ID",
            sort: "-created",
            $autoCancel: false
        });

        console.log(`Active Orders: ${orders.length}`);

        // ดึงข้อมูล Notes สำหรับแต่ละ Order
        const orderIds = orders.map(order => order.id);
        let notes: any[] = [];
        if (orderIds.length > 0) {
            const noteFilter = orderIds.map(id => `Order_ID="${id}"`).join(' || ');
            notes = await pb.collection('Note').getFullList({
                filter: noteFilter,
                $autoCancel: false
            });
        }

        // เพิ่ม notes เข้าไปใน orders
        const ordersWithNotes = orders.map(order => {
            const orderNotes = notes.filter(note => note.Order_ID === order.id);
            return {
                ...order,
                notes: orderNotes
            };
        });

        return {
            shop,
            orders: ordersWithNotes,
            shopId
        };
    } catch (error) {
        console.error("Error loading active orders:", error);
        return {
            shop: null,
            orders: [],
            shopId
        };
    }
}