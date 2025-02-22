import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  arrayUnion,
  setDoc,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';

export class DriverManagementService {
  constructor() {
    this.driversCollection = 'users';
    this.assignmentsCollection = 'driverAssignments';
    this.performanceCollection = 'driverPerformance';
    this.driverSchoolsCollection = 'driverSchools';
  }

  // Create new driver with multiple school support
  async createDriver(driverData) {
    try {
      const driverDoc = {
        ...driverData,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'PENDING',
        approvalStatus: 'PENDING',
        isApproved: false,
        totalTrips: 0,
        rating: 0,
        performanceScore: 100,
        role: 'BUSDRIVER',
      };

      // Use the UID from Firebase Auth as the document ID
      let driverId;
      if (driverData.uid) {
        await setDoc(doc(db, this.driversCollection, driverData.uid), driverDoc);
        driverId = driverData.uid;
      } else {
        const docRef = await addDoc(collection(db, this.driversCollection), driverDoc);
        driverId = docRef.id;
      }

      // Create initial school association if schoolId is provided
      if (driverData.schoolId) {
        await this.addDriverToSchool(driverId, driverData.schoolId);
      }

      return driverId;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  // Add driver to a school
  async addDriverToSchool(driverId, schoolId) {
    try {
      const associationDoc = {
        driverId,
        schoolId,
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, this.driverSchoolsCollection), associationDoc);
    } catch (error) {
      console.error('Error adding driver to school:', error);
      throw error;
    }
  }

  // Remove driver from a school
  async removeDriverFromSchool(driverId, schoolId) {
    try {
      const associationsQuery = query(
        collection(db, this.driverSchoolsCollection),
        where('driverId', '==', driverId),
        where('schoolId', '==', schoolId)
      );
      
      const snapshot = await getDocs(associationsQuery);
      await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
    } catch (error) {
      console.error('Error removing driver from school:', error);
      throw error;
    }
  }

  // Get all schools for a driver
  async getDriverSchools(driverId) {
    try {
      const associationsQuery = query(
        collection(db, this.driverSchoolsCollection),
        where('driverId', '==', driverId),
        where('status', '==', 'ACTIVE')
      );
      
      const snapshot = await getDocs(associationsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting driver schools:', error);
      throw error;
    }
  }

  // Get all drivers for a school
  async getSchoolDrivers(schoolId) {
    try {
      const associationsQuery = query(
        collection(db, this.driverSchoolsCollection),
        where('schoolId', '==', schoolId),
        where('status', '==', 'ACTIVE')
      );
      
      const snapshot = await getDocs(associationsQuery);
      const driverIds = snapshot.docs.map(doc => doc.data().driverId);
      
      // Get driver details
      const drivers = await Promise.all(
        driverIds.map(async (driverId) => {
          const driverDoc = await getDoc(doc(db, this.driversCollection, driverId));
          return driverDoc.exists() ? { id: driverDoc.id, ...driverDoc.data() } : null;
        })
      );

      return drivers.filter(driver => driver !== null);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  }

  // Update driver information
  async updateDriver(driverId, updateData) {
    try {
      const driverRef = doc(db, this.driversCollection, driverId);
      
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp(),
        ...(updateData.status && { approvalStatus: updateData.status }),
        ...(updateData.approvalStatus && { status: updateData.approvalStatus })
      };

      await updateDoc(driverRef, updates);

      // If schoolId is in updateData, handle school association
      if (updateData.schoolId) {
        await this.addDriverToSchool(driverId, updateData.schoolId);
      }
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  }

  // Get driver by ID
  async getDriverById(driverId) {
    try {
      const driverDoc = await doc(db, this.driversCollection, driverId);
      const driverData = await driverDoc.get();
      return driverData.exists ? { id: driverData.id, ...driverData.data() } : null;
    } catch (error) {
      console.error('Error getting driver:', error);
      throw error;
    }
  }

  // Update driver availability
  async updateDriverAvailability(driverId, availabilityData) {
    try {
      const driverRef = doc(db, this.driversCollection, driverId);
      await updateDoc(driverRef, {
        availability: availabilityData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating driver availability:', error);
      throw error;
    }
  }

  // Record driver performance
  async recordPerformance(driverId, performanceData) {
    try {
      const performanceRef = doc(db, 'driverPerformance', driverId);
      await updateDoc(performanceRef, {
        ...performanceData,
        recordedAt: new Date()
      });
    } catch (error) {
      console.error('Error recording performance:', error);
      throw error;
    }
  }

  // Get driver performance history
  async getDriverPerformance(driverId, limit = 10) {
    try {
      const performanceQuery = query(
        collection(db, this.performanceCollection),
        where('driverId', '==', driverId),
        orderBy('recordedAt', 'desc'),
        limit(limit)
      );
      const snapshot = await getDocs(performanceQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting driver performance:', error);
      throw error;
    }
  }

  // Update driver's overall performance score
  async updateDriverPerformanceScore(driverId) {
    try {
      const performanceQuery = query(
        collection(db, this.performanceCollection),
        where('driverId', '==', driverId),
        orderBy('recordedAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(performanceQuery);
      
      if (snapshot.empty) return;

      const performances = snapshot.docs.map(doc => doc.data());
      const averageScore = this.calculateAveragePerformance(performances);

      await updateDoc(doc(db, this.driversCollection, driverId), {
        performanceScore: averageScore,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating performance score:', error);
      throw error;
    }
  }

  // Calculate average performance score
  calculateAveragePerformance(performances) {
    const weights = {
      safetyScore: 0.4,
      punctualityScore: 0.3,
      studentHandlingScore: 0.2,
      vehicleMaintenanceScore: 0.1
    };

    const totalScore = performances.reduce((acc, perf) => {
      const weightedScore = 
        (perf.safetyScore * weights.safetyScore) +
        (perf.punctualityScore * weights.punctualityScore) +
        (perf.studentHandlingScore * weights.studentHandlingScore) +
        (perf.vehicleMaintenanceScore * weights.vehicleMaintenanceScore);
      return acc + weightedScore;
    }, 0);

    return Math.round(totalScore / performances.length);
  }

  // Get driver assignments
  async getDriverAssignments(driverId, startDate, endDate) {
    try {
      const assignmentsQuery = query(
        collection(db, this.assignmentsCollection),
        where('driverId', '==', driverId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(assignmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting driver assignments:', error);
      throw error;
    }
  }

  // Record driver certification
  async addDriverCertification(driverId, certificationData) {
    try {
      const driverRef = doc(db, this.driversCollection, driverId);
      await updateDoc(driverRef, {
        certifications: arrayUnion({
          ...certificationData,
          issuedAt: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding certification:', error);
      throw error;
    }
  }

  // Get driver schedule
  async getDriverSchedule(driverId, weekStart) {
    try {
      const scheduleQuery = query(
        collection(db, 'driverSchedules'),
        where('driverId', '==', driverId),
        where('weekStart', '==', weekStart)
      );
      const snapshot = await getDocs(scheduleQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting driver schedule:', error);
      throw error;
    }
  }

  // Update driver schedule
  async updateDriverSchedule(driverId, weekStart, scheduleData) {
    try {
      const scheduleRef = doc(db, 'driverSchedules', driverId);
      await updateDoc(scheduleRef, {
        weekStart,
        schedule: scheduleData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  // Get driver statistics
  async getDriverStats(driverId) {
    try {
      const [assignments, performance] = await Promise.all([
        this.getDriverAssignments(driverId, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        this.getDriverPerformance(driverId, 100)
      ]);

      return {
        totalTrips: assignments.length,
        averagePerformance: this.calculateAveragePerformance(performance),
        completedRoutes: assignments.filter(a => a.status === 'COMPLETED').length,
        onTimePercentage: this.calculateOnTimePercentage(assignments),
        safetyIncidents: this.countSafetyIncidents(performance)
      };
    } catch (error) {
      console.error('Error getting driver stats:', error);
      throw error;
    }
  }

  // Helper methods
  calculateOnTimePercentage(assignments) {
    if (!assignments.length) return 100;
    const onTimeAssignments = assignments.filter(a => !a.isLate);
    return Math.round((onTimeAssignments.length / assignments.length) * 100);
  }

  countSafetyIncidents(performance) {
    return performance.filter(p => p.safetyScore < 70).length;
  }

  // Delete driver and all associated data
  async deleteDriver(driverId) {
    try {
      // Delete from users collection
      await deleteDoc(doc(db, 'users', driverId));
      
      // Also delete from drivers collection if it exists
      const driverRef = doc(db, 'drivers', driverId);
      const driverDoc = await getDoc(driverRef);
      if (driverDoc.exists()) {
        await deleteDoc(driverRef);
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  }
} 