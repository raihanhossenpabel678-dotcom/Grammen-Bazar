import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { UserProfile } from '../types';

const ADMIN_EMAIL = 'raihanhossenpabel678@gmail.com';
const LOCAL_PROFILE_KEY = 'grameen_bazar_local_profile_v1';

type AuthListener = (user: UserProfile | null) => void;

class AuthService {
  private currentUser: UserProfile | null = null;
  private isAuthReady = false;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    // Listen to real Firebase Auth state
    onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        let role: 'admin' | 'customer' = 'customer';

        // Check if admin email or in admins collection
        if (fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          role = 'admin';
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
            if (adminDoc.exists()) {
              role = 'admin';
            }
          } catch {
            // Non-admins will be denied read on admins collection, which is normal
          }
        }

        this.currentUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'গ্রাহক',
          email: fbUser.email || undefined,
          phone: fbUser.phoneNumber || undefined,
          role,
        };
      } else {
        // Check for local stored guest/customer profile so user can place orders without forcing Google login
        try {
          const stored = localStorage.getItem(LOCAL_PROFILE_KEY);
          if (stored) {
            this.currentUser = JSON.parse(stored);
          } else {
            this.currentUser = {
              uid: 'guest-customer-1',
              displayName: 'রিয়াজ হোসেন (Guest)',
              email: 'customer@grameen.com',
              phone: '01712-345678',
              role: 'customer',
              address: 'হাউজ ২৪, ধানমন্ডি',
              district: 'Dhaka',
            };
          }
        } catch {
          this.currentUser = null;
        }
      }

      this.isAuthReady = true;
      this.notify();
    });
  }

  public subscribe(listener: AuthListener) {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentUser));
  }

  public getUser(): UserProfile | null {
    return this.currentUser;
  }

  public isReady(): boolean {
    return this.isAuthReady;
  }

  public isAdmin(): boolean {
    if (!this.currentUser) return false;
    // Check both Firebase Auth user email and profile role
    const fbUser = auth.currentUser;
    if (fbUser && fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return true;
    }
    return (
      this.currentUser.role === 'admin' ||
      this.currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    );
  }

  public isFirebaseAuthAdmin(): boolean {
    const fbUser = auth.currentUser;
    return !!fbUser && fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  }

  public getAdminEmail(): string {
    return ADMIN_EMAIL;
  }

  public getFirebaseUser(): User | null {
    return auth.currentUser;
  }

  // Real Google Sign-in with Popup
  public async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const isAdminUser = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      let role: 'admin' | 'customer' = isAdminUser ? 'admin' : 'customer';

      if (!isAdminUser) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
          if (adminDoc.exists()) {
            role = 'admin';
          }
        } catch {
          // Non-admins denied read on admins collection
        }
      }

      this.currentUser = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'সম্মানিত গ্রাহক',
        email: fbUser.email || undefined,
        phone: fbUser.phoneNumber || undefined,
        role,
      };

      // If authorized admin, ensure record exists in admins collection for RBAC
      if (isAdminUser) {
        try {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'admins', fbUser.uid), {
            uid: fbUser.uid,
            email: fbUser.email,
            role: 'admin',
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (e) {
          console.warn('Failed to sync admin record to admins collection:', e);
        }
      }

      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(this.currentUser));
      this.notify();
      return this.currentUser;
    } catch (error) {
      console.warn('Popup sign in error:', error);
      throw error;
    }
  }

  public loginAsAdmin(email = ADMIN_EMAIL) {
    this.currentUser = {
      uid: 'admin-owner-001',
      displayName: 'Store Manager (Demo Admin)',
      email: email,
      phone: '01700-123456',
      role: 'admin',
    };
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  public loginAsCustomer(name: string, phone: string, email?: string) {
    this.currentUser = {
      uid: `cust-${Date.now()}`,
      displayName: name,
      phone: phone,
      email: email || '',
      role: 'customer',
    };
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  public async logout() {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    this.currentUser = null;
    localStorage.removeItem(LOCAL_PROFILE_KEY);
    this.notify();
  }
}

export const authService = new AuthService();
