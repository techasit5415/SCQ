import { error } from '@sveltejs/kit';

export async function load({ params, locals, depends }) {
    // บอก SvelteKit ว่า load function นี้ depend on 'orders:active'
    depends('orders:active');
    
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
            filter: `Shop_ID = "${shopId}" && Status = "In-progress"`,
            expand: "User_ID,Menu_ID",
            sort: "-created",
            $autoCancel: false
        });

        console.log(`Active Orders: ${orders.length}`);

        return {
            shop,
            orders,
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