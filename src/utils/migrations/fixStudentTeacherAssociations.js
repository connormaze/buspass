import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export async function fixStudentTeacherAssociations() {
  try {
    console.log('Starting student-teacher association fix...');
    
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

    // Get all teachers
    const teachersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'TEACHER')
    );
    const teachersSnapshot = await getDocs(teachersQuery);
    const teachers = teachersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${teachers.length} teachers`);

    for (const student of students) {
      try {
        const studentRef = doc(db, 'users', student.id);
        const studentDoc = await getDoc(studentRef);
        const studentData = studentDoc.data();

        // Get all possible teacher IDs from different fields
        const teacherIds = new Set([
          ...(studentData.teacherIds || []),
          ...(studentData.assignedTeachers || []),
          ...(studentData.classTeachers || [])
        ]);

        if (teacherIds.size > 0) {
          // Update student with consolidated teacher IDs
          await updateDoc(studentRef, {
            teacherIds: Array.from(teacherIds),
            updatedAt: new Date()
          });

          // Update each teacher's student list
          for (const teacherId of teacherIds) {
            const teacherRef = doc(db, 'users', teacherId);
            const teacherDoc = await getDoc(teacherRef);
            
            if (teacherDoc.exists()) {
              const teacherData = teacherDoc.data();
              const currentStudents = new Set(teacherData.students || []);
              currentStudents.add(student.id);

              await updateDoc(teacherRef, {
                students: Array.from(currentStudents),
                updatedAt: new Date()
              });
            }
          }

          console.log(`✓ Updated associations for student ${student.id} with teachers:`, Array.from(teacherIds));
          updatedCount++;
        } else {
          console.log(`No teacher associations found for student ${student.id}`);
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