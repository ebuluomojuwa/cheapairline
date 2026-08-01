import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  browserLocalPersistence,
  inMemoryPersistence,
  browserPopupRedirectResolver,
  setPersistence,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { Booking } from '../types';
import { INITIAL_BOOKINGS } from '../data/mockData';

export const SUPER_ADMIN_EMAIL = 'ebulupaulboyld@gmail.com';

export type UserRole = 'superadmin' | 'admin' | 'user';

export interface AppUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
}

// Initialize Firebase App
const app = initializeApp({
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
});

// Initialize Firebase Auth using browserLocalPersistence and inMemoryPersistence to bypass IndexedDB transaction bugs
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: [browserLocalPersistence, inMemoryPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
} catch {
  authInstance = getAuth(app);
}
export const auth = authInstance;

// Use specified firestoreDatabaseId if available
export const db = firebaseConfigData.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// --- AUTHENTICATION HELPERS ---

/**
 * Sign in using Google OAuth Popup
 */
export async function signInWithGoogle(): Promise<AppUserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const cred = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    const profile = await syncUserProfile(cred.user);
    return profile;
  } catch (err: any) {
    console.warn('Google sign in initial attempt failed:', err);
    // If IndexedDB or storage transaction error occurred, switch persistence to inMemory and retry
    if (
      err?.message?.includes('transaction was aborted') ||
      err?.message?.includes('QuotaExceededError') ||
      err?.code === 'auth/internal-error'
    ) {
      try {
        await setPersistence(auth, inMemoryPersistence);
        const cred = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
        const profile = await syncUserProfile(cred.user);
        return profile;
      } catch (retryErr) {
        throw retryErr;
      }
    }
    throw err;
  }
}

/**
 * Register user document in Firestore and set superadmin role if email matches SUPER_ADMIN_EMAIL
 */
export async function syncUserProfile(user: FirebaseUser): Promise<AppUserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  const isSuper = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  if (!snap.exists()) {
    const newProfile: AppUserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      role: isSuper ? 'superadmin' : 'user',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  } else {
    const existing = snap.data() as AppUserProfile;
    // Always enforce superadmin role for the designated email
    let updatedRole = existing.role;
    if (isSuper && existing.role !== 'superadmin') {
      updatedRole = 'superadmin';
    }
    const updatedProfile: AppUserProfile = {
      ...existing,
      role: updatedRole,
      lastLoginAt: new Date().toISOString(),
    };
    await setDoc(userRef, updatedProfile, { merge: true });
    return updatedProfile;
  }
}

// --- FIRESTORE BOOKINGS METHODS ---

const BOOKINGS_COLLECTION = 'bookings';

/**
 * Real-time listener for bookings collection with auto-seeding if database is empty
 */
export function subscribeBookings(onData: (bookings: Booking[]) => void): () => void {
  const colRef = collection(db, BOOKINGS_COLLECTION);

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      // Seed database with initial bookings
      console.log('Seeding Firestore with initial booking records...');
      for (const booking of INITIAL_BOOKINGS) {
        await setDoc(doc(db, BOOKINGS_COLLECTION, booking.id), booking);
      }
    } else {
      const list: Booking[] = snapshot.docs.map((docSnap) => docSnap.data() as Booking);
      onData(list);
    }
  }, (err) => {
    console.error('Firestore bookings subscription error:', err);
    // Fallback to initial local bookings if offline/error
    onData(INITIAL_BOOKINGS);
  });

  return unsubscribe;
}

export async function addBookingToFirestore(booking: Booking): Promise<void> {
  try {
    await setDoc(doc(db, BOOKINGS_COLLECTION, booking.id), booking);
  } catch (err) {
    console.error('Error adding booking to Firestore:', err);
    throw err;
  }
}

export async function updateBookingInFirestore(bookingId: string, updates: Partial<Booking>): Promise<void> {
  try {
    const ref = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(ref, updates);
  } catch (err) {
    console.error('Error updating booking in Firestore:', err);
    throw err;
  }
}

export async function deleteBookingFromFirestore(bookingId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
  } catch (err) {
    console.error('Error deleting booking from Firestore:', err);
    throw err;
  }
}

// --- USER ROLE MANAGEMENT (SUPER ADMIN) ---

export function subscribeUserProfiles(onData: (users: AppUserProfile[]) => void): () => void {
  const colRef = collection(db, 'users');
  return onSnapshot(colRef, (snapshot) => {
    const users: AppUserProfile[] = snapshot.docs.map(d => d.data() as AppUserProfile);
    onData(users);
  }, (err) => {
    console.error('Error fetching users:', err);
  });
}

export async function updateUserRoleInFirestore(uid: string, newRole: UserRole): Promise<void> {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { role: newRole });
}

// --- FLIGHT PRICE MANAGEMENT (SUPER ADMIN) ---

export interface FlightPriceOverride {
  flightId: string;
  price: number;
  updatedBy?: string;
  updatedAt?: string;
}

export function subscribeFlightPrices(onData: (prices: Record<string, number>) => void): () => void {
  const colRef = collection(db, 'flight_prices');
  return onSnapshot(colRef, (snapshot) => {
    const pricesMap: Record<string, number> = {};
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as FlightPriceOverride;
      if (data.flightId && typeof data.price === 'number') {
        pricesMap[data.flightId] = data.price;
      }
    });
    onData(pricesMap);
  }, (err) => {
    console.error('Error fetching custom flight prices from Firestore:', err);
    onData({});
  });
}

export async function updateFlightPriceInFirestore(flightId: string, price: number, updatedByEmail?: string): Promise<void> {
  const priceRef = doc(db, 'flight_prices', flightId);
  await setDoc(priceRef, {
    flightId,
    price,
    updatedBy: updatedByEmail || 'Super Admin',
    updatedAt: new Date().toISOString(),
  });
}

