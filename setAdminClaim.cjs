const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = 'oGUe50Qhf7ZDpJh0VlIJR7SWNSk2'; // Your test account UID

async function setAdminClaim() {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Success: Custom claim { admin: true } set for user: ${uid}`);
    
    // Verify the claim
    const user = await admin.auth().getUser(uid);
    console.log('Current claims:', user.customClaims);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting custom claim:', error);
    process.exit(1);
  }
}

setAdminClaim();
