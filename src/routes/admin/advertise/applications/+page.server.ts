import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }: { cookies: any }) => {
    console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);
    
    try {
        // Check admin authentication
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
        
        await pb.admins.authWithPassword(adminEmail, adminPassword);

        // Get shop advertisements (applications) with expanded shop and package data
        const applications = await pb.collection('shop_advertisements').getFullList({
            sort: '-created',
            expand: 'shop_id,package_id'
        });

        // Get all shops for dropdown/filter (Note: collection name is 'Shop' not 'shops')
        const allShops = await pb.collection('Shop').getFullList({
            sort: 'name'
        });
        
        // กรองเอาเฉพาะร้านจริง ไม่เอาร้าน SCQ (ใช้สำหรับ Top-up)
        const shops = allShops.filter((shop: any) => {
            return shop.id !== '000000000000001' && !shop.Name?.startsWith('[SYSTEM]') && !shop.name?.startsWith('[SYSTEM]');
        });

        // Get all packages for dropdown/filter
        const packages = await pb.collection('advertisement_packages').getFullList({
            sort: 'name'
        });

        console.log('Loaded applications:', applications.length);
        console.log('Loaded shops:', shops.length);
        console.log('Loaded packages:', packages.length);
        
        // Debug: Check actual status values
        console.log('Application statuses:', applications.map(app => ({
            id: app.id,
            status: app.status,
            shop_name: app.expand?.shop_id?.name || 'Unknown'
        })));

        // Calculate statistics
        const totalApplications = applications.length;
        const pendingApplications = applications.filter(app => 
            app.status?.toLowerCase() === 'pending'
        ).length;
        const approvedApplications = applications.filter(app => 
            app.status?.toLowerCase() === 'approved'
        ).length;
        const rejectedApplications = applications.filter(app => 
            app.status?.toLowerCase() === 'rejected'
        ).length;
        const activeApplications = applications.filter(app => 
            app.status?.toLowerCase() === 'active'
        ).length;

        // Calculate approval rate (active vs cancelled applications)
        const cancelledApplications = applications.filter(app => 
            app.status?.toLowerCase() === 'cancelled'
        ).length;
        const processedApplications = activeApplications + cancelledApplications;
        const approvalRate = processedApplications > 0 ? 
            ((activeApplications / processedApplications) * 100).toFixed(1) : 0;



        const stats = {
            totalApplications,
            pendingApplications,
            approvedApplications,
            rejectedApplications,
            activeApplications,
            cancelledApplications,
            approvalRate
        };

        console.log('Applications page stats:', stats);

        return {
            applications: applications || [],
            shops: shops || [],
            packages: packages || [],
            stats
        };

    } catch (error) {
        console.error('Error loading applications data:', error);
        
        // Return empty data when PocketBase is not available or has errors
        const stats = {
            totalApplications: 0,
            pendingApplications: 0,
            activeApplications: 0,
            expiredApplications: 0,
            cancelledApplications: 0,
            approvalRate: 0
        };

        return {
            applications: [],
            shops: [],
            packages: [],
            stats
        };
    }
};

export const actions: Actions = {
    approve: async ({ request }: { request: Request }) => {
        const formData = await request.formData();
        const applicationId = formData.get('applicationId') as string;

        try {
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            // Update application status to active
            const updatedApplication = await pb.collection('shop_advertisements').update(applicationId, {
                status: 'active',
                start_date: new Date().toISOString(),
                updated: new Date().toISOString()
            });
            
            console.log('Application approved successfully:', updatedApplication);
            
            return {
                success: true,
                application: updatedApplication
            };

        } catch (error: any) {
            console.error('Error approving application:', error);
            
            return fail(400, {
                error: 'Failed to approve application. Please try again.'
            });
        }
    },

    reject: async ({ request }: { request: Request }) => {
        const formData = await request.formData();
        const applicationId = formData.get('applicationId') as string;
        const reason = formData.get('reason') as string;

        try {
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            // Update application status to cancelled with reason
            const updatedApplication = await pb.collection('shop_advertisements').update(applicationId, {
                status: 'cancelled',
                updated: new Date().toISOString(),
                // You might want to add a notes field to store rejection reason
            });
            
            console.log('Application rejected successfully:', updatedApplication);
            
            return {
                success: true,
                application: updatedApplication
            };

        } catch (error: any) {
            console.error('Error rejecting application:', error);
            
            return fail(400, {
                error: 'Failed to reject application. Please try again.'
            });
        }
    },

    updateStatus: async ({ request }: { request: Request }) => {
        const formData = await request.formData();
        const applicationId = formData.get('applicationId') as string;
        const newStatus = formData.get('status') as string;

        // Validate status
        const validStatuses = ['Pending', 'Active', 'Expired', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            return fail(400, {
                error: 'Invalid status provided'
            });
        }

        try {
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            const updateData: any = {
                status: newStatus,
                updated: new Date().toISOString()
            };

            // Set start_date when approving
            if (newStatus === 'active') {
                updateData.start_date = new Date().toISOString();
            }

            // Update application status
            const updatedApplication = await pb.collection('shop_advertisements').update(applicationId, updateData);
            
            console.log('Application status updated successfully:', updatedApplication);
            
            return {
                success: true,
                application: updatedApplication
            };

        } catch (error: any) {
            console.error('Error updating application status:', error);
            
            return fail(400, {
                error: 'Failed to update application status. Please try again.'
            });
        }
    }
};