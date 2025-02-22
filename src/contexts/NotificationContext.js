import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();

  // Add a new notification
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Remove a notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Listen for real-time notifications
  useEffect(() => {
    if (!currentUser) return;

    // Create a query for user-specific notifications
    const notificationsRef = collection(db, 'notifications');
    const userNotificationsQuery = query(
      notificationsRef,
      where('userId', '==', currentUser.uid)
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(userNotificationsQuery, (snapshot) => {
      const newNotifications = [];
      snapshot.forEach((doc) => {
        newNotifications.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        });
      });

      // Sort notifications by timestamp
      newNotifications.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
} 