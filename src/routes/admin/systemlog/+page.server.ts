import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
    // Skip session check for now - allow direct access to system log
    console.log('Loading systemlog page (session check disabled for testing)');
    console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

    try {
        console.log('Attempting to connect to PocketBase...');

        // Generate mock system log data with realistic admin activities
        const systemLogs = [
            {
                id: '1',
                timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
                action: 'User Login',
                user: 'admin@scq.com',
                details: 'Administrator logged into the system',
                type: 'AUTH',
                severity: 'INFO',
                ip: '192.168.1.100'
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
                action: 'Restaurant Created',
                user: 'admin@scq.com',
                details: 'New restaurant "Thai Garden" was added to the system',
                type: 'CRUD',
                severity: 'INFO',
                ip: '192.168.1.100'
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                action: 'User Permission Changed',
                user: 'admin@scq.com',
                details: 'User permissions updated for user ID: rest001',
                type: 'SECURITY',
                severity: 'WARNING',
                ip: '192.168.1.100'
            },
            {
                id: '4',
                timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
                action: 'Database Backup',
                user: 'system',
                details: 'Automated database backup completed successfully',
                type: 'SYSTEM',
                severity: 'INFO',
                ip: 'localhost'
            },
            {
                id: '5',
                timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
                action: 'Failed Login Attempt',
                user: 'unknown',
                details: 'Multiple failed login attempts from IP: 192.168.1.200',
                type: 'SECURITY',
                severity: 'ERROR',
                ip: '192.168.1.200'
            },
            {
                id: '6',
                timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
                action: 'Menu Item Updated',
                user: 'restaurant001@scq.com',
                details: 'Menu item "Pad Thai" price updated from ฿120 to ฿130',
                type: 'CRUD',
                severity: 'INFO',
                ip: '192.168.1.150'
            },
            {
                id: '7',
                timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
                action: 'Order Processed',
                user: 'system',
                details: 'Order #ORD-2024-001 processed and sent to kitchen',
                type: 'BUSINESS',
                severity: 'INFO',
                ip: 'localhost'
            },
            {
                id: '8',
                timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
                action: 'System Configuration',
                user: 'admin@scq.com',
                details: 'Payment gateway settings updated',
                type: 'CONFIG',
                severity: 'WARNING',
                ip: '192.168.1.100'
            },
            {
                id: '9',
                timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
                action: 'User Account Deactivated',
                user: 'admin@scq.com',
                details: 'Restaurant account "Bad Restaurant" has been deactivated due to policy violation',
                type: 'SECURITY',
                severity: 'WARNING',
                ip: '192.168.1.100'
            },
            {
                id: '10',
                timestamp: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
                action: 'System Maintenance',
                user: 'system',
                details: 'Scheduled system maintenance completed. Server restart required.',
                type: 'SYSTEM',
                severity: 'INFO',
                ip: 'localhost'
            }
        ];

        // Get log statistics
        const logStats = {
            totalLogs: systemLogs.length,
            errorCount: systemLogs.filter(log => log.severity === 'ERROR').length,
            warningCount: systemLogs.filter(log => log.severity === 'WARNING').length,
            infoCount: systemLogs.filter(log => log.severity === 'INFO').length,
            lastHourLogs: systemLogs.filter(log => 
                new Date().getTime() - log.timestamp.getTime() < 3600000
            ).length
        };

        return {
            systemLogs: systemLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
            logStats
        };

    } catch (err) {
        console.error('Error loading system logs:', err);
        // Return empty data instead of throwing error
        return {
            systemLogs: [],
            logStats: {
                totalLogs: 0,
                errorCount: 0,
                warningCount: 0,
                infoCount: 0,
                lastHourLogs: 0
            }
        };
    }
};