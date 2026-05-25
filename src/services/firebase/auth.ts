import auth from '@react-native-firebase/auth';

/**
 * Register a new user with email and password
 */
export const registerUser = async (email: string, password: string) => {
  const userCredential = await auth().createUserWithEmailAndPassword(email, password);
  return userCredential.user;
};

/**
 * Login user with email and password
 */
export const loginUser = async (email: string, password: string) => {
  const userCredential = await auth().signInWithEmailAndPassword(email, password);
  return userCredential.user;
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  await auth().signOut();
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => auth().currentUser;

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChanged = (callback: (user: any) => void) => {
  return auth().onAuthStateChanged(callback);
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string) => {
  await auth().sendPasswordResetEmail(email);
};
