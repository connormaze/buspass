import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Route as RouteIcon,
  Assessment as SimulationIcon,
  Person as DriverIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  LocalGasStation as FuelIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  DirectionsRun as ActivityIcon
} from '@mui/icons-material';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import RouteOptimizer from '../../components/RouteOptimizer';
import RouteSimulator from '../../components/RouteSimulator';
import RouteAnalytics from '../../components/RouteAnalytics';
import DriverManagement from '../../components/DriverManagement';
import BusManagement from './BusManagement';
import { RouteManagementService } from '../../services/RouteManagementService';
import TransportAnalytics from '../../components/TransportAnalytics';
import { DriverManagementService } from '../../services/DriverManagementService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { arrayUnion } from 'firebase/firestore';
import { setDoc } from 'firebase/firestore';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`transport-tabpanel-${index}`}
      aria-labelledby={`transport-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TransportManagement() {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const [routeService] = useState(() => new RouteManagementService());
  const [openBusDialog, setOpenBusDialog] = useState(false);
  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  const [busFormData, setBusFormData] = useState({
    number: '',
    capacity: '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    status: 'Active',
    lastMaintenance: null,
    nextMaintenance: null
  });
  const [routeFormData, setRouteFormData] = useState({
    name: '',
    stops: '',
    students: '',
    duration: ''
  });
  const [drivers, setDrivers] = useState([]);
  const [assignmentDialog, setAssignmentDialog] = useState({
    open: false,
    bus: null,
    data: {
      driverId: '',
      routeId: '',
      schedule: {
        morningStart: '',
        afternoonStart: '',
      }
    }
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    onTimePerformance: 0,
    routeEfficiency: 0,
    fuelEfficiency: 0,
    safetyScore: 0,
    incidents: 0,
    activeRoutes: 0
  });
  const driverService = new DriverManagementService();
  const [openDriverDialog, setOpenDriverDialog] = useState(false);
  const [driverFormData, setDriverFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    status: 'PENDING',
    password: '',
    confirmPassword: ''
  });
  const [editDriverDialog, setEditDriverDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    if (currentUser?.schoolId) {
      fetchInitialData();
    }
  }, [currentUser]);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchRoutes(),
        fetchBuses(),
        fetchDrivers(),
        fetchPerformanceMetrics()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load transport data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      if (!currentUser?.schoolId) return;
      
      const busesQuery = query(
        collection(db, 'buses'),
        where('schoolId', '==', currentUser.schoolId)
      );
      
      const busesSnapshot = await getDocs(busesQuery);
      console.log('Raw bus documents:', busesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const busesList = await Promise.all(busesSnapshot.docs.map(async busDoc => {
        const busData = busDoc.data();
        console.log('Processing bus:', { id: busDoc.id, ...busData });
        
        // Get assigned driver details if any
        let driverDetails = null;
        if (busData.driverId) {
          try {
            const driverDoc = await getDoc(doc(db, 'users', busData.driverId));
            console.log('Driver document:', driverDoc.exists() ? { id: driverDoc.id, ...driverDoc.data() } : null);
            if (driverDoc.exists()) {
              const driver = driverDoc.data();
              driverDetails = {
                id: driverDoc.id,
                firstName: driver.firstName || '',
                lastName: driver.lastName || '',
                fullName: `${driver.firstName || ''} ${driver.lastName || ''}`.trim(),
                phone: driver.phone || 'No phone',
                licenseNumber: driver.licenseNumber || 'N/A',
                email: driver.email || '',
                status: driver.status || 'PENDING',
                role: driver.role || 'BUSDRIVER',
                assignedBusId: driver.assignedBusId || null
              };
            }
          } catch (error) {
            console.error('Error fetching driver details:', error);
          }
        }

        // Get assigned route if any
        let routeDetails = null;
        try {
          const routeQuery = query(
            collection(db, 'routes'),
            where('busId', '==', busDoc.id),
            where('schoolId', '==', currentUser.schoolId)
          );
          const routeSnapshot = await getDocs(routeQuery);
          console.log('Route query results:', routeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          if (!routeSnapshot.empty) {
            const routeDoc = routeSnapshot.docs[0];
            const routeData = routeDoc.data();
            routeDetails = {
              id: routeDoc.id,
              name: routeData.name || 'Unnamed Route',
              stops: routeData.stops || [],
              students: routeData.students || [],
              schedule: {
                morningStart: routeData.schedule?.morningStart || '',
                afternoonStart: routeData.schedule?.afternoonStart || '',
                type: routeData.schedule?.type || 'REGULAR'
              },
              status: routeData.status || 'INACTIVE'
            };
          }
        } catch (error) {
          console.error('Error fetching route details:', error);
        }

        return {
          id: busDoc.id,
          number: busData.busNumber || busData.number || 'No Number',
          capacity: parseInt(busData.capacity) || 0,
          make: busData.make || 'Unknown',
          model: busData.model || 'Unknown',
          year: busData.year || 'Unknown',
          licensePlate: busData.licensePlate || 'No Plate',
          status: busData.status || 'ACTIVE',
          lastMaintenance: busData.lastMaintenance || null,
          nextMaintenance: busData.nextMaintenance || null,
          driver: driverDetails,
          route: routeDetails,
          driverId: busData.driverId || null,
          schoolId: busData.schoolId
        };
      }));
      
      console.log('Final buses list:', busesList);
      setBuses(busesList);
    } catch (error) {
      console.error('Error fetching buses:', error);
      setError('Failed to load buses');
    }
  };

  const fetchRoutes = async () => {
    try {
      if (!currentUser?.schoolId) return;
      
      const routesQuery = query(
        collection(db, 'routes'),
        where('schoolId', '==', currentUser.schoolId)
      );
      
      const routesSnapshot = await getDocs(routesQuery);
      const routesList = await Promise.all(routesSnapshot.docs.map(async routeDoc => {
        const routeData = routeDoc.data();
        
        // Get assigned bus details if any
        let busDetails = null;
        if (routeData.busId) {
          try {
            const busDoc = await getDoc(doc(db, 'buses', routeData.busId));
            if (busDoc.exists()) {
              const bus = busDoc.data();
              busDetails = {
                id: busDoc.id,
                number: bus.busNumber || bus.number || 'No Number'
              };
            }
          } catch (error) {
            console.error('Error fetching bus details for route:', error);
          }
        }

        return {
          id: routeDoc.id,
          name: routeData.name || 'Unnamed Route',
          stops: routeData.stops || [],
          students: routeData.students || [],
          schedule: {
            morningStart: routeData.schedule?.morningStart || '',
            afternoonStart: routeData.schedule?.afternoonStart || '',
            type: routeData.schedule?.type || 'REGULAR'
          },
          status: routeData.status || 'INACTIVE',
          bus: busDetails,
          busId: routeData.busId || null,
          driverId: routeData.driverId || null,
          schoolId: routeData.schoolId
        };
      }));
      
      console.log('Final routes list:', routesList);
      setRoutes(routesList);
      
      if (routesList.length > 0 && !selectedRoute) {
        setSelectedRoute(routesList[0]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setError('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      if (!currentUser?.schoolId) {
        console.error('No schoolId found in currentUser:', currentUser);
        return;
      }

      console.log('Fetching drivers for school:', currentUser.schoolId);

      // Query for all BUSDRIVER users that are APPROVED
      const driversQuery = query(
        collection(db, 'users'),
        where('role', '==', 'BUSDRIVER'),
        where('status', '==', 'APPROVED')
      );
      
      const driversSnapshot = await getDocs(driversQuery);
      console.log('Found drivers:', driversSnapshot.docs.length);
      
      // Process drivers - include both direct school drivers and multi-school drivers
      const driversData = driversSnapshot.docs
        .filter(doc => {
          const data = doc.data();
          // Include drivers that either belong to this school or have it in their schools array
          return data.schoolId === currentUser.schoolId || 
                 (Array.isArray(data.schools) && data.schools.includes(currentUser.schoolId));
        })
        .map(doc => {
          const data = doc.data();
          console.log('Processing driver:', { id: doc.id, ...data });

          return {
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            licenseNumber: data.licenseNumber || '',
            status: data.status || 'PENDING',
            role: data.role,
            schoolId: data.schoolId,
            schools: Array.isArray(data.schools) ? data.schools : [data.schoolId],
            isMultiSchool: Array.isArray(data.schools) ? data.schools.length > 1 : false,
            assignedBusId: data.assignedBusId || null
          };
        });

      console.log('Processed drivers:', driversData);
      setDrivers(driversData);
      setError(null);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Failed to load drivers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      if (!currentUser?.schoolId) return;

      // Get active routes count from actual routes
      const activeRoutesCount = routes.filter(r => r.status === 'ACTIVE').length;

      // Get incidents from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get all incidents
      const incidentsQuery = query(
        collection(db, 'incidents'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const incidentsSnapshot = await getDocs(incidentsQuery);
      const recentIncidents = incidentsSnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(incident => new Date(incident.timestamp) >= thirtyDaysAgo);

      // Get route completions
      const completionsQuery = query(
        collection(db, 'routeCompletions'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const completionsSnapshot = await getDocs(completionsQuery);
      const recentCompletions = completionsSnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(completion => {
          const completionDate = completion.completedAt?.toDate?.() || new Date(completion.completedAt);
          return completionDate >= thirtyDaysAgo;
        });

      // Get fuel consumption data
      const fuelQuery = query(
        collection(db, 'fuelConsumption'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const fuelSnapshot = await getDocs(fuelQuery);
      const recentFuelData = fuelSnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(record => new Date(record.timestamp) >= thirtyDaysAgo);

      // Calculate metrics from real data only
      const totalCompletions = recentCompletions.length;
      const onTimeCompletions = recentCompletions.filter(c => !c.delay || c.delay <= 300).length;
      const onTimePercentage = totalCompletions > 0 ? (onTimeCompletions / totalCompletions) * 100 : 0;

      // Calculate route efficiency from actual completion times
      const routeEfficiency = routes.reduce((acc, route) => {
        const completions = recentCompletions.filter(c => c.routeId === route.id);
        if (completions.length === 0) return acc;
        
        const efficiency = completions.reduce((sum, completion) => {
          const plannedDuration = route.plannedDuration || 0;
          if (!plannedDuration || !completion.actualDuration) return sum;
          return sum + ((plannedDuration / completion.actualDuration) * 100);
        }, 0) / completions.length;

        return acc + efficiency;
      }, 0) / (routes.length || 1);

      // Calculate actual fuel efficiency
      const fuelEfficiency = recentFuelData.reduce((acc, record) => {
        if (!record.totalMiles || !record.gallonsUsed) return acc;
        return acc + (record.totalMiles / record.gallonsUsed);
      }, 0) / (recentFuelData.length || 1);

      // Calculate safety score from actual incidents and other safety factors
      const calculateSafetyScore = (recentIncidents, buses, drivers, routes) => {
        let baseScore = 100;
        
        // 1. Incident Deductions (40% of total score)
        const incidentScore = recentIncidents.reduce((score, incident) => {
          const severityDeductions = {
            'LOW': 2,      // Minor incidents (delays, minor mechanical issues)
            'MEDIUM': 5,   // Moderate incidents (breakdowns, minor accidents)
            'HIGH': 10     // Serious incidents (accidents, safety violations)
          };
          
          const typeMultipliers = {
            'MECHANICAL': 1.0,  // Base multiplier for mechanical issues
            'WEATHER': 0.7,     // Lower impact as less controllable
            'TRAFFIC': 0.8,     // Lower impact as partially external
            'VIOLATION': 1.2,   // Higher impact for safety violations
            'ACCIDENT': 1.5     // Highest impact for accidents
          };
          
          const deduction = (severityDeductions[incident.severity] || 0) * 
                           (typeMultipliers[incident.type] || 1.0);
          
          return score - deduction;
        }, 40);

        // 2. Maintenance Compliance (20% of total score)
        const maintenanceScore = buses.reduce((score, bus) => {
          if (!bus.lastMaintenance || !bus.nextMaintenance) return score;
          
          const now = new Date();
          const daysSinceLastMaintenance = (now - new Date(bus.lastMaintenance)) / (1000 * 60 * 60 * 24);
          const daysUntilNextMaintenance = (new Date(bus.nextMaintenance) - now) / (1000 * 60 * 60 * 24);
          
          // Deduct points if maintenance is overdue or close to due
          if (daysUntilNextMaintenance < 0) {
            score -= 5; // Overdue maintenance
          } else if (daysUntilNextMaintenance < 7) {
            score -= 2; // Due soon
          }
          
          // Bonus points for regular maintenance
          if (daysSinceLastMaintenance < 90) {
            score += 1; // Recent maintenance bonus
          }
          
          return score;
        }, 20);

        // 3. Driver Compliance (20% of total score)
        const driverScore = drivers.reduce((score, driver) => {
          if (!driver.licenseNumber || !driver.status === 'ACTIVE') {
            score -= 5; // Deduct for missing license or inactive status
          }
          
          // Add checks for driver training and certification
          if (driver.trainingCompleted) {
            score += 2;
          }
          
          // Check for driver rest compliance
          if (driver.lastRestPeriod && driver.hoursWorked) {
            const restCompliance = driver.hoursWorked <= 8 || 
                                  (new Date() - new Date(driver.lastRestPeriod)) >= (8 * 60 * 60 * 1000);
            if (!restCompliance) {
              score -= 3;
            }
          }
          
          return score;
        }, 20);

        // 4. Route Safety (20% of total score)
        const routeScore = routes.reduce((score, route) => {
          // Check for overcrowded routes
          const assignedBus = buses.find(b => b.id === route.busId);
          if (assignedBus && route.students) {
            if (route.students.length > assignedBus.capacity) {
              score -= 3; // Overcrowding deduction
            }
          }
          
          // Check for proper route planning
          if (!route.stops || route.stops.length === 0) {
            score -= 2; // Improper route planning
          }
          
          // Check for schedule spacing
          if (route.schedule) {
            const hasProperSpacing = route.schedule.morningStart && route.schedule.afternoonStart;
            if (!hasProperSpacing) {
              score -= 1; // Improper schedule spacing
            }
          }
          
          return score;
        }, 20);

        // Calculate final weighted score
        const finalScore = Math.max(0, Math.min(100, 
          incidentScore + maintenanceScore + driverScore + routeScore
        ));

        return {
          total: Math.round(finalScore),
          breakdown: {
            incidentScore: Math.round(incidentScore),
            maintenanceScore: Math.round(maintenanceScore),
            driverScore: Math.round(driverScore),
            routeScore: Math.round(routeScore)
          }
        };
      };

      // Update the fetchPerformanceMetrics function to use the new safety score calculation
      const safetyMetrics = calculateSafetyScore(recentIncidents, buses, drivers, routes);

      setPerformanceMetrics({
        onTimePerformance: Math.round(onTimePercentage),
        routeEfficiency: Math.round(routeEfficiency),
        fuelEfficiency: Math.round(fuelEfficiency * 10) / 10,
        safetyScore: safetyMetrics.total,
        safetyBreakdown: safetyMetrics.breakdown,
        incidents: recentIncidents.length,
        activeRoutes: activeRoutesCount
      });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      setPerformanceMetrics({
        onTimePerformance: 0,
        routeEfficiency: 0,
        fuelEfficiency: 0,
        safetyScore: 0,
        incidents: 0,
        activeRoutes: 0
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAssignmentDialogOpen = (bus) => {
    console.log('Opening assignment dialog for bus:', bus);
    console.log('Available drivers:', drivers);
    
    const currentRoute = routes.find(r => r.busId === bus.id);
    const currentDriver = drivers.find(d => d.id === bus.driverId);
    
    console.log('Current route:', currentRoute);
    console.log('Current driver:', currentDriver);
    
    setAssignmentDialog({
      open: true,
      bus: bus,
      data: {
        driverId: bus.driverId || '',
        routeId: currentRoute?.id || '',
        schedule: {
          morningStart: currentRoute?.schedule?.morningStart || '',
          afternoonStart: currentRoute?.schedule?.afternoonStart || ''
        }
      }
    });
  };

  const handleAssignmentDialogClose = () => {
    setAssignmentDialog({
      open: false,
      bus: null,
      data: {
        driverId: '',
        routeId: '',
        schedule: {
          morningStart: '',
          afternoonStart: '',
        }
      }
    });
  };

  const handleAssignmentSave = async () => {
    try {
      setLoading(true);
      const { bus, data } = assignmentDialog;
      
      // Check for schedule conflicts
      const conflictCheck = await checkScheduleConflicts(data);
      if (conflictCheck.hasConflict) {
        setError(`Schedule conflict detected: ${conflictCheck.message}`);
        return;
      }

      console.log('Saving assignment:', { bus, data });

      // Update bus assignment
      const busRef = doc(db, 'buses', bus.id);
      await updateDoc(busRef, {
        driverId: data.driverId,
        lastUpdated: serverTimestamp(),
        status: 'ACTIVE'
      });

      // If there was a previous driver, clear their assignment
      if (bus.driverId && bus.driverId !== data.driverId) {
        const prevDriverRef = doc(db, 'users', bus.driverId);
        await updateDoc(prevDriverRef, {
          assignedBusId: null,
          lastAssignmentUpdate: serverTimestamp()
        });
      }

      // Update new driver assignment
      if (data.driverId) {
        const driverRef = doc(db, 'users', data.driverId);
        await updateDoc(driverRef, {
          assignedBusId: bus.id,
          lastAssignmentUpdate: serverTimestamp()
        });
      }

      // Update route assignment
      if (data.routeId) {
        // Clear previous route assignments for this bus
        const prevRouteQuery = query(
          collection(db, 'routes'),
          where('busId', '==', bus.id)
        );
        const prevRouteSnapshot = await getDocs(prevRouteQuery);
        await Promise.all(prevRouteSnapshot.docs.map(async routeDoc => {
          if (routeDoc.id !== data.routeId) {
            await updateDoc(doc(db, 'routes', routeDoc.id), {
              busId: null,
              driverId: null,
              schedule: null,
              status: 'INACTIVE'
            });
          }
        }));

        // Update new route assignment
        const routeRef = doc(db, 'routes', data.routeId);
        await updateDoc(routeRef, {
          busId: bus.id,
          driverId: data.driverId,
          schedule: {
            morningStart: data.schedule.morningStart,
            afternoonStart: data.schedule.afternoonStart,
            type: 'REGULAR',
            lastUpdated: serverTimestamp()
          },
          status: 'ACTIVE'
        });
      }

      // Refresh all data
      await Promise.all([
        fetchBuses(),
        fetchRoutes(),
        fetchDrivers()
      ]);

      handleAssignmentDialogClose();
      setError(null);
    } catch (error) {
      console.error('Error saving assignment:', error);
      setError('Failed to save assignment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkScheduleConflicts = async (assignmentData) => {
    if (!assignmentData.driverId || !assignmentData.schedule.morningStart || !assignmentData.schedule.afternoonStart) {
      return { hasConflict: false };
    }

    // Check other routes assigned to the same driver
    const conflictingRoutes = routes.filter(route => 
      route.driverId === assignmentData.driverId &&
      route.id !== assignmentData.routeId &&
      (
        (route.schedule?.morningStart === assignmentData.schedule.morningStart) ||
        (route.schedule?.afternoonStart === assignmentData.schedule.afternoonStart)
      )
    );

    if (conflictingRoutes.length > 0) {
      return {
        hasConflict: true,
        message: `Driver already assigned to route(s): ${conflictingRoutes.map(r => r.name).join(', ')} at the same time`
      };
    }

    return { hasConflict: false };
  };

  const handleAddDriver = async () => {
    try {
      setLoading(true);
      console.log('Starting driver creation with data:', { ...driverFormData, schoolId: currentUser.schoolId });
      
      // Validate passwords match
      if (driverFormData.password !== driverFormData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Validate password strength
      if (driverFormData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      // Create the user account with email and password
      const userCredential = await createUserWithEmailAndPassword(
        getAuth(),
        driverFormData.email,
        driverFormData.password
      );
      
      console.log('Created auth user:', userCredential.user.uid);

      const userData = {
        firstName: driverFormData.firstName,
        lastName: driverFormData.lastName,
        email: driverFormData.email,
        phone: driverFormData.phone,
        licenseNumber: driverFormData.licenseNumber,
        status: 'PENDING',
        role: 'BUSDRIVER',
        schoolId: currentUser.schoolId,
        schools: [currentUser.schoolId],
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        lastStatusUpdate: serverTimestamp(),
        statusHistory: [{
          status: 'PENDING',
          timestamp: serverTimestamp(),
          updatedBy: currentUser.uid
        }]
      };

      console.log('Saving user data to Firestore:', userData);
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      console.log('Successfully saved user data');

      // Update school document to include the new driver
      const schoolRef = doc(db, 'schools', currentUser.schoolId);
      await updateDoc(schoolRef, {
        driverIds: arrayUnion(userCredential.user.uid)
      });

      console.log('Updated school document with new driver');

      setOpenDriverDialog(false);
      setDriverFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        status: 'PENDING',
        password: '',
        confirmPassword: ''
      });
      
      await fetchDrivers();
      setError(null);
    } catch (error) {
      console.error('Error adding driver:', error);
      setError(error.message || 'Failed to add driver');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setDriverFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      status: driver.status
    });
    setEditDriverDialog(true);
  };

  const handleDeleteDriver = async (driverId) => {
    try {
      setLoading(true);
      
      // Get the driver's data first
      const driverDoc = await getDoc(doc(db, 'users', driverId));
      const driverData = driverDoc.data();

      // Remove driver from all associated schools
      if (driverData.schools) {
        await Promise.all(driverData.schools.map(async (schoolId) => {
          const schoolRef = doc(db, 'schools', schoolId);
          await updateDoc(schoolRef, {
            driverIds: arrayRemove(driverId)
          });
        }));
      }

      // Remove driver from any assigned buses
      const busesQuery = query(
        collection(db, 'buses'),
        where('driverId', '==', driverId)
      );
      const busesSnapshot = await getDocs(busesQuery);
      await Promise.all(busesSnapshot.docs.map(async (busDoc) => {
        await updateDoc(doc(db, 'buses', busDoc.id), {
          driverId: null,
          lastUpdated: serverTimestamp()
        });
      }));

      // Delete the user document
      await deleteDoc(doc(db, 'users', driverId));

      // Refresh the drivers list
      await fetchDrivers();
      setError(null);
    } catch (error) {
      console.error('Error deleting driver:', error);
      setError('Failed to delete driver: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDriver = async () => {
    try {
      setLoading(true);
      
      const driverRef = doc(db, 'users', selectedDriver.id);
      const driverDoc = await getDoc(driverRef);
      const currentData = driverDoc.data();
      
      const updates = {
        firstName: driverFormData.firstName,
        lastName: driverFormData.lastName,
        phone: driverFormData.phone,
        licenseNumber: driverFormData.licenseNumber,
        status: driverFormData.status,
        lastUpdated: serverTimestamp()
      };

      // If status has changed, update status history
      if (currentData.status !== driverFormData.status) {
        updates.lastStatusUpdate = serverTimestamp();
        updates.statusHistory = arrayUnion({
          status: driverFormData.status,
          timestamp: serverTimestamp(),
          updatedBy: currentUser.uid,
          previousStatus: currentData.status
        });
      }

      await updateDoc(driverRef, updates);
      
      setEditDriverDialog(false);
      setSelectedDriver(null);
      await fetchDrivers();
      setError(null);
    } catch (error) {
      console.error('Error updating driver:', error);
      setError('Failed to update driver: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBus = async (busId) => {
    try {
      setLoading(true);
      
      // Get the bus data first
      const busDoc = await getDoc(doc(db, 'buses', busId));
      const busData = busDoc.data();

      // If bus has a driver assigned, clear the driver's assignment
      if (busData.driverId) {
        const driverRef = doc(db, 'users', busData.driverId);
        await updateDoc(driverRef, {
          assignedBusId: null,
          lastAssignmentUpdate: serverTimestamp()
        });
      }

      // Clear any route assignments for this bus
      const routesQuery = query(
        collection(db, 'routes'),
        where('busId', '==', busId)
      );
      const routesSnapshot = await getDocs(routesQuery);
      await Promise.all(routesSnapshot.docs.map(async (routeDoc) => {
        await updateDoc(doc(db, 'routes', routeDoc.id), {
          busId: null,
          driverId: null,
          schedule: null,
          status: 'INACTIVE'
        });
      }));

      // Delete the bus document
      await deleteDoc(doc(db, 'buses', busId));

      // Refresh the data
      await Promise.all([
        fetchBuses(),
        fetchRoutes(),
        fetchDrivers()
      ]);

      setError(null);
    } catch (error) {
      console.error('Error deleting bus:', error);
      setError('Failed to delete bus: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAssignmentDialog = () => {
    console.log('Rendering assignment dialog');
    console.log('Current drivers:', drivers);
    console.log('Current bus:', assignmentDialog.bus);
    console.log('Current dialog data:', assignmentDialog.data);

    // Filter available drivers - either unassigned or currently assigned to this bus
    const availableDrivers = drivers.filter(driver => 
      !driver.assignedBusId || driver.assignedBusId === assignmentDialog.bus?.id
    );

    console.log('Available drivers:', availableDrivers);

    return (
      <Dialog 
        open={assignmentDialog.open} 
        onClose={handleAssignmentDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Assignment - Bus #{assignmentDialog.bus?.number || 'No Number'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Bus Details
              </Typography>
              <Typography variant="body2">
                Make: {assignmentDialog.bus?.make || 'Unknown'} •
                Model: {assignmentDialog.bus?.model || 'Unknown'} •
                Year: {assignmentDialog.bus?.year || 'Unknown'}
              </Typography>
              <Typography variant="body2">
                License Plate: {assignmentDialog.bus?.licensePlate || 'No Plate'} •
                Capacity: {assignmentDialog.bus?.capacity || '0'} seats
              </Typography>
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Assigned Driver</InputLabel>
              <Select
                value={assignmentDialog.data.driverId || ''}
                onChange={(e) => {
                  console.log('Selected driver:', e.target.value);
                  setAssignmentDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, driverId: e.target.value }
                  }));
                }}
                label="Assigned Driver"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableDrivers.map((driver) => (
                  <MenuItem 
                    key={driver.id} 
                    value={driver.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                      py: 1
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        {driver.firstName} {driver.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        License: {driver.licenseNumber} • Phone: {driver.phone}
                        {driver.isMultiSchool && ' • Multi-School'}
                      </Typography>
                    </Box>
                    {driver.id === assignmentDialog.bus?.driverId && (
                      <Chip 
                        size="small" 
                        label="Current Driver" 
                        color="primary" 
                        variant="outlined" 
                      />
                    )}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {availableDrivers.length === 0 ? 
                  "No available drivers found. Add approved drivers in the Drivers tab first." :
                  "Select a driver to assign to this bus"}
              </FormHelperText>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Assign Route</InputLabel>
              <Select
                value={assignmentDialog.data.routeId || ''}
                onChange={(e) => setAssignmentDialog(prev => ({
                  ...prev,
                  data: { ...prev.data, routeId: e.target.value }
                }))}
                label="Assign Route"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {routes
                  .filter(route => !route.busId || route.busId === assignmentDialog.bus?.id)
                  .map((route) => (
                    <MenuItem 
                      key={route.id} 
                      value={route.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        py: 1
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2">{route.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Stops: {route.stops?.length || 0} • Students: {route.students?.length || 0}
                        </Typography>
                      </Box>
                      {route.busId === assignmentDialog.bus?.id && (
                        <Chip 
                          size="small" 
                          label="Current Route" 
                          color="primary" 
                          variant="outlined" 
                        />
                      )}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Morning Start Time"
              type="time"
              value={assignmentDialog.data.schedule.morningStart}
              onChange={(e) => setAssignmentDialog(prev => ({
                ...prev,
                data: {
                  ...prev.data,
                  schedule: {
                    ...prev.data.schedule,
                    morningStart: e.target.value
                  }
                }
              }))}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              helperText="Select morning route start time"
            />

            <TextField
              fullWidth
              label="Afternoon Start Time"
              type="time"
              value={assignmentDialog.data.schedule.afternoonStart}
              onChange={(e) => setAssignmentDialog(prev => ({
                ...prev,
                data: {
                  ...prev.data,
                  schedule: {
                    ...prev.data.schedule,
                    afternoonStart: e.target.value
                  }
                }
              }))}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              helperText="Select afternoon route start time"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignmentDialogClose}>Cancel</Button>
          <Button 
            onClick={handleAssignmentSave}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderDriverDialog = () => (
    <Dialog 
      open={openDriverDialog} 
      onClose={() => setOpenDriverDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add New Driver</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            required
            fullWidth
            label="First Name"
            value={driverFormData.firstName}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              firstName: e.target.value
            }))}
          />
          <TextField
            required
            fullWidth
            label="Last Name"
            value={driverFormData.lastName}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              lastName: e.target.value
            }))}
          />
          <TextField
            required
            fullWidth
            label="Email"
            type="email"
            value={driverFormData.email}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              email: e.target.value
            }))}
          />
          <TextField
            required
            fullWidth
            label="Password"
            type="password"
            value={driverFormData.password}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              password: e.target.value
            }))}
            helperText="Password must be at least 6 characters long"
          />
          <TextField
            required
            fullWidth
            label="Confirm Password"
            type="password"
            value={driverFormData.confirmPassword}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              confirmPassword: e.target.value
            }))}
            error={driverFormData.password !== driverFormData.confirmPassword}
            helperText={driverFormData.password !== driverFormData.confirmPassword ? "Passwords don't match" : ""}
          />
          <TextField
            required
            fullWidth
            label="Phone"
            value={driverFormData.phone}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              phone: e.target.value
            }))}
          />
          <TextField
            required
            fullWidth
            label="License Number"
            value={driverFormData.licenseNumber}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              licenseNumber: e.target.value
            }))}
          />
          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select
              value={driverFormData.status}
              onChange={(e) => setDriverFormData(prev => ({
                ...prev,
                status: e.target.value
              }))}
              label="Status"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDriverDialog(false)}>Cancel</Button>
        <Button 
          onClick={handleAddDriver}
          variant="contained"
          disabled={loading || !driverFormData.firstName || !driverFormData.lastName || 
                   !driverFormData.email || !driverFormData.password || 
                   !driverFormData.confirmPassword || !driverFormData.phone || 
                   !driverFormData.licenseNumber || 
                   driverFormData.password !== driverFormData.confirmPassword}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Driver'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderEditDriverDialog = () => (
    <Dialog 
      open={editDriverDialog} 
      onClose={() => setEditDriverDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Driver</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            required
            fullWidth
            label="First Name"
            value={driverFormData.firstName}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              firstName: e.target.value
            }))}
          />
          <TextField
            required
            fullWidth
            label="Last Name"
            value={driverFormData.lastName}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              lastName: e.target.value
            }))}
          />
          <TextField
            required
            fullWidth
            label="Phone"
            value={driverFormData.phone}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              phone: e.target.value
            }))}
          />
          <TextField
            required
            fullWidth
            label="License Number"
            value={driverFormData.licenseNumber}
            onChange={(e) => setDriverFormData(prev => ({
              ...prev,
              licenseNumber: e.target.value
            }))}
          />
          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select
              value={driverFormData.status}
              onChange={(e) => setDriverFormData(prev => ({
                ...prev,
                status: e.target.value
              }))}
              label="Status"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditDriverDialog(false)}>Cancel</Button>
        <Button 
          onClick={handleUpdateDriver}
          variant="contained"
          disabled={loading || !driverFormData.firstName || !driverFormData.lastName || 
                   !driverFormData.phone || !driverFormData.licenseNumber}
        >
          {loading ? <CircularProgress size={24} /> : 'Update Driver'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDriverCard = (driver) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6">
            {driver.firstName} {driver.lastName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              size="small"
              label={driver.status}
              color={
                driver.status === 'APPROVED' ? 'success' :
                driver.status === 'PENDING' ? 'warning' :
                driver.status === 'REJECTED' ? 'error' : 'default'
              }
            />
          </Box>
        </Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          License: {driver.licenseNumber}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Phone: {driver.phone}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Email: {driver.email}
        </Typography>
        {driver.isMultiSchool && (
          <Box sx={{ mt: 1 }}>
            <Chip
              size="small"
              color="primary"
              label="Multi-School"
            />
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          {driver.schools?.map((schoolId) => (
            <Chip
              key={schoolId}
              size="small"
              variant="outlined"
              label={schoolId === currentUser.schoolId ? 'Current School' : 'Other School'}
              color={schoolId === currentUser.schoolId ? 'primary' : 'default'}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => handleEditDriver(driver)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => handleDeleteDriver(driver.id)}
          >
            Delete
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderDriversTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Drivers Management</Typography>
        <Button
          variant="contained"
          startIcon={<DriverIcon />}
          onClick={() => setOpenDriverDialog(true)}
        >
          Add Driver
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : drivers.length === 0 ? (
        <Alert severity="info">No drivers found. Add drivers to get started.</Alert>
      ) : (
        <Grid container spacing={2}>
          {drivers.map((driver) => (
            <Grid item xs={12} sm={6} md={4} key={driver.id}>
              {renderDriverCard(driver)}
            </Grid>
          ))}
        </Grid>
      )}
      {renderDriverDialog()}
      {renderEditDriverDialog()}
    </Box>
  );

  const renderBusCard = (bus) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BusIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Bus #{bus.number}
          </Typography>
          <Chip
            size="small"
            label={bus.status}
            color={bus.status === 'ACTIVE' ? 'success' : 'warning'}
            sx={{ ml: 'auto' }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Make: {bus.make} • Model: {bus.model} • Year: {bus.year}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            License Plate: {bus.licensePlate} • Capacity: {bus.capacity} seats
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Driver Assignment
          </Typography>
          {bus.driver ? (
            <>
              <Typography variant="body2">
                {bus.driver.firstName} {bus.driver.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {bus.driver.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                License: {bus.driver.licenseNumber}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No driver assigned
            </Typography>
          )}
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Route Assignment
          </Typography>
          {bus.route ? (
            <>
              <Typography variant="body2">
                {bus.route.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Morning Start: {bus.route.schedule?.morningStart || 'Not set'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Afternoon Start: {bus.route.schedule?.afternoonStart || 'Not set'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stops: {bus.route.stops?.length || 0} • Students: {bus.route.students?.length || 0}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No route assigned
            </Typography>
          )}
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleAssignmentDialogOpen(bus)}
            fullWidth
          >
            Edit Assignment
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => handleDeleteBus(bus.id)}
          >
            Delete Bus
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Transport Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Routes
            </Typography>
            <Typography variant="h4">{routes.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Buses
            </Typography>
            <Typography variant="h4">
              {routes.filter(r => r.status === 'ACTIVE').length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Stops
            </Typography>
            <Typography variant="h4">
              {routes.reduce((acc, route) => acc + (route.stops?.length || 0), 0)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Special Events
            </Typography>
            <Typography variant="h4">
              {routes.filter(r => r.isSpecialEvent).length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    <Paper sx={{ width: '100%', mb: 2 }}>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab icon={<RouteIcon />} label="Route Optimization" />
        <Tab icon={<SimulationIcon />} label="Route Simulation" />
        <Tab icon={<DriverIcon />} label="Drivers" />
        <Tab icon={<BusIcon />} label="Buses" />
        <Tab icon={<SimulationIcon />} label="Performance" />
        <Tab icon={<ScheduleIcon />} label="Schedules" />
        <Tab icon={<AssignmentIcon />} label="Assignments" />
        <Tab icon={<AnalyticsIcon />} label="Analytics" />
      </Tabs>

      <TabPanel value={currentTab} index={0}>
        <RouteOptimizer
          schoolId={currentUser?.schoolId}
          route={selectedRoute}
          onRouteChange={setSelectedRoute}
          onRoutesUpdate={fetchRoutes}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <RouteSimulator
          route={selectedRoute}
          schoolId={currentUser?.schoolId}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {renderDriversTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <BusManagement schoolId={currentUser?.schoolId} />
      </TabPanel>

      <TabPanel value={currentTab} index={4}>
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Transport Performance Overview
              </Typography>
            </Grid>
            
            {/* Performance Metrics Cards */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">On-Time Performance</Typography>
                  </Box>
                  <Typography variant="h3" gutterBottom>
                    {performanceMetrics.onTimePerformance}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Of routes completed on schedule in the last 30 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SpeedIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Route Efficiency</Typography>
                  </Box>
                  <Typography variant="h3" gutterBottom>
                    {performanceMetrics.routeEfficiency}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average route optimization score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FuelIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6">Fuel Efficiency</Typography>
                  </Box>
                  <Typography variant="h3" gutterBottom>
                    {performanceMetrics.fuelEfficiency}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average miles per gallon across fleet
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Safety Score</Typography>
                  </Box>
                  <Typography variant="h3" gutterBottom>
                    {performanceMetrics.safetyScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall safety rating based on incidents
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6">Incidents</Typography>
                  </Box>
                  <Typography variant="h3" gutterBottom>
                    {performanceMetrics.incidents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total incidents in last 30 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ActivityIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Active Routes</Typography>
                  </Box>
                  <Typography variant="h3" gutterBottom>
                    {performanceMetrics.activeRoutes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Currently active bus routes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={5}>
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Transport Schedules
              </Typography>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">Morning Routes</Typography>
                        </Box>
                        {routes
                          .filter(route => route.status === 'ACTIVE')
                          .map((route) => {
                            const assignedBus = buses.find(b => b.id === route.busId);
                            const assignedDriver = drivers.find(d => d.id === route.driverId);
                            return (
                              <Box key={route.id} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                  {route.name}
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Start: {route.schedule?.morningStart || 'Not set'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Bus: #{assignedBus?.number || 'Unassigned'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Driver: {assignedDriver ? `${assignedDriver.firstName} ${assignedDriver.lastName}` : 'Unassigned'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Stops: {route.stops?.length || 0}
                                    </Typography>
                                  </Grid>
                                </Grid>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                  <Chip
                                    size="small"
                                    label={route.status}
                                    color={route.status === 'ACTIVE' ? 'success' : 'warning'}
                                  />
                                  <Chip
                                    size="small"
                                    label={`${route.students?.length || 0} students`}
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                            );
                          })}
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">Afternoon Routes</Typography>
                        </Box>
                        {routes
                          .filter(route => route.status === 'ACTIVE')
                          .map((route) => {
                            const assignedBus = buses.find(b => b.id === route.busId);
                            const assignedDriver = drivers.find(d => d.id === route.driverId);
                            return (
                              <Box key={route.id} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                  {route.name}
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Start: {route.schedule?.afternoonStart || 'Not set'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Bus: #{assignedBus?.number || 'Unassigned'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Driver: {assignedDriver ? `${assignedDriver.firstName} ${assignedDriver.lastName}` : 'Unassigned'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Stops: {route.stops?.length || 0}
                                    </Typography>
                                  </Grid>
                                </Grid>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                  <Chip
                                    size="small"
                                    label={route.status}
                                    color={route.status === 'ACTIVE' ? 'success' : 'warning'}
                                  />
                                  <Chip
                                    size="small"
                                    label={`${route.students?.length || 0} students`}
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                            );
                          })}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={6}>
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Driver & Bus Assignments
              </Typography>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {buses.map((bus) => {
                    const assignedRoute = routes.find(r => r.busId === bus.id);
                    const assignedDriver = drivers.find(d => d.id === bus.driverId);
                    return (
                      <Grid item xs={12} md={6} lg={4} key={bus.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <BusIcon sx={{ mr: 1 }} />
                              <Typography variant="h6">
                                Bus #{bus.number}
                              </Typography>
                              <Chip
                                size="small"
                                label={bus.status}
                                color={bus.status === 'ACTIVE' ? 'success' : 'warning'}
                                sx={{ ml: 'auto' }}
                              />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Make: {bus.make} • Model: {bus.model} • Year: {bus.year}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                License Plate: {bus.licensePlate} • Capacity: {bus.capacity} seats
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Driver Assignment
                              </Typography>
                              {assignedDriver ? (
                                <>
                                  <Typography variant="body2">
                                    {assignedDriver.firstName} {assignedDriver.lastName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone: {assignedDriver.phone}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    License: {assignedDriver.licenseNumber}
                                  </Typography>
                                </>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No driver assigned
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Route Assignment
                              </Typography>
                              {assignedRoute ? (
                                <>
                                  <Typography variant="body2">
                                    {assignedRoute.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Morning Start: {assignedRoute.schedule?.morningStart || 'Not set'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Afternoon Start: {assignedRoute.schedule?.afternoonStart || 'Not set'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Stops: {assignedRoute.stops?.length || 0} • Students: {assignedRoute.students?.length || 0}
                                  </Typography>
                                </>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No route assigned
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => handleAssignmentDialogOpen(bus)}
                                fullWidth
                              >
                                Edit Assignment
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={() => handleDeleteBus(bus.id)}
                              >
                                Delete Bus
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        {renderAssignmentDialog()}
      </TabPanel>

      <TabPanel value={currentTab} index={7}>
        <RouteAnalytics
          route={selectedRoute}
          timeRange="week"
        />
      </TabPanel>
    </Paper>
  </Box>
);
} 