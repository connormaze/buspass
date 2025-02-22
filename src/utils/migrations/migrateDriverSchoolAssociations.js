import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

export async function migrateDriverSchoolAssociations() {
  try {
    console.log('Starting driver-school association migration...');
    
    // Get all existing drivers
    const driversQuery = query(
      collection(db, 'users'),
      where('role', '==', 'BUSDRIVER')
    );
    const driversSnapshot = await getDocs(driversQuery);
    const drivers = driversSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${drivers.length} drivers to migrate`);
    let migratedCount = 0;
    let errorCount = 0;

    // Create new associations for each driver
    for (const driver of drivers) {
      try {
        if (driver.schoolId) {
          // Create association document
          const associationDoc = {
            driverId: driver.id,
            schoolId: driver.schoolId,
            status: 'ACTIVE',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          // Add to driverSchools collection
          await setDoc(
            doc(collection(db, 'driverSchools')),
            associationDoc
          );

          console.log(`✓ Migrated associations for driver ${driver.id}`);
          migratedCount++;
        } else {
          console.log(`No school association found for driver ${driver.id}`);
        }
      } catch (error) {
        console.error(`Error migrating driver ${driver.id}:`, error);
        errorCount++;
      }
    }

    console.log('\nMigration Summary:');
    console.log(`Total drivers processed: ${drivers.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    
    return {
      success: true,
      totalProcessed: drivers.length,
      migrated: migratedCount,
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