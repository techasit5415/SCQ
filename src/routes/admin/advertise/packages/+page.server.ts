import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
    console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);
    
    try {
        // Check admin authentication
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
        
        await pb.admins.authWithPassword(adminEmail, adminPassword);

        // Get packages
        const packages = await pb.collection('advertisement_packages').getFullList({
            sort: '-created'
        });

        // Get all shop advertisements to count usage
        const shopAdvertisements = await pb.collection('shop_advertisements').getFullList({
            expand: 'package_id'
        });

        console.log('Loaded packages:', packages.length);
        console.log('Loaded shop advertisements:', shopAdvertisements.length);

        // Add usage count to each package (only count Active advertisements)
        const packagesWithUsage = packages.map(pkg => {
            const usageCount = shopAdvertisements.filter(ad => 
                ad.package_id === pkg.id && ad.status === 'Active'
            ).length;
            console.log(`Package ${pkg.name}: ${usageCount} active advertisements`);
            return {
                ...pkg,
                usageCount
            };
        });

        // Calculate stats
        const totalPackages = packages.length;
        const activePackages = packages.filter(pkg => pkg.is_active === true).length;
        const inactivePackages = packages.filter(pkg => pkg.is_active === false).length;
        
        // Calculate different revenue metrics
        const totalPackageRevenue = packagesWithUsage.reduce((sum, pkg: any) => {
            return sum + (pkg.price * pkg.usageCount);
        }, 0);

        // Calculate average package price
        const averagePackagePrice = totalPackages > 0 
            ? packages.reduce((sum, pkg) => sum + pkg.price, 0) / totalPackages 
            : 0;

        // Find most popular package
        const mostPopularPackage = packagesWithUsage.reduce((prev: any, current: any) => {
            const prevUsage = prev.usageCount || 0;
            const currentUsage = current.usageCount || 0;
            return currentUsage > prevUsage ? current : prev;
        }, packagesWithUsage[0]);

        // Get recent package activities
        const recentActivities = await pb.collection('shop_advertisements').getFullList({
            sort: '-created',
            limit: 10,
            expand: 'package_id,shop_id',
            filter: 'package_id != ""'
        });

        const stats = {
            totalPackages,
            activePackages,
            inactivePackages,
            totalRevenue: totalPackageRevenue,
            averagePackagePrice,
            mostPopularPackageName: mostPopularPackage?.name || 'N/A',
            mostPopularPackageUsage: mostPopularPackage?.usageCount || 0
        };

        console.log('Packages page stats:', stats);

        return {
            packages: packagesWithUsage || [],
            stats,
            recentActivities: recentActivities || [],
            shops: []
        };

    } catch (error) {
        console.error('Error loading packages data:', error);
        
        // Return mock data when PocketBase is not available
        const mockPackages = [
            {
                id: '1',
                name: 'Basic Package',
                description: 'แพ็กเกจพื้นฐานสำหรับร้านเริ่มต้น',
                price: 500,
                duration_days: 30,
                features: ['โฆษณาบนหน้าแรก', 'แสดงใน Top 10'],
                is_active: true,
                priority_boost: 0,
                created: new Date().toISOString(),
                usageCount: 2, // จำนวนร้านที่ใช้แพ็กเกจนี้แบบ Active
                expand: {
                    shop_advertisements_via_package: [1, 2, 3]
                }
            },
            {
                id: '2',
                name: 'Premium Package',
                description: 'แพ็กเกจพรีเมียมสำหรับร้านขนาดกลาง',
                price: 1000,
                duration_days: 60,
                features: ['โฆษณาบนหน้าแรก', 'แสดงใน Top 5', 'เน้นสี'],
                is_active: true,
                priority_boost: 5,
                created: new Date().toISOString(),
                usageCount: 2, // จำนวนร้านที่ใช้แพ็กเกจนี้แบบ Active
                expand: {
                    shop_advertisements_via_package: [4, 5]
                }
            }
        ];

        const mockActivities = [
            {
                id: '1',
                title: 'Package purchased',
                description: 'ร้าน ABC ซื้อแพ็กเกจ Premium',
                created: new Date().toISOString()
            }
        ];

        const totalPackages = mockPackages.length;
        const activePackages = mockPackages.filter(pkg => pkg.is_active === true).length;
        const inactivePackages = mockPackages.filter(pkg => pkg.is_active === false).length;
        
        const totalPackageRevenue = mockPackages.reduce((sum, pkg: any) => {
            const usageCount = pkg.usageCount || 0;
            return sum + (pkg.price * usageCount);
        }, 0);

        const averagePackagePrice = totalPackages > 0 
            ? mockPackages.reduce((sum, pkg) => sum + pkg.price, 0) / totalPackages 
            : 0;

        const mostPopularPackage = mockPackages.reduce((prev: any, current: any) => {
            const prevUsage = prev.usageCount || 0;
            const currentUsage = current.usageCount || 0;
            return currentUsage > prevUsage ? current : prev;
        }, mockPackages[0]);

        const stats = {
            totalPackages,
            activePackages,
            inactivePackages,
            totalRevenue: totalPackageRevenue,
            averagePackagePrice,
            mostPopularPackageName: mostPopularPackage?.name || 'N/A',
            mostPopularPackageUsage: mostPopularPackage?.usageCount || 0
        };

        return {
            packages: mockPackages,
            stats,
            recentActivities: mockActivities,
            shops: []
        };
    }
};

