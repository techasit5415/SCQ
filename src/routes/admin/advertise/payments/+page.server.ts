import type { PageServerLoad, Actions } from './$types.js';
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
        
        try {
            await pb.admins.authWithPassword(adminEmail, adminPassword);
        } catch (authError) {
            console.log('Admin auth failed, using bypass for development');
        }

        // Get all advertisement payments with correct relationships
        const payments = await pb.collection('advertisement_payments').getFullList({
            sort: '-created',
            expand: 'shop_advertisement_id,shop_advertisement_id.shop_id,shop_advertisement_id.package_id'
        });

        // Get shops list for reference
        const shops = await pb.collection('Shop').getFullList({
            sort: 'name'
        });

        // Calculate statistics (using correct field name 'status')
        const totalPayments = payments.length;
        const completedPayments = payments.filter(payment => 
            payment.status?.toLowerCase() === 'completed'
        ).length;
        const pendingPayments = payments.filter(payment => 
            payment.status?.toLowerCase() === 'pending'
        ).length;
        const failedPayments = payments.filter(payment => 
            payment.status?.toLowerCase() === 'failed'
        ).length;
        const refundedPayments = payments.filter(payment => 
            payment.status?.toLowerCase() === 'refunded'
        ).length;

        // Calculate total revenue
        const totalRevenue = payments
            .filter(payment => payment.status?.toLowerCase() === 'completed')
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Calculate monthly revenue (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = payments
            .filter(payment => {
                const paymentDate = new Date(payment.created);
                return payment.status?.toLowerCase() === 'completed' &&
                       paymentDate.getMonth() === currentMonth &&
                       paymentDate.getFullYear() === currentYear;
            })
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Get payment methods breakdown
        const paymentMethods: Record<string, number> = payments.reduce((acc: Record<string, number>, payment) => {
            if (payment.status?.toLowerCase() === 'completed') {
                const method = payment.payment_method || 'unknown';
                acc[method] = (acc[method] || 0) + (payment.amount || 0);
            }
            return acc;
        }, {});

        const stats = {
            totalPayments,
            completedPayments,
            pendingPayments,
            failedPayments,
            refundedPayments,
            totalRevenue,
            monthlyRevenue,
            paymentMethods
        };

        console.log('Payments page stats:', stats);

        return {
            payments: payments || [],
            shops: shops || [],
            stats
        };

    } catch (error) {
        console.error('Error loading payments data:', error);
        return {
            payments: [],
            shops: [],
            stats: {
                totalPayments: 0,
                completedPayments: 0,
                pendingPayments: 0,
                failedPayments: 0,
                refundedPayments: 0,
                totalRevenue: 0,
                monthlyRevenue: 0,
                paymentMethods: {}
            }
        };
    }
};

export const actions: Actions = {
    confirmPayment: async ({ request }: { request: Request }) => {
        const formData = await request.formData();
        const paymentId = formData.get('paymentId') as string;
        const notes = formData.get('notes') as string;

        try {
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            // Get payment record with expanded shop_advertisement
            const payment = await pb.collection('advertisement_payments').getOne(paymentId, {
                expand: 'shop_advertisement_id'
            });

            // Update payment status to completed
            const updatedPayment = await pb.collection('advertisement_payments').update(paymentId, {
                status: 'Completed',
                notes: notes || 'Payment confirmed by admin',
                updated: new Date().toISOString()
            });

            // Update related shop_advertisement status
            if (payment.shop_advertisement_id) {
                await pb.collection('shop_advertisements').update(payment.shop_advertisement_id, {
                    payment_status: 'Paid',
                    status: 'Active',
                    start_date: new Date().toISOString(),
                    updated: new Date().toISOString()
                });
                
                console.log('Auto-activated advertisement:', payment.shop_advertisement_id);
            }
            
            console.log('Payment confirmed successfully:', updatedPayment);
            
            return {
                success: true,
                payment: updatedPayment
            };
            
        } catch (error) {
            console.error('Error confirming payment:', error);
            return fail(500, {
                error: 'Failed to confirm payment. Please try again.'
            });
        }
    },

    rejectPayment: async ({ request }: { request: Request }) => {
        const formData = await request.formData();
        const paymentId = formData.get('paymentId') as string;
        const reason = formData.get('reason') as string;

        try {
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            // Get payment record
            const payment = await pb.collection('advertisement_payments').getOne(paymentId);

            // Update payment status to failed
            const updatedPayment = await pb.collection('advertisement_payments').update(paymentId, {
                status: 'Failed',
                notes: reason || 'Payment rejected by admin',
                updated: new Date().toISOString()
            });

            // Update related shop_advertisement status
            if (payment.shop_advertisement_id) {
                await pb.collection('shop_advertisements').update(payment.shop_advertisement_id, {
                    payment_status: 'Failed',
                    status: 'Cancelled',
                    updated: new Date().toISOString()
                });
                
                console.log('Auto-cancelled advertisement:', payment.shop_advertisement_id);
            }
            
            console.log('Payment rejected successfully:', updatedPayment);
            
            return {
                success: true,
                payment: updatedPayment
            };
            
        } catch (error) {
            console.error('Error rejecting payment:', error);
            return fail(500, {
                error: 'Failed to reject payment. Please try again.'
            });
        }
    },

    refundPayment: async ({ request }: { request: Request }) => {
        const formData = await request.formData();
        const paymentId = formData.get('paymentId') as string;
        const reason = formData.get('reason') as string;

        try {
            const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
            const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'P@ssword12';
            
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            // Get payment record
            const payment = await pb.collection('advertisement_payments').getOne(paymentId);

            // Update payment status to refunded
            const updatedPayment = await pb.collection('advertisement_payments').update(paymentId, {
                status: 'Refunded',
                notes: reason || 'Payment refunded by admin',
                updated: new Date().toISOString()
            });

            // Update related shop_advertisement status
            if (payment.shop_advertisement_id) {
                await pb.collection('shop_advertisements').update(payment.shop_advertisement_id, {
                    payment_status: 'Failed',
                    status: 'Cancelled',
                    updated: new Date().toISOString()
                });
                
                console.log('Auto-cancelled advertisement after refund:', payment.shop_advertisement_id);
            }
            
            console.log('Payment refunded successfully:', updatedPayment);
            
            return {
                success: true,
                payment: updatedPayment
            };
            
        } catch (error) {
            console.error('Error processing refund:', error);
            return fail(500, {
                error: 'Failed to process refund. Please try again.'
            });
        }
    }
};