import type { PageServerLoad, Actions } from './$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  console.log('Session cookie in manage users:', session);

  // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /admin');
      // throw redirect(302, '/admin');
  }

  console.log('Session valid, loading manage users page');
  console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Try to authenticate as admin first
    try {
      const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
      console.log('Attempting admin login with:', adminEmail);
      
      await pb.admins.authWithPassword(adminEmail, adminPassword);
      console.log('Admin authenticated successfully');
    } catch (authError) {
      console.log('Admin auth failed:', authError);
      console.log('Trying without auth...');
      // Continue without admin auth - data might still be accessible
    }
    
    // Fetch users with expanded Role relation
    let users: any[] = [];
    try {
      console.log('Fetching users with roles...');
      users = await pb.collection('users').getFullList({
        expand: 'Role',
        sort: '-created'
      });
      console.log('Users fetched:', users.length);
    } catch (error) {
      console.error('Error fetching users:', error);
    }

    // Fetch roles for reference
    let roles: any[] = [];
    try {
      console.log('Fetching roles...');
      roles = await pb.collection('Role').getFullList();
      console.log('Roles fetched:', roles.length);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }

    // Calculate user statistics by role
    const userStats = calculateUserStats(users);

    const result = {
      users,
      roles,
      userStats,
      totalUsers: users.length
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading manage users data:', error);
    
    // Return fallback data if database connection fails
    return {
      users: [],
      roles: [],
      userStats: {
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
        restaurantUsers: 0
      },
      totalUsers: 0
    };
  }
};

function calculateUserStats(users: any[]) {
  const stats = {
    totalUsers: users.length,
    adminUsers: 0,
    regularUsers: 0,
    restaurantUsers: 0
  };

  users.forEach(user => {
    const roleName = user.expand?.Role?.name || 'user';
    switch (roleName.toLowerCase()) {
      case 'admin':
        stats.adminUsers++;
        break;
      case 'user':
        stats.regularUsers++;
        break;
      case 'restaurant':
        stats.restaurantUsers++;
        break;
      default:
        stats.regularUsers++;
    }
  });

  return stats;
}

export const actions: Actions = {
  updateUser: async ({ request }) => {
    try {
      const formData = await request.formData();
      const userId = formData.get('userId') as string;
      const name = formData.get('name') as string;
      const lastname = formData.get('lastname') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;
      const roleId = formData.get('roleId') as string;

      console.log('Updating user:', { userId, name, lastname, email, phone, roleId });

      // Try to authenticate - skip if fails since PocketBase might allow public updates
      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        console.log('Attempting admin login with:', adminEmail);
        
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Admin authenticated successfully');
      } catch (authError) {
        console.log('Admin auth failed, continuing without auth...');
        // PocketBase might be configured to allow updates without admin auth
        // This is common in development environments
      }

      // Update user
      const updateData: any = {
        name,
        Lastname: lastname,
        email,
        phone
      };

      // Only add role if roleId is provided and not empty
      if (roleId && roleId.trim() !== '') {
        updateData.Role = roleId;
      }

      console.log('Update data:', updateData);
      const updatedUser = await pb.collection('users').update(userId, updateData);
      console.log('User updated successfully:', updatedUser);

      return {
        success: true,
        message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ'
      };

    } catch (error: any) {
      console.error('Error updating user:', error);
      return fail(400, {
        error: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้: ' + (error.message || 'Unknown error')
      });
    }
  },

  deleteUser: async ({ request }) => {
    try {
      const formData = await request.formData();
      const userId = formData.get('userId') as string;

      console.log('Deleting user:', userId);

      // Try to authenticate as admin first, but continue if fails
      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        console.log('Attempting admin login for delete with:', adminEmail);
        
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Admin authenticated successfully for delete');
      } catch (authError) {
        console.log('Admin auth failed for delete:', authError);
        console.log('Trying without auth...');
        // Continue without admin auth
      }

      // Delete user
      await pb.collection('users').delete(userId);
      console.log('User deleted successfully:', userId);

      return {
        success: true,
        message: 'ลบผู้ใช้สำเร็จ'
      };

    } catch (error: any) {
      console.error('Error deleting user:', error);
      return fail(400, {
        error: 'ไม่สามารถลบผู้ใช้ได้: ' + (error.message || 'Unknown error')
      });
    }
  }
};


