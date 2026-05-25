import firestore from '@react-native-firebase/firestore';

const db = firestore();

// ==================== USERS ====================

/**
 * Create user profile in Firestore
 */
export const createUserProfile = async (userId: string, userData: any) => {
  await db.collection('users').doc(userId).set({
    ...userData,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  const doc = await db.collection('users').doc(userId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: any) => {
  await db.collection('users').doc(userId).update({
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

// ==================== TRIPS ====================

/**
 * Create a new trip
 */
export const createTrip = async (tripData: any) => {
  const docRef = await db.collection('trips').add({
    ...tripData,
    status: 'pending',
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Get user's trip history
 */
export const getUserTrips = async (userId: string) => {
  const snapshot = await db
    .collection('trips')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Subscribe to trip updates in real-time
 */
export const subscribeToTrip = (tripId: string, callback: (trip: any) => void) => {
  return db.collection('trips').doc(tripId).onSnapshot(doc => {
    callback({ id: doc.id, ...doc.data() });
  });
};

/**
 * Update trip status
 */
export const updateTripStatus = async (tripId: string, status: string) => {
  await db.collection('trips').doc(tripId).update({
    status,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

// ==================== DRIVERS ====================

/**
 * Subscribe to driver location updates
 */
export const subscribeToDriverLocation = (
  driverId: string,
  callback: (location: { latitude: number; longitude: number }) => void
) => {
  return db.collection('drivers').doc(driverId).onSnapshot(doc => {
    const data = doc.data();
    if (data?.currentLocation) {
      callback({
        latitude: data.currentLocation.latitude,
        longitude: data.currentLocation.longitude,
      });
    }
  });
};

/**
 * Get available drivers
 */
export const getAvailableDrivers = async (vehicleCategory: string) => {
  const snapshot = await db
    .collection('drivers')
    .where('isAvailable', '==', true)
    .where('vehicleCategory', '==', vehicleCategory)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
