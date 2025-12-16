import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { Activity, PaymentQR, AdminConfig } from '@/types';

const ACTIVITIES_COLLECTION = 'activities';
const SETTINGS_COLLECTION = 'settings';
const QR_DOC_ID = 'payment-qr';
const ADMIN_DOC_ID = 'admin-config';

// Subscribe to activities changes
export const subscribeToActivities = (callback: (activities: Activity[]) => void) => {
  const q = query(collection(db, ACTIVITIES_COLLECTION), orderBy('date', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const activities: Activity[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        title: data.title,
        totalAmount: data.totalAmount,
        participants: data.participants,
        date: data.date,
        amountPerPerson: data.amountPerPerson,
      });
    });
    callback(activities);
  });
};

// Add new activity
export const addActivity = async (activity: Omit<Activity, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), {
      ...activity,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};

// Update activity
export const updateActivity = async (id: string, activity: Activity) => {
  try {
    const docRef = doc(db, ACTIVITIES_COLLECTION, id);
    await updateDoc(docRef, {
      title: activity.title,
      totalAmount: activity.totalAmount,
      participants: activity.participants,
      date: activity.date,
      amountPerPerson: activity.amountPerPerson,
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

// Delete activity
export const deleteActivity = async (id: string) => {
  try {
    await deleteDoc(doc(db, ACTIVITIES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

// Subscribe to payment QR
export const subscribeToPaymentQR = (callback: (qr: PaymentQR | null) => void) => {
  const docRef = doc(db, SETTINGS_COLLECTION, QR_DOC_ID);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        imageUrl: data.imageUrl,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
      });
    } else {
      callback(null);
    }
  });
};

// Save payment QR
export const savePaymentQR = async (qr: PaymentQR) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, QR_DOC_ID);
    await setDoc(docRef, {
      imageUrl: qr.imageUrl,
      bankName: qr.bankName || '',
      accountNumber: qr.accountNumber || '',
      accountName: qr.accountName || '',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving payment QR:', error);
    throw error;
  }
};

// Get admin config
export const getAdminConfig = async (): Promise<AdminConfig | null> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ADMIN_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        pin: data.pin,
        name: data.name,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting admin config:', error);
    throw error;
  }
};

// Save admin config (first time setup)
export const saveAdminConfig = async (config: AdminConfig) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ADMIN_DOC_ID);
    await setDoc(docRef, {
      pin: config.pin,
      name: config.name,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving admin config:', error);
    throw error;
  }
};
