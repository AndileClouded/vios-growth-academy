import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Saves a consultation request to Firestore
 */
export async function saveConsultationRequest(data: { name: string; email: string; message: string }) {
  const path = 'consultationRequests';
  try {
    await addDoc(collection(db, path), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Saves a direct inquiry to Firestore
 */
export async function saveDirectInquiry(data: { name: string; email: string; message: string; subject?: string }) {
  const path = 'directInquiries';
  try {
    await addDoc(collection(db, path), {
      name: data.name,
      email: data.email,
      message: data.message,
      subject: data.subject || 'Footer Inquiry',
      status: 'pending',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Saves a partnership inquiry to Firestore
 */
export async function savePartnershipInquiry(data: { name: string; email: string; organization: string; message: string }) {
  const path = 'partnershipInquiries';
  try {
    await addDoc(collection(db, path), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveDonation(data: {
  firstName: string;
  lastName: string;
  email: string;
  amountUsd: number;
  amountLocal: string;
  currency: string;
  transactionId: string;
}) {
  try {
    await addDoc(collection(db, 'donations'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'donations');
  }
}

export async function getSiteContent(key: string): Promise<string | null> {
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'siteContent', key));
    return snap.exists() ? snap.data().value : null;
  } catch {
    return null;
  }
}
