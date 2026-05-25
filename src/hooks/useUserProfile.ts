import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile, createUserProfile } from '../services/firebase/firestore';

interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  gender: 'male' | 'female' | 'other' | '';
  language: 'es' | 'en';
  photoURL: string | null;
}

export const useUserProfile = (userId: string | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(userId);
        setProfile(data as UserProfile | null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) return;

    try {
      await updateUserProfile(userId, updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [userId]);

  const createProfile = useCallback(async (profileData: Omit<UserProfile, 'id'>) => {
    if (!userId) return;

    try {
      await createUserProfile(userId, profileData);
      setProfile({ id: userId, ...profileData });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [userId]);

  return { profile, loading, error, updateProfile, createProfile };
};
