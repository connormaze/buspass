import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

export class PickupNotificationService {
  constructor() {
    this.unsubscribers = new Map();
  }

  // Subscribe to pickup status updates for a student
  subscribeToPickupUpdates(studentId, onUpdate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pickupsQuery = query(
      collection(db, 'pickups'),
      where('studentId', '==', studentId),
      where('timestamp', '>=', today)
    );

    const unsubscribe = onSnapshot(pickupsQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const pickupData = change.doc.data();
        
        // Create notification for pickup status change
        if (change.type === 'added' || change.type === 'modified') {
          await this.createPickupNotification(
            studentId,
            pickupData.type,
            pickupData.timestamp,
            pickupData.teacherUid,
            pickupData.delegateId
          );
        }

        // Call the update callback with current status
        onUpdate({
          id: change.doc.id,
          ...pickupData
        });
      });
    });

    this.unsubscribers.set(studentId, unsubscribe);
    return unsubscribe;
  }

  // Create pickup notification
  async createPickupNotification(studentId, type, timestamp, teacherUid, delegateId = null) {
    try {
      const notificationId = `pickup_${studentId}_${Date.now()}`;
      let message = '';

      switch (type) {
        case 'STUDENT_PICKUP':
          message = 'Your child has been picked up from school';
          break;
        case 'DELEGATE_PICKUP':
          message = 'Your child has been picked up by an authorized person';
          break;
        case 'PARENT_PICKUP':
          message = 'Your child has been picked up by parent/guardian';
          break;
        case 'CARPOOL_PICKUP':
          message = 'Your child has been picked up by carpool';
          break;
        default:
          message = 'Your child has been picked up';
      }

      await setDoc(doc(db, 'notifications', notificationId), {
        studentId,
        type,
        message,
        teacherUid,
        delegateId,
        timestamp: timestamp || serverTimestamp(),
        status: 'UNREAD',
        notificationType: 'PICKUP',
      });

      // Send browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification('Pickup Update', {
          body: message,
          icon: '/pickup-icon.png'
        });
      }
    } catch (error) {
      console.error('Error creating pickup notification:', error);
    }
  }

  // Update pickup status
  async updatePickupStatus(pickupId, status, details = {}) {
    try {
      await updateDoc(doc(db, 'pickups', pickupId), {
        status,
        ...details,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating pickup status:', error);
    }
  }

  // Unsubscribe from updates
  unsubscribe(studentId) {
    const unsubscribe = this.unsubscribers.get(studentId);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribers.delete(studentId);
    }
  }

  // Unsubscribe from all updates
  unsubscribeAll() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers.clear();
  }
} 