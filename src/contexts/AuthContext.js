import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
  PhoneAuthProvider,
  RecaptchaVerifier
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationId, setVerificationId] = useState(null);

  // Initialize reCAPTCHA verifier
  const setupRecaptcha = async (containerId) => {
    let timeoutId = null;
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('reCAPTCHA setup timed out'));
        }, 30000); // 30 second timeout
      });

      // Clear any existing verifier
      if (window.recaptchaVerifier) {
        try {
          await window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('Error clearing existing verifier:', e);
        }
        window.recaptchaVerifier = null;
      }

      // Remove any existing container
      const existingContainer = document.getElementById(containerId);
      if (existingContainer) {
        existingContainer.remove();
      }

      // Create new container with proper styling
      const container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'fixed';
      container.style.bottom = '0';
      container.style.right = '0';
      container.style.zIndex = '2147483647';
      container.style.opacity = '0';
      document.body.appendChild(container);

      // Wait for container to be in DOM
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new verifier
      const verifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: (response) => {
          console.log('reCAPTCHA solved:', response);
          if (timeoutId) clearTimeout(timeoutId);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        },
        'error-callback': (error) => {
          console.error('reCAPTCHA error:', error);
          if (timeoutId) clearTimeout(timeoutId);
        }
      });

      // Store verifier globally
      window.recaptchaVerifier = verifier;

      // Race between render and timeout
      await Promise.race([
        verifier.render(),
        timeoutPromise
      ]);

      // Clear timeout if render succeeds
      if (timeoutId) clearTimeout(timeoutId);
      
      return verifier;
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      // Clean up on error
      if (timeoutId) clearTimeout(timeoutId);
      
      const container = document.getElementById(containerId);
      if (container) {
        container.remove();
      }
      if (window.recaptchaVerifier) {
        try {
          await window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('Error clearing verifier:', e);
        }
        window.recaptchaVerifier = null;
      }

      // Provide more specific error message
      if (error.message.includes('timeout')) {
        throw new Error('Phone verification timed out. Please check your internet connection and try again.');
      }
      throw new Error('Failed to initialize phone verification. Please refresh the page and try again.');
    }
  };

  // Send verification code
  async function sendVerificationCode(phoneNumber, containerId = 'recaptcha-container') {
    let verifier = null;
    let timeoutId = null;

    try {
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }

      // Create a timeout promise for the entire operation
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Phone verification timed out'));
        }, 60000); // 60 second timeout for the entire operation
      });

      // Format phone number to E.164 format
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;
      
      // Set up reCAPTCHA
      verifier = await setupRecaptcha(containerId);
      if (!verifier) {
        throw new Error('Failed to initialize reCAPTCHA verifier');
      }

      // Create a phone provider instance
      const phoneProvider = new PhoneAuthProvider(auth);
      
      // Race between verification and timeout
      const verificationId = await Promise.race([
        phoneProvider.verifyPhoneNumber(formattedPhone, verifier),
        timeoutPromise
      ]);
      
      // Clear timeout if verification succeeds
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      // Store verification ID
      window.verificationId = verificationId;
      setVerificationId(verificationId);
      
      return verificationId;
    } catch (error) {
      console.error('Error sending verification code:', error);
      
      // Clean up verifier on error
      if (verifier) {
        try {
          await verifier.clear();
        } catch (e) {
          console.warn('Error clearing verifier:', e);
        }
      }
      window.recaptchaVerifier = null;

      // Clear timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Handle specific Firebase errors
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Phone authentication is not enabled. Please contact support.');
      } else if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please enter a valid phone number.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many verification attempts. Please try again later.');
      } else if (error.code === 'auth/invalid-app-credential') {
        throw new Error('Phone verification is not properly configured. Please contact support.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Phone verification timed out. Please check your internet connection and try again.');
      }
      
      throw error;
    } finally {
      // Clean up container after a delay to ensure reCAPTCHA has finished
      setTimeout(() => {
        try {
          const container = document.getElementById(containerId);
          if (container) {
            container.remove();
          }
        } catch (e) {
          console.warn('Error cleaning up reCAPTCHA container:', e);
        }
      }, 1000);

      // Ensure timeout is cleared
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  };

  // Verify code
  async function verifyCode(code) {
    try {
      if (!window.verificationId) {
        throw new Error('Please send verification code first');
      }

      // Store the current user's data
      const originalUser = currentUser;
      if (!originalUser) {
        throw new Error('No authenticated user found');
      }
      console.log('Original user before verification:', originalUser);

      try {
        // Update the user document with phone verification status
        const userRef = doc(db, 'users', originalUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          let userData = userDoc.data();
          console.log('User data from Firestore:', userData);
          
          // Update user document
          await updateDoc(userRef, {
            phoneVerified: true,
            updatedAt: new Date(),
            updatedBy: originalUser.uid
          });

          // Return user with role information
          return {
            ...originalUser,
            ...userData,
            role: userData.role, // Ensure role is explicitly set
            phoneVerified: true
          };
        } else {
          throw new Error('User document not found');
        }
      } catch (error) {
        console.error('Error updating user after verification:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in verifyCode:', error);
      throw error;
    }
  }

  async function signup(email, password, firstName, lastName, role, schoolId, phoneNumber) {
    try {
      if (!phoneNumber) {
        throw new Error('Phone number is required for all users');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document with pending status
      await setDoc(doc(db, 'users', user.uid), {
        email,
        firstName,
        lastName,
        role,
        schoolId,
        phoneNumber,
        phoneVerified: false,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Send email verification
      await sendEmailVerification(user);

      // If this is a parent account, link any existing students
      if (role === 'PARENT') {
        try {
          // Find all students with this parent's email
          const studentsQuery = query(
            collection(db, 'students'),
            where('parentEmail', '==', email),
            where('schoolId', '==', schoolId)
          );
          const studentsSnapshot = await getDocs(studentsQuery);

          if (!studentsSnapshot.empty) {
            // Get all student IDs
            const studentIds = studentsSnapshot.docs.map(doc => doc.id);

            // Update parent's document with all associated students
            await updateDoc(doc(db, 'users', user.uid), {
              students: studentIds,
              updatedAt: new Date(),
            });

            // Update all student documents with the parent ID
            await Promise.all(
              studentsSnapshot.docs.map(studentDoc => 
                updateDoc(doc(db, 'students', studentDoc.id), {
                  parentId: user.uid,
                  updatedAt: new Date(),
                })
              )
            );

            console.log(`Linked ${studentIds.length} students to parent account:`, email);
          }
        } catch (error) {
          console.error('Error linking students to parent account:', error);
          // Don't throw the error - we still want the account to be created
        }
      }

      // Notify school admin about new user
      await addDoc(collection(db, 'notifications'), {
        type: 'NEW_USER',
        userId: user.uid,
        schoolId,
        status: 'unread',
        createdAt: new Date(),
      });

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      console.log('Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase Auth successful for:', user.uid);
      
      // Add a small delay to ensure Firebase auth state is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in Firestore and is approved
      console.log('Fetching user document from Firestore');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        console.log('User document not found in Firestore:', user.uid);
        
        // Check if this is a student email
        if (email.toLowerCase().endsWith('@stardetect.us')) {
          // Send email verification if not verified
          if (!user.emailVerified) {
            await sendEmailVerification(user);
          }
          
          // Create a new user document for the student
          const studentData = {
            email: email,
            role: 'STUDENT',
            status: 'APPROVED',
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: new Date(),
            emailVerified: user.emailVerified,
            phoneVerified: false
          };
          
          await setDoc(doc(db, 'users', user.uid), studentData);
          return { 
            user: { ...studentData, uid: user.uid }, 
            needsPhoneVerification: false,
            needsEmailVerification: !user.emailVerified 
          };
        }
        
        await signOut(auth);
        throw new Error('User account not found in the system.');
      }

      const userData = userDoc.data();
      console.log('User data from Firestore:', userData);

      // For student accounts, require email verification
      if (userData.role === 'STUDENT' && !user.emailVerified) {
        // Send verification email if not already sent
        await sendEmailVerification(user);
        return {
          user: { ...userData, uid: user.uid },
          needsEmailVerification: true
        };
      }

      // Case-insensitive status check
      if (userData.status?.toUpperCase() !== 'APPROVED') {
        console.error('User not approved:', userData.status);
        await signOut(auth);
        throw new Error('Your account is pending approval from the administrator.');
      }

      // If this is a parent account, check and link any unlinked students
      if (userData.role === 'PARENT') {
        try {
          // Find all students with this parent's email
          const studentsQuery = query(
            collection(db, 'students'),
            where('parentEmail', '==', email),
            where('schoolId', '==', userData.schoolId)
          );
          const studentsSnapshot = await getDocs(studentsQuery);

          if (!studentsSnapshot.empty) {
            // Get all student IDs
            const studentIds = studentsSnapshot.docs.map(doc => doc.id);
            const currentStudents = userData.students || [];
            
            // Find new students that aren't already linked
            const newStudentIds = studentIds.filter(id => !currentStudents.includes(id));

            if (newStudentIds.length > 0) {
              console.log(`Found ${newStudentIds.length} new students to link for parent:`, email);

              // Update parent's document with new students
              await updateDoc(doc(db, 'users', user.uid), {
                students: [...currentStudents, ...newStudentIds],
                updatedAt: new Date()
              });

              // Update all new student documents with the parent ID
              await Promise.all(
                newStudentIds.map(studentId => 
                  updateDoc(doc(db, 'students', studentId), {
                    parentId: user.uid,
                    updatedAt: new Date()
                  })
                )
              );

              // Refresh user data after updates
              const updatedUserDoc = await getDoc(doc(db, 'users', user.uid));
              userData = updatedUserDoc.data();
            }
          }
        } catch (error) {
          console.error('Error checking/linking students:', error);
          // Don't throw the error - we still want to allow login
        }
      }

      // Update last login
      const updateData = {
        lastLogin: new Date(),
        updatedAt: new Date(),
        updatedBy: user.uid
      };
      
      console.log('Updating last login:', updateData);
      await updateDoc(doc(db, 'users', user.uid), updateData);

      // Create merged user object with explicit role
      const mergedUser = {
        uid: user.uid,
        email: user.email,
        role: userData.role,
        status: userData.status,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        phoneVerified: userData.phoneVerified || false,
        schoolId: userData.schoolId,
        lastLogin: updateData.lastLogin,
        students: userData.students || [] // Include students array
      };

      console.log('Setting current user with role:', mergedUser.role);
      setCurrentUser(mergedUser);

      // Always require phone verification for non-student users on every login
      if (userData.role !== 'STUDENT') {
        return {
          user: mergedUser,
          needsPhoneVerification: true,
          phoneNumber: userData.phoneNumber
        };
      }
      
      return { user: mergedUser, needsPhoneVerification: false };
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account exists with this email.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password.');
      }
      throw error;
    }
  }

  async function logout(force = false) {
    try {
      // Clear all auth states
      window.confirmationResult = null;
      setVerificationId(null);
      setCurrentUser(null);

      // Clear any reCAPTCHA verifier
      if (window.recaptchaVerifier) {
        try {
          await window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('Error clearing reCAPTCHA:', e);
        }
        window.recaptchaVerifier = null;
      }

      // Force clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();

      // Sign out from Firebase
      await signOut(auth);

      // Force reload the page if needed
      if (force) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // If force logout, reload anyway
      if (force) {
        window.location.href = '/';
      } else {
        throw error;
      }
    }
  }

  async function resetPassword(email) {
    let timeoutId = null;
    
    try {
      console.log('Initiating password reset for:', email);
      
      // Validate email format
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Password reset request timed out'));
        }, 30000); // 30 second timeout
      });

      console.log('Sending password reset email...');
      
      // Race between password reset and timeout
      await Promise.race([
        sendPasswordResetEmail(auth, email),
        timeoutPromise
      ]);

      console.log('Password reset email sent successfully');

      // Clear timeout if reset succeeds
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      // Clear timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      console.error('Password reset error:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account exists with this email.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many password reset attempts. Please try again later.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Password reset request timed out. Please check your internet connection and try again.');
      }
      
      // Generic error message for unhandled cases
      throw new Error('Failed to send password reset email. Please try again later.');
    }
  }

  async function updateUserProfile(data) {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const updates = {
      ...data,
      updatedAt: new Date(),
    };

    await updateDoc(doc(db, 'users', user.uid), updates);
    
    if (data.displayName) {
      await updateProfile(user, { displayName: data.displayName });
    }
  }

  async function getUsersBySchool(schoolId) {
    const q = query(
      collection(db, 'users'),
      where('schoolId', '==', schoolId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async function getPendingUsers(schoolId) {
    const q = query(
      collection(db, 'users'),
      where('schoolId', '==', schoolId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async function approveUser(userId) {
    await updateDoc(doc(db, 'users', userId), {
      status: 'approved',
      updatedAt: new Date(),
    });
  }

  async function rejectUser(userId) {
    await updateDoc(doc(db, 'users', userId), {
      status: 'rejected',
      updatedAt: new Date(),
    });
  }

  // Update user's phone number
  async function updatePhoneNumber(userId, phoneNumber) {
    try {
      // Validate phone number format
      if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
        throw new Error('Invalid phone number format');
      }

      await updateDoc(doc(db, 'users', userId), {
        phoneNumber,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating phone number:', error);
      throw error;
    }
  }

  async function checkEmailVerification() {
    try {
      // Reload the user to get the latest emailVerified status
      await auth.currentUser?.reload();
      const user = auth.currentUser;
      
      if (!user) {
        console.log('No user found in checkEmailVerification');
        throw new Error('No user found');
      }

      console.log('Firebase user verification status:', user.emailVerified);

      // Get the latest user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        console.log('No user document found in Firestore');
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      console.log('Firestore user data:', userData);
      
      // Update the current user state with the latest data
      const updatedUser = {
        ...userData,
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        role: userData.role,
        status: userData.status
      };

      console.log('Setting updated user:', updatedUser);
      setCurrentUser(updatedUser);

      return user.emailVerified;
    } catch (error) {
      console.error('Error checking email verification:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Force reload to get latest verification status
          await user.reload();
          
          console.log('Auth state changed - User:', user.email);
          console.log('Auth state changed - Email verified:', user.emailVerified);

          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            // For student accounts, require email verification
            if (userData.role === 'STUDENT' && !user.emailVerified) {
              setCurrentUser(null);
              return;
            }

            // Update Firestore if email is newly verified
            if (user.emailVerified && !userData.emailVerified) {
              await updateDoc(doc(db, 'users', user.uid), {
                emailVerified: true,
                updatedAt: new Date()
              });
            }

            const combinedUser = {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              role: userData.role,
              status: userData.status,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phoneNumber: userData.phoneNumber,
              phoneVerified: userData.phoneVerified || false,
              schoolId: userData.schoolId
            };
            
            console.log('Setting user state:', combinedUser);
            setCurrentUser(combinedUser);
          } else {
            console.log('No user document found in Firestore');
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
        }
      } else {
        console.log('No authenticated user');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    setCurrentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    getUsersBySchool,
    getPendingUsers,
    approveUser,
    rejectUser,
    loading,
    sendVerificationCode,
    verifyCode,
    updatePhoneNumber,
    checkEmailVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 