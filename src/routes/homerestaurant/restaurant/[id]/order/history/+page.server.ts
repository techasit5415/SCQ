import PocketBase from "pocketbase";
import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
import { POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD } from "$env/static/private";

export async function load({ params, cookies }) {
    const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
    const shopId = params.id;

    try {
        // Admin authentication
        await pb.admins.authWithPassword(
            POCKETBASE_ADMIN_EMAIL,
            POCKETBASE_ADMIN_PASSWORD
        );

        console.log(`=== Loading Order History for Shop: ${shopId} ===`);

        // Fetch shop information
        const shop = await pb.collection("Shop").getOne(shopId);

        // Fetch completed and canceled orders for this shop
        const orders = await pb.collection("Order").getFullList({
            filter: `Shop_ID = "${shopId}" && (Status = "Completed" || Status = "Canceled")`,
            expand: "User_ID,Menu_ID",
            sort: "-created"
        });

        console.log(`Order History: ${orders.length}`);

        return {
            shop,
            orders,
            shopId
        };
    } catch (error) {
        console.error("Error loading order history:", error);
        return {
            shop: null,
            orders: [],
            shopId
        };
    }
}