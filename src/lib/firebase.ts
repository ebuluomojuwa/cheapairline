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
import { Booking, Flight } from '../types';
import { INITIAL_BOOKINGS } from '../data/mockData';

export const SUPER_ADMIN_EMAILS = [
  'ebulupaulboyld@gmail.com',
  'eyobor.elvis@gmail.com',
];

export const SUPER_ADMIN_EMAIL = SUPER_ADMIN_EMAILS[0];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === email.trim().toLowerCase());
}

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
export const db = (firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId.trim() !== '' && firebaseConfigData.firestoreDatabaseId !== '(default)') 
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
  const isSuper = isSuperAdminEmail(user.email);

  const fallbackProfile: AppUserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    role: isSuper ? 'superadmin' : 'user',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  try {
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, fallbackProfile);
      return fallbackProfile;
    } else {
      const existing = snap.data() as AppUserProfile;
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
  } catch (err) {
    console.warn('Firestore user profile sync warning (proceeding with local user profile):', err);
    return fallbackProfile;
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
      console.log('Seeding Firestore with initial booking records...');
      try {
        for (const booking of INITIAL_BOOKINGS) {
          await setDoc(doc(db, BOOKINGS_COLLECTION, booking.id), booking);
        }
      } catch (seedErr) {
        console.warn('Could not seed initial bookings to Firestore:', seedErr);
      }
      onData(INITIAL_BOOKINGS);
    } else {
      const list: Booking[] = snapshot.docs.map((docSnap) => docSnap.data() as Booking);
      onData(list);
    }
  }, (err) => {
    console.warn('Firestore bookings subscription fallback to local data:', err?.message || err);
    onData(INITIAL_BOOKINGS);
  });

  return unsubscribe;
}

/**
 * Helper to recursively clean data object before sending to Firestore, removing undefined fields
 */
export function sanitizeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(
    JSON.stringify(data, (key, value) => (value === undefined ? null : value))
  );
}

export async function addBookingToFirestore(booking: Booking): Promise<void> {
  try {
    const cleanBooking = sanitizeFirestoreData(booking);
    await setDoc(doc(db, BOOKINGS_COLLECTION, booking.id), cleanBooking);
  } catch (err) {
    console.warn('Error adding booking to Firestore:', err);
    throw err;
  }
}

export async function updateBookingInFirestore(bookingId: string, updates: Partial<Booking>): Promise<void> {
  try {
    const ref = doc(db, BOOKINGS_COLLECTION, bookingId);
    const cleanUpdates = sanitizeFirestoreData(updates);
    await updateDoc(ref, cleanUpdates);
  } catch (err) {
    console.warn('Error updating booking in Firestore:', err);
    throw err;
  }
}

export async function deleteBookingFromFirestore(bookingId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
  } catch (err) {
    console.warn('Error deleting booking from Firestore:', err);
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
    console.warn('Notice reading users from Firestore:', err?.message || err);
    onData([]);
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
    console.warn('Notice fetching custom flight prices from Firestore:', err?.message || err);
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

// --- FLIGHT STATUS & SEAT AVAILABILITY MANAGEMENT (SUPER ADMIN) ---

export interface FlightStatusOverride {
  flightId: string;
  status: Flight['status'];
  updatedBy?: string;
  updatedAt?: string;
}

export function subscribeFlightStatuses(onData: (statusesMap: Record<string, Flight['status']>) => void): () => void {
  const colRef = collection(db, 'flight_statuses');
  return onSnapshot(colRef, (snapshot) => {
    const map: Record<string, Flight['status']> = {};
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as FlightStatusOverride;
      if (data.flightId && data.status) {
        map[data.flightId] = data.status;
      }
    });
    onData(map);
  }, (err) => {
    console.warn('Notice fetching flight status overrides from Firestore:', err?.message || err);
    onData({});
  });
}

export async function updateFlightStatusInFirestore(flightId: string, status: Flight['status'], updatedByEmail?: string): Promise<void> {
  const statusRef = doc(db, 'flight_statuses', flightId);
  await setDoc(statusRef, {
    flightId,
    status,
    updatedBy: updatedByEmail || 'Super Admin',
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete all bookings for a specific flight in Firestore to make all seats 100% available
 */
export async function clearFlightBookingsInFirestore(flightId: string, flightNumber: string): Promise<void> {
  try {
    const colRef = collection(db, BOOKINGS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const deletePromises: Promise<void>[] = [];
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as Booking;
      if (data.flightId === flightId || data.flightNumber === flightNumber) {
        deletePromises.push(deleteDoc(doc(db, BOOKINGS_COLLECTION, docSnap.id)));
      }
    });
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Error clearing flight bookings from Firestore:', err);
  }
}


