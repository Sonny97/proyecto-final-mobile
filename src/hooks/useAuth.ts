import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, loginUser, registerUser, logoutUser } from '../services/firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string, navigation?: any) => {
    setLoading(true);
    setError(null);
    try {
      // MOCK LOGIN: Permite cualquier usuario/contraseña en desarrollo
      if (__DEV__) {
        const mockUser = {
          uid: 'mock-uid',
          email,
          displayName: 'Usuario Mock',
        };
        setUser(mockUser);
        // Si se pasa navigation, navega al Tab principal
        if (navigation) {
          navigation.replace?.('HomeScreen');
        }
        return mockUser;
      } else {
        await loginUser(email, password);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await registerUser(email, password);
      return newUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  return { user, loading, error, login, register, logout };
};
