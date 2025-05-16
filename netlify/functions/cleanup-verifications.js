const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  try {
    const now = Date.now();
    const verificationsRef = db.collection('emailVerifications');
    const snapshot = await verificationsRef
      .where('expiresAt', '<=', admin.firestore.Timestamp.fromMillis(now))
      .get();

    if (snapshot.empty) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No expired verifications found' }),
      };
    }

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Deleted ${snapshot.size} expired verifications` }),
    };
  } catch (error) {
    console.error('Error cleaning up verifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to clean up verifications' }),
    };
  }
};
