const { databases, DATABASE_ID, COLLECTIONS } = require('../src/lib/appwrite');
const { Query } = require('appwrite');

async function fixUserStatus() {
  try {
    console.log('🔧 Fixing user payment status...');
    
    // Get all users with paymentStatus 'pending' but no paymentRequestId
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [
        Query.equal('paymentStatus', 'pending'),
        Query.isNull('paymentRequestId')
      ]
    );
    
    console.log(`Found ${response.total} users with incorrect status`);
    
    for (const user of response.documents) {
      console.log(`Fixing user: ${user.email} (${user.$id})`);
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        user.$id,
        {
          paymentStatus: 'not_submitted',
          paymentRequestId: null
        }
      );
      
      console.log(`✅ Fixed user: ${user.email}`);
    }
    
    console.log('🎉 All users fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing user status:', error);
  }
}

// Run the script
fixUserStatus();
