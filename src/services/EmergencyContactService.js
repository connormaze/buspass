import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

export class EmergencyContactService {
  constructor() {
    this.contactsCollection = 'emergencyContacts';
  }

  // Add a new emergency contact
  async addEmergencyContact(studentId, contactData) {
    try {
      const contactDoc = {
        ...contactData,
        studentId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      const docRef = await addDoc(collection(db, this.contactsCollection), contactDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      throw error;
    }
  }

  // Update an existing emergency contact
  async updateEmergencyContact(contactId, updateData) {
    try {
      const contactRef = doc(db, this.contactsCollection, contactId);
      await updateDoc(contactRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      throw error;
    }
  }

  // Delete an emergency contact
  async deleteEmergencyContact(contactId) {
    try {
      await deleteDoc(doc(db, this.contactsCollection, contactId));
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      throw error;
    }
  }

  // Get all emergency contacts for a student
  async getStudentEmergencyContacts(studentId) {
    try {
      const contactsQuery = query(
        collection(db, this.contactsCollection),
        where('studentId', '==', studentId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(contactsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      throw error;
    }
  }
} 