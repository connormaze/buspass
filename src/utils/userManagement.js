import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  arrayRemove,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Comprehensively deletes a user and all their references across the system
 * @param {string} userId - The ID of the user to delete
 * @param {string} currentUserUid - The ID of the user performing the deletion
 * @returns {Promise<void>}
 */
export const deleteUserComprehensively = async (userId, currentUserUid) => {
  try {
    // First get the user's data to know their role and relationships
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const batch = writeBatch(db);

    // 1. Clean up based on user role
    switch (userData.role) {
      case 'TEACHER':
        // Remove teacher from all their classes
        if (userData.teachingClasses?.length > 0) {
          const classPromises = userData.teachingClasses.map(async (classId) => {
            const classRef = doc(db, 'classes', classId);
            await updateDoc(classRef, {
              teacherIds: arrayRemove(userId)
            });
          });
          await Promise.all(classPromises);
        }

        // Remove teacher from all their students
        const studentsWithTeacherQuery = query(
          collection(db, 'users'),
          where('assignedTeachers', 'array-contains', userId)
        );
        const studentsWithTeacher = await getDocs(studentsWithTeacherQuery);
        const studentPromises = studentsWithTeacher.docs.map(async (studentDoc) => {
          await updateDoc(doc(db, 'users', studentDoc.id), {
            assignedTeachers: arrayRemove(userId)
          });
        });
        await Promise.all(studentPromises);
        break;

      case 'STUDENT':
        // Remove student from assigned teachers
        if (userData.assignedTeachers?.length > 0) {
          const teacherPromises = userData.assignedTeachers.map(async (teacherId) => {
            const teacherRef = doc(db, 'users', teacherId);
            await updateDoc(teacherRef, {
              studentIds: arrayRemove(userId)
            });
          });
          await Promise.all(teacherPromises);
        }

        // Remove student from parent's students array
        if (userData.parentUid) {
          const parentRef = doc(db, 'users', userData.parentUid);
          const parentDoc = await getDoc(parentRef);
          if (parentDoc.exists()) {
            await updateDoc(parentRef, {
              students: arrayRemove(userId)
            });
          }
        }

        // Remove student from their class if assigned
        if (userData.classId) {
          const classRef = doc(db, 'classes', userData.classId);
          await updateDoc(classRef, {
            studentIds: arrayRemove(userId)
          });
        }
        break;

      case 'SCHOOLADMIN':
        // No special cleanup needed for school admin
        break;

      case 'BUSDRIVER':
        // Clean up bus assignments if any
        const busQuery = query(
          collection(db, 'buses'),
          where('driverId', '==', userId)
        );
        const busSnapshot = await getDocs(busQuery);
        const busPromises = busSnapshot.docs.map(async (busDoc) => {
          await updateDoc(doc(db, 'buses', busDoc.id), {
            driverId: null,
            driverName: null
          });
        });
        await Promise.all(busPromises);
        break;

      default:
        console.warn(`No specific cleanup process for role: ${userData.role}`);
        break;
    }

    // 2. Clean up messages
    const messagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', userId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.docs.forEach((messageDoc) => {
      batch.delete(doc(db, 'messages', messageDoc.id));
    });

    // 3. Clean up incidents
    const incidentsQuery = query(
      collection(db, 'incidents'),
      where('reportedBy', '==', userId)
    );
    const incidentsSnapshot = await getDocs(incidentsQuery);
    incidentsSnapshot.docs.forEach((incidentDoc) => {
      batch.delete(doc(db, 'incidents', incidentDoc.id));
    });

    // 4. Clean up notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.docs.forEach((notificationDoc) => {
      batch.delete(doc(db, 'notifications', notificationDoc.id));
    });

    // 5. Finally delete the user document
    batch.delete(userRef);

    // Commit all the batched operations
    await batch.commit();

  } catch (error) {
    console.error('Error in deleteUserComprehensively:', error);
    throw error;
  }
}; 