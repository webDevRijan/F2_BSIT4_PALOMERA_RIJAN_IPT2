import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function readFirebaseCredentials() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      "Firebase credentials are missing. Check the values inside backend/.env.",
    );
  }

  return {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
}

const firebaseOptions = {
  credential: cert(readFirebaseCredentials()),
};

if (process.env.FIREBASE_STORAGE_BUCKET) {
  firebaseOptions.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
}

const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseOptions);

export const db = getFirestore(firebaseApp);

export const bucket = process.env.FIREBASE_STORAGE_BUCKET
  ? getStorage(firebaseApp).bucket()
  : null;

export { FieldValue, Timestamp };
