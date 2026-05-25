import storage from '@react-native-firebase/storage';

/**
 * Upload profile photo to Firebase Storage
 */
export const uploadProfilePhoto = async (userId: string, imagePath: string): Promise<string> => {
  const reference = storage().ref(`users/${userId}/profile.jpg`);
  await reference.putFile(imagePath);
  const url = await reference.getDownloadURL();
  return url;
};

/**
 * Delete profile photo from Firebase Storage
 */
export const deleteProfilePhoto = async (userId: string): Promise<void> => {
  const reference = storage().ref(`users/${userId}/profile.jpg`);
  await reference.delete();
};
