import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export class ETAService {
  constructor() {
    this.historicalData = {};
    this.weatherFactors = {
      'clear': 1,
      'rain': 1.3,
      'snow': 1.5,
      'storm': 1.8
    };
  }

  async getHistoricalData(routeId, timeWindow) {
    const historicalRef = collection(db, 'historicalETAs');
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30); // Last 30 days

    const q = query(
      historicalRef,
      where('routeId', '==', routeId),
      where('timestamp', '>=', startTime)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async calculatePredictiveETA(routeId, currentLocation, destination, weather = 'clear') {
    try {
      // Get historical data for this route and time window
      const historicalData = await this.getHistoricalData(routeId);
      
      // Calculate base ETA using Google Distance Matrix
      const baseETA = await this.getBaseETA(currentLocation, destination);
      
      // Apply historical adjustment factor
      const historicalFactor = this.calculateHistoricalFactor(historicalData);
      
      // Apply weather adjustment
      const weatherFactor = this.weatherFactors[weather.toLowerCase()] || 1;
      
      // Apply time of day factor
      const timeOfDayFactor = this.getTimeOfDayFactor();
      
      // Calculate final ETA
      const adjustedETA = baseETA * historicalFactor * weatherFactor * timeOfDayFactor;
      
      // Store prediction for accuracy tracking
      await this.storePrediction(routeId, {
        baseETA,
        adjustedETA,
        factors: {
          historical: historicalFactor,
          weather: weatherFactor,
          timeOfDay: timeOfDayFactor
        }
      });

      return {
        eta: adjustedETA,
        confidence: this.calculateConfidence(historicalData.length),
        factors: {
          historical: historicalFactor,
          weather: weatherFactor,
          timeOfDay: timeOfDayFactor
        }
      };
    } catch (error) {
      console.error('Error calculating predictive ETA:', error);
      return null;
    }
  }

  calculateHistoricalFactor(historicalData) {
    if (!historicalData.length) return 1;

    // Calculate average deviation from predicted times
    const deviations = historicalData.map(data => data.actualTime / data.predictedTime);
    const averageDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;

    return averageDeviation;
  }

  getTimeOfDayFactor() {
    const hour = new Date().getHours();
    
    // Rush hour adjustments
    if (hour >= 7 && hour <= 9) return 1.4; // Morning rush
    if (hour >= 16 && hour <= 18) return 1.3; // Evening rush
    if (hour >= 22 || hour <= 5) return 0.8; // Night time
    
    return 1;
  }

  calculateConfidence(dataPoints) {
    // More historical data points = higher confidence
    const baseConfidence = Math.min(dataPoints / 100, 0.9);
    return Math.max(baseConfidence, 0.4); // Minimum 40% confidence
  }

  async getBaseETA(origin, destination) {
    // Implementation would use Google Distance Matrix API
    // For now, return a simple distance-based calculation
    const distance = this.calculateDistance(origin, destination);
    const averageSpeed = 30; // mph
    return (distance / averageSpeed) * 3600; // seconds
  }

  calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = this.toRadians(point1.lat);
    const φ2 = this.toRadians(point2.lat);
    const Δφ = this.toRadians(point2.lat - point1.lat);
    const Δλ = this.toRadians(point2.lng - point1.lng);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  async storePrediction(routeId, prediction) {
    try {
      await addDoc(collection(db, 'etaPredictions'), {
        routeId,
        timestamp: new Date(),
        ...prediction
      });
    } catch (error) {
      console.error('Error storing ETA prediction:', error);
    }
  }
} 