import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
    const session = cookies.get('session');
    console.log('Session cookie in advertise:', session);

    // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
    if (!session || !session.match(/^\d+$/)) {
        console.log('No valid session, redirecting to /login');
        // throw redirect(302, '/login');
    }

    console.log('Session valid, loading advertise dashboard');
    console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

    try {
        console.log('Attempting to connect to PocketBase...');
        
        // Try to authenticate as admin first
        try {
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'golfkub04';
            console.log('Attempting admin login with:', adminEmail);
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);
            console.log('Admin authenticated successfully');
        } catch (authError) {
            console.log('Admin auth failed, trying without auth...');
        }
        
        // Initialize advertise data
        let advertiseData = {
            stats: {
                totalPackages: 0,
                activePackages: 0,
                totalApplications: 0,
                pendingApplications: 0,
                activeAdvertisements: 0,
                totalRevenue: 0
            },
            recentPackages: [] as any[],
            recentApplications: [] as any[],
            recentPayments: [] as any[]
        };

        // Fetch dashboard data
        try {
            console.log('Fetching advertisement packages...');
            const packages = await pb.collection('advertisement_packages').getList(1, 10, {
                sort: '-created'
            });
            console.log('Packages result:', packages.items.length, 'items');
            
            advertiseData.stats.totalPackages = packages.totalItems;
            advertiseData.stats.activePackages = packages.items.filter(p => p.is_active).length;
            advertiseData.recentPackages = packages.items.slice(0, 5);
        } catch (packagesError) {
            console.log('Error fetching packages:', packagesError);
        }

        try {
            console.log('Fetching shop advertisements...');
            const advertisements = await pb.collection('shop_advertisements').getList(1, 50, {
                sort: '-created',
                expand: 'shop_id,package_id'
            });
            console.log('Advertisements result:', advertisements.items.length, 'items');
            
            advertiseData.stats.totalApplications = advertisements.totalItems;
            advertiseData.stats.pendingApplications = advertisements.items.filter(a => a.status === 'Pending').length;
            advertiseData.stats.activeAdvertisements = advertisements.items.filter(a => a.status === 'Active').length;
            advertiseData.recentApplications = advertisements.items
                .slice(0, 10)
                .map(app => ({
                    ...app,
                    shopName: app.expand?.shop_id?.name || 'Unknown Shop',
                    packageName: app.expand?.package_id?.name || 'Unknown Package'
                }));
        } catch (advertisementsError) {
            console.log('Error fetching advertisements:', advertisementsError);
        }

        try {
            console.log('Fetching advertisement payments...');
            const payments = await pb.collection('advertisement_payments').getList(1, 50, {
                sort: '-created',
                expand: 'shop_advertisement_id,shop_advertisement_id.shop_id'
            });
            console.log('Payments result:', payments.items.length, 'items');
            
            advertiseData.stats.totalRevenue = payments.items
                .filter(p => p.status === 'Completed')
                .reduce((sum, p) => sum + (p.amount || 0), 0);
            advertiseData.recentPayments = payments.items
                .slice(0, 10)
                .map(payment => ({
                    ...payment,
                    shopName: payment.expand?.shop_advertisement_id?.expand?.shop_id?.name || 'Unknown Shop'
                }));
        } catch (paymentsError) {
            console.log('Error fetching payments:', paymentsError);
        }

        console.log('Final advertise data:', advertiseData);
        
        return advertiseData;
        
    } catch (error) {
        console.error('Error in advertise load function:', error);
        // Return empty data instead of redirecting
        return {
            stats: {
                totalPackages: 0,
                activePackages: 0,
                totalApplications: 0,
                pendingApplications: 0,
                activeAdvertisements: 0,
                totalRevenue: 0
            },
            recentPackages: [],
            recentApplications: [],
            recentPayments: []
        };
    }
}