import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  GeoPoint,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';

export class RouteManagementService {
  constructor() {
    this.trafficUpdateInterval = 5 * 60 * 1000; // 5 minutes
    this.weatherUpdateInterval = 15 * 60 * 1000; // 15 minutes
    this.routesCollection = 'routes';
    this.routeLogsCollection = 'routeLogs';
    this.routeAnalyticsCollection = 'routeAnalytics';
    this.studentRoutesCollection = 'studentRoutes';
  }

  // Create or update route with optimization and student assignments
  async optimizeRoute(routeData) {
    try {
      const { stops, startLocation, endLocation, schoolId, assignedStudents } = routeData;
      
      // Get historical traffic data for time windows
      const trafficData = await this.getHistoricalTrafficData(
        stops.map(stop => stop.location)
      );

      // Calculate optimal route order based on traffic patterns
      const optimizedStops = await this.calculateOptimalRoute(stops, trafficData);

      // Estimate times for each stop
      const routeWithTimes = this.calculateEstimatedTimes(optimizedStops, trafficData);

      // Save or update route
      const routeDoc = {
        schoolId,
        startLocation,
        endLocation,
        stops: routeWithTimes,
        lastOptimized: serverTimestamp(),
        trafficData,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        name: routeData.name,
        description: routeData.description,
      };

      let routeId;
      if (routeData.id) {
        await updateDoc(doc(db, this.routesCollection, routeData.id), routeDoc);
        routeId = routeData.id;
      } else {
        const docRef = await addDoc(collection(db, this.routesCollection), routeDoc);
        routeId = docRef.id;
      }

      // Handle student assignments in a batch
      if (assignedStudents && assignedStudents.length > 0) {
        await this.assignStudentsToRoute(routeId, assignedStudents, routeWithTimes);
      }

      return routeId;
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw error;
    }
  }

