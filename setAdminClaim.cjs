const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get UID from command line arguments
const uid = process.argv[2];

if (!uid) {
  console.error('\n❌ Error: No UID provided.');
  console.error('Usage: node setAdminClaim.cjs <USER_UID>\n');
  process.exit(1);
}

async function setAdminClaim() {
  try {
    console.log(`Setting admin privileges for UID: ${uid}...`);
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Success: Custom claim { admin: true } set for user: ${uid}`);
    
    // Verify the claim
    const user = await admin.auth().getUser(uid);
    console.log('Current claims:', user.customClaims);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting custom claim:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.error('Make sure the UID is correct and the user exists in Firebase Authentication.');
    }
    process.exit(1);
  }
}

setAdminClaim();
