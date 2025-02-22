import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const captureCarlineEvent = async (schoolId, eventData) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analyticsData = {
      schoolId,
      date: today,
      timestamp: serverTimestamp(),
      pickupCount: 1,
      totalWaitTime: eventData.waitTime || 0,
      pickupsByHour: new Array(24).fill(0).map((_, i) => 
        i === new Date().getHours() ? 1 : 0
      ),
      ...eventData
    };

    await addDoc(collection(db, 'carlineAnalytics'), analyticsData);
  } catch (error) {
    console.error('Error capturing carline event:', error);
  }
};

export const captureAppUsageEvent = async (schoolId, eventType, eventData) => {
  try {
    const analyticsData = {
      schoolId,
      eventType,
      timestamp: serverTimestamp(),
      date: new Date(),
      ...eventData
    };

    await addDoc(collection(db, 'appAnalytics'), analyticsData);
  } catch (error) {
    console.error('Error capturing app usage event:', error);
  }
};

export const captureTransportEvent = async (schoolId, eventData) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analyticsData = {
      schoolId,
      date: today,
      timestamp: serverTimestamp(),
      ...eventData
    };

    await addDoc(collection(db, 'transportAnalytics'), analyticsData);
  } catch (error) {
    console.error('Error capturing transport event:', error);
  }
};

export const fetchTransportAnalytics = async (schoolId, timeRange = 'WEEK') => {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    let startDate = new Date();
    switch (timeRange) {
      case 'DAY':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'WEEK':
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'MONTH':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
    }

    const analyticsQuery = query(
      collection(db, 'transportAnalytics'),
      where('schoolId', '==', schoolId)
    );

    const analyticsSnapshot = await getDocs(analyticsQuery);
    
    if (analyticsSnapshot.empty) {
      return {
        totalTrips: 0,
        onTimePercentage: 0,
        activeRoutes: 0,
        activeBuses: 0,
        averageDelay: 0,
        totalStudentsTransported: 0,
        hasData: false
      };
    }

    let totalTrips = 0;
    let onTimeTrips = 0;
    let totalDelay = 0;
    let studentsTransported = 0;
    const activeRoutesSet = new Set();
    const activeBusesSet = new Set();

    analyticsSnapshot.docs
      .filter(doc => {
        const data = doc.data();
        const docDate = data.date?.toDate() || new Date(data.date);
        return docDate >= startDate && docDate <= endDate;
      })
      .forEach(doc => {
        const data = doc.data();
        totalTrips++;
        if (data.delay <= 5) onTimeTrips++; // Consider 5 minutes or less as on time
        totalDelay += data.delay || 0;
        studentsTransported += data.studentsTransported || 0;
        if (data.routeId) activeRoutesSet.add(data.routeId);
        if (data.busId) activeBusesSet.add(data.busId);
      });

    return {
      totalTrips,
      onTimePercentage: totalTrips > 0 ? Math.round((onTimeTrips / totalTrips) * 100) : 0,
      activeRoutes: activeRoutesSet.size,
      activeBuses: activeBusesSet.size,
      averageDelay: totalTrips > 0 ? Math.round(totalDelay / totalTrips) : 0,
      totalStudentsTransported: studentsTransported,
      hasData: totalTrips > 0
    };
  } catch (error) {
    console.error('Error fetching transport analytics:', error);
    throw error;
  }
}; 