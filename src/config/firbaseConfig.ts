// src/config/firebaseConfig.ts
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

import serviceAccount from '../org-tree-514c5-firebase-adminsdk-3buqq-c720c1a642.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export default admin;
