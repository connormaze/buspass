import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class SecurityService {
  constructor() {
    this.storage = getStorage();
  }

  // Verify PIN for student pickup
  async verifyPickupPin(studentId, pin) {
    try {
      const pickupAuthsQuery = query(
        collection(db, 'pickupAuthorizations'),
        where('studentId', '==', studentId),
        where('pin', '==', pin),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(pickupAuthsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      throw error;
    }
  }

  // Add authorized pickup person
  async addAuthorizedPerson(studentId, personData) {
    try {
      const { photoId, ...data } = personData;
      let photoUrl = null;

      // Upload photo ID if provided
      if (photoId) {
        const photoRef = ref(this.storage, `pickup-auth/${studentId}/${Date.now()}`);
        await uploadBytes(photoRef, photoId);
        photoUrl = await getDownloadURL(photoRef);
      }

      await addDoc(collection(db, 'pickupAuthorizations'), {
        studentId,
        ...data,
        photoIdUrl: photoUrl,
        isActive: true,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding authorized person:', error);
      throw error;
    }
  }

  // Record pickup signature
  async recordPickupSignature(pickupId, signatureData) {
    try {
      const signatureRef = ref(this.storage, `signatures/${pickupId}`);
      await uploadBytes(signatureRef, signatureData);
      const signatureUrl = await getDownloadURL(signatureRef);

      await updateDoc(doc(db, 'pickups', pickupId), {
        signatureUrl,
        signedAt: serverTimestamp()
      });

      return signatureUrl;
    } catch (error) {
      console.error('Error recording signature:', error);
      throw error;
    }
  }

  // Verify photo ID match
  async verifyPhotoId(authorizationId, capturedPhoto) {
    try {
      // Upload captured photo for verification
      const photoRef = ref(this.storage, `verification/${authorizationId}/${Date.now()}`);
      await uploadBytes(photoRef, capturedPhoto);
      const photoUrl = await getDownloadURL(photoRef);

      // Record verification attempt
      await addDoc(collection(db, 'verificationLogs'), {
        authorizationId,
        capturedPhotoUrl: photoUrl,
        timestamp: serverTimestamp(),
        // Add integration with photo verification API here
        verified: true // Placeholder for actual verification
      });

      return true; // Placeholder - replace with actual verification result
    } catch (error) {
      console.error('Error verifying photo ID:', error);
      throw error;
    }
  }

  // Get pickup history for audit
  async getPickupHistory(studentId, startDate, endDate) {
    try {
      const pickupsQuery = query(
        collection(db, 'pickups'),
        where('studentId', '==', studentId),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate)
      );
      
      const snapshot = await getDocs(pickupsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting pickup history:', error);
      throw error;
    }
  }
} 