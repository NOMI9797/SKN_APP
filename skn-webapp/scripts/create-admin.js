const { Client, Databases, ID } = require('node-appwrite');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTIONS = {
    USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS,
    ADMIN_USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ADMIN_USERS
};

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function createAdminUser(email, password, name, userType = 'super_admin') {
    try {
        console.log('Creating admin user...');
        console.log('Email:', email);
        console.log('Name:', name);
        console.log('User Type:', userType);

        // Step 1: Create user document
        const userId = ID.unique();
        const userData = {
            name,
            email,
            password,
            referralCode: generateReferralCode(),
            isActive: true,
            rightPairs: 0,
            leftPairs: 0,
            totalEarnings: 0,
            starLevel: 0,
            currentStarLevel: 0,
            registrationFee: 0,
            paymentStatus: 'approved',
            paymentRequestId: null,
            userType,
            phone: '',
            address: '',
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            userId,
            depth: 0,
            leftActiveCount: 0,
            rightActiveCount: 0,
            pairsCompleted: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const userDoc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            userId,
            userData
        );

        console.log('✅ User document created:', userDoc.$id);

        // Step 2: Create admin record
        const adminData = {
            userId,
            userName: name,
            userEmail: email,
            userType,
            permissions: [
                'manage_users',
                'manage_payments',
                'manage_withdrawals',
                'manage_pins'
            ],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const adminDoc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.ADMIN_USERS,
            ID.unique(),
            adminData
        );

        console.log('✅ Admin record created:', adminDoc.$id);
        console.log('\n🎉 Admin user created successfully!');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 User Type:', userType);
        console.log('🆔 User ID:', userId);
        console.log('\n🌐 You can now login at: http://localhost:3000/login');
        console.log('📊 Admin Dashboard: http://localhost:3000/admin/dashboard');

        return { user: userDoc, admin: adminDoc };

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        throw error;
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
        console.log('Usage: node create-admin.js <email> <password> <name> [userType]');
        console.log('Example: node create-admin.js admin@skn.com admin123 "Admin User" super_admin');
        console.log('\nUser Types: admin, super_admin (default: super_admin)');
        process.exit(1);
    }

    const [email, password, name, userType = 'super_admin'] = args;

    if (!['admin', 'super_admin'].includes(userType)) {
        console.error('❌ Invalid user type. Must be "admin" or "super_admin"');
        process.exit(1);
    }

    try {
        await createAdminUser(email, password, name, userType);
    } catch (error) {
        console.error('❌ Failed to create admin user');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { createAdminUser };

