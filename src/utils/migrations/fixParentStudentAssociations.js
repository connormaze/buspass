import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export async function fixParentStudentAssociations() {
  try {
    console.log('Starting parent-student association fix...');
    
    // Get all students
    const studentsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'STUDENT')
    );
    const studentsSnapshot = await getDocs(studentsQuery);
    const students = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${students.length} students to process`);
    let updatedCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // Find parent by email if it exists
        if (student.parentEmail) {
          const parentQuery = query(
            collection(db, 'users'),
            where('email', '==', student.parentEmail),
            where('role', '==', 'PARENT')
          );
          const parentSnapshot = await getDocs(parentQuery);

          if (!parentSnapshot.empty) {
            const parentDoc = parentSnapshot.docs[0];
            const parentId = parentDoc.id;
            const parentData = parentDoc.data();

            // Update student record with parent info
            const studentRef = doc(db, 'users', student.id);
            await updateDoc(studentRef, {
              parentUid: parentId,
              parentName: student.parentName || parentData.firstName,
              parentPhone: student.parentPhone || parentData.phone,
              updatedAt: new Date()
            });

            // Update parent record with student info
            const parentRef = doc(db, 'users', parentId);
            const currentStudents = parentData.students || [];
            if (!currentStudents.includes(student.id)) {
              await updateDoc(parentRef, {
                students: [...currentStudents, student.id],
                updatedAt: new Date()
              });
            }

            console.log(`✓ Updated associations for student ${student.id} with parent ${parentId}`);
            updatedCount++;
          } else {
            console.log(`No parent found for student ${student.id} with email ${student.parentEmail}`);
          }
        } else {
          console.log(`No parent email found for student ${student.id}`);
        }
      } catch (error) {
        console.error(`Error processing student ${student.id}:`, error);
        errorCount++;
      }
    }

    console.log('\nMigration Summary:');
    console.log(`Total students processed: ${students.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    
    return {
      success: true,
      totalProcessed: students.length,
      updated: updatedCount,
      errors: errorCount
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 