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

export class BusNotificationService {
  constructor() {
    this.unsubscribers = new Map();
  }

  // Calculate ETA based on current location and route
  calculateETA(busLocation, stopLocation, averageSpeed = 25) {
    const R = 6371; // Earth's radius in km
    const lat1 = busLocation.lat * Math.PI / 180;
    const lat2 = stopLocation.lat * Math.PI / 180;
    const dLat = (stopLocation.lat - busLocation.lat) * Math.PI / 180;
    const dLon = (stopLocation.lng - busLocation.lng) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km

    // Calculate time in minutes based on average speed
    return Math.round((distance / averageSpeed) * 60);
  }

  // Subscribe to bus location updates for a specific route
  subscribeToBusUpdates(routeId, studentId, stopLocation, onUpdate) {
    const busLocationsQuery = query(
      collection(db, 'busLocations'),
      where('routeId', '==', routeId)
    );

    const unsubscribe = onSnapshot(busLocationsQuery, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const busData = change.doc.data();
        
        if (busData.location) {
          const eta = this.calculateETA(busData.location, stopLocation);
          const notificationThresholds = [20, 10, 5]; // Minutes before arrival

          // Create or update ETA notification
          if (notificationThresholds.includes(eta)) {
            await this.createETANotification(
              studentId,
              routeId,
              busData.busNumber,
              eta,
              busData.status === 'PICKUP' ? 'pickup' : 'dropoff'
            );
          }

          // Call the update callback with current ETA
          onUpdate({
            busNumber: busData.busNumber,
            eta,
            location: busData.location,
            status: busData.status,
          });
        }
      });
    });

    this.unsubscribers.set(routeId, unsubscribe);
    return unsubscribe;
  }

  // Create ETA notification
  async createETANotification(studentId, routeId, busNumber, eta, type) {
    try {
      const notificationId = `${routeId}_${studentId}_${eta}`;
      await setDoc(doc(db, 'notifications', notificationId), {
        studentId,
        routeId,
        busNumber,
        eta,
        type,
        message: `Bus #${busNumber} will arrive for ${type} in approximately ${eta} minutes`,
        createdAt: serverTimestamp(),
        status: 'UNREAD',
        notificationType: 'ETA',
      });

      // Also send push notification if configured
      // this.sendPushNotification(...) // Future enhancement
    } catch (error) {
      console.error('Error creating ETA notification:', error);
    }
  }

  // Update bus status and trigger notifications
  async updateBusStatus(busId, status, location, nextStop) {
    try {
      await updateDoc(doc(db, 'busLocations', busId), {
        status,
        location,
        nextStop,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating bus status:', error);
    }
  }

  // Unsubscribe from updates
  unsubscribe(routeId) {
    const unsubscribe = this.unsubscribers.get(routeId);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribers.delete(routeId);
    }
  }

  // Unsubscribe from all updates
  unsubscribeAll() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers.clear();
  }
} 