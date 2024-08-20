import * as admin from 'firebase-admin';
import * as path from 'path';

// Path to your service account key
const serviceAccount = require(path.resolve(__dirname, '../data/firebaseServiceAccount.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export {admin};
