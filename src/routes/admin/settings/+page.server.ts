import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
    // Skip session check for now - allow direct access to settings
    console.log('Loading settings page (session check disabled for testing)');
    console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

    try {
        console.log('Attempting to connect to PocketBase...');

        // Mock settings data - in real app, this would come from database
        const settings = {
            system: {
                platformName: 'Smart Cuisine Queue (SCQ)',
                platformDescription: 'ระบบจัดการคิวอาหารอัจฉริยะ',
                timezone: 'Asia/Bangkok',
                language: 'th',
                currency: 'THB',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '24h'
            },
            branding: {
                logoUrl: '/SCQ_logo.png',
                primaryColor: '#FF8C00',
                secondaryColor: '#333438',
                faviconUrl: '/favicon.svg'
            },
            restaurant: {
                requireApproval: true,
                defaultCommissionRate: 10,
                allowSelfRegistration: true,
                maxMenuItems: 100,
                maxPhotos: 10,
                categories: ['อาหารไทย', 'อาหารจีน', 'อาหารญี่ปุ่น', 'อาหารเกาหลี', 'อาหารอิตาเลียน', 'ของหวาน', 'เครื่องดื่ม']
            },
            users: {
                requireEmailVerification: true,
                passwordMinLength: 8,
                passwordRequireSymbols: true,
                allowGuestOrders: false,
                defaultUserRole: 'customer',
                sessionTimeout: 24 // hours
            },
            payments: {
                enableCreditCard: true,
                enableMobileBanking: true,
                enableCash: true,
                enableQRPayment: true,
                defaultPaymentMethod: 'qr',
                autoPayoutEnabled: true,
                payoutSchedule: 'weekly', // daily, weekly, monthly
                taxRate: 7 // percentage
            },
            notifications: {
                enableEmailNotifications: true,
                enableSMSNotifications: false,
                enablePushNotifications: true,
                notifyOnNewRestaurant: true,
                notifyOnNewOrder: true,
                notifyOnPayment: true,
                adminEmail: 'admin@scq.com',
                smsProvider: 'none' // none, twilio, aws
            },
            security: {
                enableIPRestriction: false,
                allowedIPs: [],
                enableTwoFactor: false,
                sessionTimeout: 8, // hours
                maxLoginAttempts: 5,
                lockoutDuration: 30, // minutes
                enableAuditLog: true,
                autoBackup: true,
                backupFrequency: 'daily' // daily, weekly, monthly
            },
            integrations: {
                googleMapsApiKey: '',
                facebookAppId: '',
                lineChannelId: '',
                analyticsEnabled: true,
                googleAnalyticsId: ''
            }
        };

        // Mock statistics for settings overview
        const stats = {
            totalUsers: 150,
            totalRestaurants: 25,
            totalOrders: 2840,
            systemUptime: '99.8%',
            lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            storageUsed: '2.4 GB',
            storageLimit: '10 GB'
        };

        return {
            settings,
            stats
        };

    } catch (err) {
        console.error('Error loading settings:', err);
        // Return empty data instead of throwing error
        return {
            settings: {},
            stats: {}
        };
    }
};