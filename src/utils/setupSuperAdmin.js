import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const setupInitialSuperAdmin = async (email, password, firstName, lastName) => {
  try {
    // Validate email domain
    if (!email.endsWith('@stardetect.us')) {
      throw new Error('SuperAdmin email must be a @stardetect.us email address');
    }

    // Check if user already exists
    const userDoc = await getDoc(doc(db, 'users', email));
    if (userDoc.exists()) {
      throw new Error('A user with this email already exists');
    }

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      firstName,
      lastName,
      role: 'SUPERADMIN',
      status: 'approved', // Auto-approve SuperAdmin
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Create audit log
    await setDoc(doc(db, 'auditLogs', Date.now().toString()), {
      action: 'SUPERADMIN_CREATION',
      userId: user.uid,
      email,
      timestamp: new Date().toISOString(),
      details: 'Initial SuperAdmin account created'
    });

    return {
      success: true,
      message: 'SuperAdmin account created successfully',
      userId: user.uid
    };
  } catch (error) {
    console.error('Error creating SuperAdmin:', error);
    throw error;
  }
}; 