export const actions: Actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        
        const priceValue = formData.get('price') as string;
        const durationValue = formData.get('duration') as string;
        const priorityBoostValue = formData.get('priority_boost') as string;
        
        console.log('Form data received:', {
            name: formData.get('name'),
            description: formData.get('description'),
            price: priceValue,
            duration: durationValue,
            priority_boost: priorityBoostValue,
            features: formData.get('features')
        });
        
        const featuresString = formData.get('features') as string;
        let features = [];
        try {
            features = JSON.parse(featuresString || '[]');
        } catch (e) {
            console.error('Error parsing features:', e);
            features = [];
        }
        
        const packageData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: priceValue ? parseFloat(priceValue) : 0,
            duration_days: durationValue ? parseInt(durationValue) : 30,
            features: features,
            is_active: true,
            priority_boost: priorityBoostValue ? parseInt(priorityBoostValue) : 1
        };

        // Validation
        if (!packageData.name || packageData.name.trim() === '') {
            return fail(400, {
                error: 'Package name is required',
                ...packageData
            });
        }
        
        if (!packageData.description || packageData.description.trim() === '') {
            return fail(400, {
                error: 'Package description is required',
                ...packageData
            });
        }
        
        if (isNaN(packageData.price) || packageData.price < 0) {
            return fail(400, {
                error: 'Valid price is required',
                ...packageData
            });
        }
        
        if (isNaN(packageData.duration_days) || packageData.duration_days < 1) {
            return fail(400, {
                error: 'Valid duration is required',
                ...packageData
            });
        }
        
        if (isNaN(packageData.priority_boost) || packageData.priority_boost < 1 || packageData.priority_boost > 10) {
            return fail(400, {
                error: 'Priority boost must be between 1 and 10',
                ...packageData
            });
        }

        console.log('Creating package:', packageData);

        try {
            // Authenticate admin
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            // Create package in PocketBase
            const createdPackage = await pb.collection('advertisement_packages').create(packageData);
            
            console.log('Package created successfully:', createdPackage);
            
            return {
                success: true,
                package: createdPackage
            };

        } catch (error: any) {
            console.error('Error creating package:', error);
            
            let errorMessage = 'Failed to create package. Please try again.';
            
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                console.error('PocketBase error details:', errorData);
                
                if (errorData.data) {
                    const fieldErrors = Object.keys(errorData.data).map(field => 
                        `${field}: ${errorData.data[field].message || errorData.data[field]}`
                    ).join(', ');
                    errorMessage = `Validation errors: ${fieldErrors}`;
                }
            }
            
            return fail(400, {
                error: errorMessage,
                ...packageData
            });
        }
    },

    edit: async ({ request }) => {
        const formData = await request.formData();
        
        const packageId = formData.get('packageId') as string;
        const priceValue = formData.get('price') as string;
        const durationValue = formData.get('duration') as string;
        const priorityBoostValue = formData.get('priority_boost') as string;
        
        const featuresString = formData.get('features') as string;
        let features = [];
        try {
            features = JSON.parse(featuresString || '[]');
        } catch (e) {
            console.error('Error parsing features:', e);
            features = [];
        }
        
        const packageData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: priceValue ? parseFloat(priceValue) : 0,
            duration_days: durationValue ? parseInt(durationValue) : 30,
            features: features,
            priority_boost: priorityBoostValue ? parseInt(priorityBoostValue) : 1
        };

        // Validation
        if (!packageData.name || packageData.name.trim() === '') {
            return fail(400, {
                error: 'Package name is required',
                ...packageData
            });
        }
        
        if (!packageData.description || packageData.description.trim() === '') {
            return fail(400, {
                error: 'Package description is required',
                ...packageData
            });
        }
        
        if (isNaN(packageData.price) || packageData.price < 0) {
            return fail(400, {
                error: 'Valid price is required',
                ...packageData
            });
        }
        
        if (isNaN(packageData.duration_days) || packageData.duration_days < 1) {
            return fail(400, {
                error: 'Valid duration is required',
                ...packageData
            });
        }
        
        if (isNaN(packageData.priority_boost) || packageData.priority_boost < 1 || packageData.priority_boost > 10) {
            return fail(400, {
                error: 'Priority boost must be between 1 and 10',
                ...packageData
            });
        }

        console.log('Editing package:', packageId, packageData);

        try {
            // Authenticate admin
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            // Update package in PocketBase
            const updatedPackage = await pb.collection('advertisement_packages').update(packageId, packageData);
            
            console.log('Package updated successfully:', updatedPackage);
            
            return {
                success: true,
                package: updatedPackage
            };

        } catch (error: any) {
            console.error('Error updating package:', error);
            
            let errorMessage = 'Failed to update package. Please try again.';
            
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                console.error('PocketBase error details:', errorData);
                
                if (errorData.data) {
                    const fieldErrors = Object.keys(errorData.data).map(field => 
                        `${field}: ${errorData.data[field].message || errorData.data[field]}`
                    ).join(', ');
                    errorMessage = `Validation errors: ${fieldErrors}`;
                }
            }
            
            return fail(400, {
                error: errorMessage,
                ...packageData
            });
        }
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const packageId = formData.get('packageId') as string;

        try {
            // Authenticate admin
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            // Delete package from PocketBase
            await pb.collection('advertisement_packages').delete(packageId);
            
            console.log('Package deleted successfully:', packageId);
            
            return {
                success: true,
                deletedId: packageId
            };

        } catch (error) {
            console.error('Error deleting package:', error);
            
            return fail(400, {
                error: 'Failed to delete package. Please try again.'
            });
        }
    },

    toggleStatus: async ({ request }) => {
        const formData = await request.formData();
        const packageId = formData.get('packageId') as string;
        const newStatus = formData.get('status') as string;

        console.log('Toggle status request:', {
            packageId,
            newStatus,
            willSetActive: newStatus === 'active'
        });

        if (!packageId) {
            return fail(400, {
                error: 'Package ID is required'
            });
        }

        try {
            // Authenticate admin
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            // First, get the current package data
            const currentPackage = await pb.collection('advertisement_packages').getOne(packageId);
            console.log('Current package data:', currentPackage);

            // Update package status in PocketBase
            const updatedPackage = await pb.collection('advertisement_packages').update(packageId, {
                is_active: newStatus === 'active'
            });
            
            console.log('Package status updated successfully:', updatedPackage);
            
            return {
                success: true,
                package: updatedPackage
            };

        } catch (error: any) {
            console.error('Error updating package status:', error);
            
            let errorMessage = 'Failed to update package status. Please try again.';
            
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                console.error('PocketBase error details for status toggle:', errorData);
                
                if (errorData.data && errorData.data.is_active) {
                    console.error('is_active field error:', errorData.data.is_active);
                    errorMessage = `Status update failed: ${errorData.data.is_active.message || errorData.data.is_active}`;
                }
            }
            
            return fail(400, {
                error: errorMessage
            });
        }
    }
};