  // Assign students to a route and their specific stops
  async assignStudentsToRoute(routeId, students, stops) {
    try {
      const batch = writeBatch(db);

      // First, remove any existing assignments for these students
      const existingAssignments = await getDocs(
        query(
          collection(db, this.studentRoutesCollection),
          where('studentId', 'in', students.map(s => s.id))
        )
      );

      existingAssignments.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Create new assignments with stop information
      students.forEach(student => {
        const assignmentRef = doc(collection(db, this.studentRoutesCollection));
        const stopIndex = student.stopIndex;
        const stop = stops[stopIndex];
        
        batch.set(assignmentRef, {
          routeId,
          studentId: student.id,
          studentName: student.fullName,
          grade: student.grade,
          stopIndex: stopIndex,
          stopName: stop.name,
          estimatedArrivalTime: stop.estimatedArrivalTime,
          estimatedDepartureTime: stop.estimatedDepartureTime,
          assignedAt: serverTimestamp(),
          isActive: true,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error assigning students to route:', error);
      throw error;
    }
  }

  // Get students assigned to a route with their stop information
  async getRouteStudents(routeId) {
    try {
      const assignmentsQuery = query(
        collection(db, this.studentRoutesCollection),
        where('routeId', '==', routeId),
        where('isActive', '==', true),
        orderBy('stopIndex', 'asc')
      );
      const snapshot = await getDocs(assignmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting route students:', error);
      throw error;
    }
  }

  // Get students assigned to a specific stop
  async getStopStudents(routeId, stopIndex) {
    try {
      const assignmentsQuery = query(
        collection(db, this.studentRoutesCollection),
        where('routeId', '==', routeId),
        where('stopIndex', '==', stopIndex),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(assignmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting stop students:', error);
      throw error;
    }
  }

  // Get historical traffic data for route segments
  async getHistoricalTrafficData(locations) {
    try {
      const trafficQuery = query(
        collection(db, 'trafficHistory'),
        where('locations', 'array-contains-any', locations),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(trafficQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting traffic data:', error);
      throw error;
    }
  }

  // Calculate optimal route order considering student assignments
  async calculateOptimalRoute(stops, trafficData) {
    // Group students by stop for optimization
    const stopStudentCounts = stops.map((stop, index) => ({
      ...stop,
      studentCount: stop.students ? stop.students.length : 0,
      index
    }));

    // Sort stops based on student density and traffic patterns
    // This is a simple implementation - you might want to use a more sophisticated algorithm
    const sortedStops = stopStudentCounts.sort((a, b) => {
      // Prioritize stops with more students
      const studentDiff = b.studentCount - a.studentCount;
      if (studentDiff !== 0) return studentDiff;
      
      // If same number of students, maintain original order
      return a.index - b.index;
    });

    return sortedStops.map((stop, index) => ({
      ...stop,
      optimizedOrder: index
    }));
  }

  // Calculate estimated times for each stop
  calculateEstimatedTimes(stops, trafficData) {
    // Implementation of time estimation
    // This would use historical traffic data and route optimization results
    return stops.map(stop => ({
      ...stop,
      estimatedArrivalTime: new Date().toISOString(), // Placeholder for actual calculation
      estimatedDepartureTime: new Date().toISOString(), // Placeholder for actual calculation
    }));
  }

  // Get active routes for a school
  async getActiveRoutes(schoolId) {
    try {
      const routesQuery = query(
        collection(db, this.routesCollection),
        where('schoolId', '==', schoolId),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(routesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active routes:', error);
      throw error;
    }
  }

  // Simulate route with given conditions
  async simulateRoute(routeId, conditions) {
    try {
      const route = await this.getRouteById(routeId);
      if (!route) {
        throw new Error('Route not found');
      }

      // Get assigned students
      const students = await this.getRouteStudents(routeId);

      // Calculate simulation results based on conditions and student load
      const simulationResults = this.calculateSimulationResults(route, conditions, students);

      // Log simulation for analytics
      await this.logSimulation(routeId, conditions, simulationResults);

      return simulationResults;
    } catch (error) {
      console.error('Error simulating route:', error);
      throw error;
    }
  }

  // Get route by ID
  async getRouteById(routeId) {
    try {
      const routeDoc = await doc(db, this.routesCollection, routeId);
      const routeData = await routeDoc.get();
      return routeData.exists ? { id: routeData.id, ...routeData.data() } : null;
    } catch (error) {
      console.error('Error getting route:', error);
      throw error;
    }
  }

  // Calculate simulation results
  calculateSimulationResults(route, conditions, students) {
    // Calculate baseline duration from route stops
    const baselineDuration = this.calculateBaselineDuration(route.stops);

    // Apply condition modifiers
    const weatherModifier = this.getWeatherModifier(conditions.weather);
    const trafficModifier = this.getTrafficModifier(conditions.trafficConditions);
    const experienceModifier = this.getDriverExperienceModifier(conditions.driverExperience);
    const timeModifier = this.getTimeOfDayModifier(conditions.timeOfDay);
    const busTypeModifier = this.getBusTypeModifier(conditions.busType, students.length);

    // Calculate final duration with all modifiers
    const estimatedDuration = Math.round(
      baselineDuration * 
      weatherModifier * 
      trafficModifier * 
      experienceModifier * 
      timeModifier * 
      busTypeModifier
    );

    // Calculate risk level based on conditions
    const riskLevel = this.calculateRiskLevel(conditions);

    // Calculate reliability score
    const reliabilityScore = this.calculateReliabilityScore(conditions, students.length);

    // Calculate detailed impact scores
    const weatherImpact = this.calculateWeatherImpact(conditions.weather);
    const trafficImpact = this.calculateTrafficImpact(conditions.trafficConditions);
    const driverEfficiency = this.calculateDriverEfficiency(conditions.driverExperience);
    const timeImpact = this.calculateTimeImpact(conditions.timeOfDay);
    const loadImpact = this.calculateLoadImpact(students.length, conditions.busType);

    return {
      estimatedDuration,
      riskLevel,
      reliabilityScore,
      weatherImpact,
      trafficImpact,
      driverEfficiency,
      timeImpact,
      loadImpact,
      totalStudents: students.length,
      recommendations: this.generateRecommendations(conditions, students.length)
    };
  }

  calculateBaselineDuration(stops) {
    if (!stops || stops.length === 0) return 0;

    let totalDuration = 0;
    const averageStopTime = 3; // minutes per stop

    // Calculate travel time between stops
    for (let i = 0; i < stops.length - 1; i++) {
      const currentStop = stops[i];
      const nextStop = stops[i + 1];
      
      // Calculate distance between stops using Haversine formula
      const distance = this.calculateDistance(
        currentStop.lat,
        currentStop.lng,
        nextStop.lat,
        nextStop.lng
      );
      
      // Assume average speed of 30 mph (0.5 miles per minute)
      const travelTime = distance / 0.5;
      totalDuration += travelTime;
      
      // Add stop time for loading/unloading
      totalDuration += averageStopTime;
    }

    return Math.round(totalDuration);
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  getBusTypeModifier(busType, studentCount) {
    const modifiers = {
      'STANDARD': {
        capacity: 50,
        speedModifier: 1.0
      },
      'MINI': {
        capacity: 25,
        speedModifier: 0.9
      },
      'LARGE': {
        capacity: 75,
        speedModifier: 1.2
      },
      'SPECIAL_NEEDS': {
        capacity: 30,
        speedModifier: 1.3
      }
    };

    const bus = modifiers[busType] || modifiers.STANDARD;
    const loadFactor = Math.min(studentCount / bus.capacity, 1);
    return bus.speedModifier * (1 + (loadFactor * 0.2));
  }

  calculateWeatherImpact(weather) {
    const impacts = {
      'CLEAR': 100,
      'RAIN': 70,
      'SNOW': 40,
      'FOG': 60,
      'STORM': 30
    };
    return impacts[weather] || 100;
  }

  calculateTrafficImpact(traffic) {
    const impacts = {
      'LIGHT': 100,
      'NORMAL': 80,
      'HEAVY': 50,
      'SEVERE': 30
    };
    return impacts[traffic] || 80;
  }

  calculateDriverEfficiency(experience) {
    const efficiencies = {
      'NOVICE': 70,
      'INTERMEDIATE': 85,
      'EXPERIENCED': 95,
      'EXPERT': 100
    };
    return efficiencies[experience] || 85;
  }

  calculateTimeImpact(timeOfDay) {
    const impacts = {
      'EARLY_MORNING': 90,
      'MORNING': 70,
      'AFTERNOON': 80,
      'EVENING': 85
    };
    return impacts[timeOfDay] || 80;
  }

  calculateLoadImpact(studentCount, busType) {
    const maxCapacity = {
      'STANDARD': 50,
      'MINI': 25,
      'LARGE': 75,
      'SPECIAL_NEEDS': 30
    }[busType] || 50;

    const loadPercentage = (studentCount / maxCapacity) * 100;
    if (loadPercentage <= 50) return 100;
    if (loadPercentage <= 75) return 90;
    if (loadPercentage <= 90) return 80;
    if (loadPercentage <= 100) return 70;
    return 60;
  }

  generateRecommendations(conditions, studentCount) {
    const recommendations = [];

    // Weather-based recommendations
    if (['SNOW', 'STORM'].includes(conditions.weather)) {
      recommendations.push('Consider rescheduling or alternative routes due to severe weather');
    } else if (conditions.weather === 'FOG') {
      recommendations.push('Reduce speed and increase following distance');
    }

    // Traffic-based recommendations
    if (['HEAVY', 'SEVERE'].includes(conditions.trafficConditions)) {
      recommendations.push('Consider alternative routes to avoid heavy traffic areas');
    }

    // Driver experience recommendations
    if (conditions.driverExperience === 'NOVICE') {
      recommendations.push('Consider assigning a more experienced driver for challenging conditions');
    }

    // Load-based recommendations
    const busCapacity = {
      'STANDARD': 50,
      'MINI': 25,
      'LARGE': 75,
      'SPECIAL_NEEDS': 30
    }[conditions.busType] || 50;

    if (studentCount > busCapacity * 0.9) {
      recommendations.push('Consider splitting the route or using a larger bus');
    }

    return recommendations;
  }

  // Helper methods for simulation calculations
  getWeatherModifier(weather) {
    const modifiers = {
      'CLEAR': 1.0,
      'RAIN': 1.3,
      'SNOW': 1.6,
      'FOG': 1.4,
      'STORM': 1.8,
    };
    return modifiers[weather] || 1.0;
  }

  getTrafficModifier(traffic) {
    const modifiers = {
      'LIGHT': 0.8,
      'NORMAL': 1.0,
      'HEAVY': 1.4,
      'SEVERE': 1.8,
    };
    return modifiers[traffic] || 1.0;
  }

  getDriverExperienceModifier(experience) {
    const modifiers = {
      'NOVICE': 1.2,
      'INTERMEDIATE': 1.1,
      'EXPERIENCED': 1.0,
      'EXPERT': 0.9,
    };
    return modifiers[experience] || 1.0;
  }

  getTimeOfDayModifier(timeOfDay) {
    const modifiers = {
      'EARLY_MORNING': 0.9,
      'MORNING': 1.2,
      'AFTERNOON': 1.1,
      'EVENING': 1.0,
    };
    return modifiers[timeOfDay] || 1.0;
  }

  calculateRiskLevel(conditions) {
    // Calculate risk score based on conditions
    let riskScore = 0;
    
    // Weather risk
    const weatherRisk = {
      'CLEAR': 0,
      'RAIN': 2,
      'SNOW': 4,
      'FOG': 3,
      'STORM': 5,
    };
    riskScore += weatherRisk[conditions.weather] || 0;

    // Traffic risk
    const trafficRisk = {
      'LIGHT': 0,
      'NORMAL': 1,
      'HEAVY': 3,
      'SEVERE': 5,
    };
    riskScore += trafficRisk[conditions.trafficConditions] || 0;

    // Driver experience mitigation
    const experienceMitigation = {
      'NOVICE': 2,
      'INTERMEDIATE': 1,
      'EXPERIENCED': 0,
      'EXPERT': -1,
    };
    riskScore += experienceMitigation[conditions.driverExperience] || 0;

    // Determine risk level
    if (riskScore <= 2) return 'LOW';
    if (riskScore <= 5) return 'MEDIUM';
    return 'HIGH';
  }

  calculateReliabilityScore(conditions, studentCount) {
    // Base reliability score out of 100
    let score = 100;

    // Deduct points based on conditions
    const weatherDeduction = {
      'CLEAR': 0,
      'RAIN': 5,
      'SNOW': 15,
      'FOG': 10,
      'STORM': 20,
    };
    score -= weatherDeduction[conditions.weather] || 0;

    const trafficDeduction = {
      'LIGHT': 0,
      'NORMAL': 5,
      'HEAVY': 15,
      'SEVERE': 25,
    };
    score -= trafficDeduction[conditions.trafficConditions] || 0;

    // Add points for driver experience
    const experienceBonus = {
      'NOVICE': 0,
      'INTERMEDIATE': 5,
      'EXPERIENCED': 10,
      'EXPERT': 15,
    };
    score += experienceBonus[conditions.driverExperience] || 0;

    // Adjust for student load (deduct 1 point per 10 students)
    score -= Math.floor(studentCount / 10);

    // Ensure score stays within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  // Log simulation for analytics
  async logSimulation(routeId, conditions, results) {
    try {
      await addDoc(collection(db, this.routeLogsCollection), {
        routeId,
        conditions,
        results,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging simulation:', error);
      // Don't throw error as this is not critical
    }
  }
} 