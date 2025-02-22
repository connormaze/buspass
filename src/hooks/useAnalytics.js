import { useEffect } from 'react';
import { captureAppUsageEvent } from '../services/AnalyticsService';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useAnalytics = () => {
  const { currentUser } = useAuth();

  const captureEvent = async (eventType, eventData = {}) => {
    if (!currentUser) return;

    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;
      
      await captureAppUsageEvent(schoolId, eventType, {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        ...eventData
      });
    } catch (error) {
      console.error('Error capturing analytics event:', error);
    }
  };

  // Capture page view on component mount
  useEffect(() => {
    if (currentUser) {
      captureEvent('PAGE_VIEW', {
        path: window.location.pathname,
        timestamp: new Date()
      });
    }
  }, [currentUser]);

  return { captureEvent };
}; 