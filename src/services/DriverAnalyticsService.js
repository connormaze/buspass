import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';

export class DriverAnalyticsService {
  constructor() {
    this.performanceMetrics = {
      SPEED_VIOLATION: { weight: 0.3, threshold: 45 }, // mph
      ROUTE_DEVIATION: { weight: 0.3, threshold: 500 }, // meters
      HARD_BRAKE: { weight: 0.2, threshold: -7 }, // m/s²
      RAPID_ACCELERATION: { weight: 0.2, threshold: 3.5 }, // m/s²
    };
  }

  async getDriverPerformance(driverId, timeRange = 30) { // days
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      // Get route completion data
      const routeData = await this.getRouteCompletionData(driverId, startDate);
      
      // Get safety violations
      const safetyData = await this.getSafetyViolations(driverId, startDate);
      
      // Get weather impact data
      const weatherData = await this.getWeatherImpactData(driverId, startDate);

      // Calculate overall score
      const score = this.calculatePerformanceScore(routeData, safetyData);

      return {
        score,
        routeData,
        safetyData,
        weatherData,
        recommendations: this.generateRecommendations(routeData, safetyData, weatherData)
      };
    } catch (error) {
      console.error('Error getting driver performance:', error);
      // Return default values instead of null
      return {
        score: 100,
        routeData: {
          totalRoutes: 0,
          onTimePercentage: 100,
          averageDelay: 0,
          routeEfficiency: 100
        },
        safetyData: {
          speedViolations: 0,
          routeDeviations: 0,
          hardBrakes: 0,
          rapidAccelerations: 0,
          totalViolations: 0
        },
        weatherData: {
          delaysByWeather: {},
          recommendedSpeedAdjustments: []
        },
        recommendations: []
      };
    }
  }

  async getRouteCompletionData(driverId, startDate) {
    try {
      const routesQuery = query(
        collection(db, 'routeCompletions'),
        where('driverId', '==', driverId),
        where('timestamp', '>=', startDate)
      );

      const snapshot = await getDocs(routesQuery);
      const completions = snapshot.docs.map(doc => doc.data());

      return {
        totalRoutes: completions.length,
        onTimePercentage: this.calculateOnTimePercentage(completions),
        averageDelay: this.calculateAverageDelay(completions),
        routeEfficiency: this.calculateRouteEfficiency(completions)
      };
    } catch (error) {
      console.error('Error fetching route completion data:', error);
      // Return default values if index is not ready
      return {
        totalRoutes: 0,
        onTimePercentage: 100,
        averageDelay: 0,
        routeEfficiency: 100
      };
    }
  }

  async getSafetyViolations(driverId, startDate) {
    try {
      const violationsQuery = query(
        collection(db, 'safetyViolations'),
        where('driverId', '==', driverId),
        where('timestamp', '>=', startDate)
      );

      const snapshot = await getDocs(violationsQuery);
      const violations = snapshot.docs.map(doc => doc.data());

      return {
        speedViolations: violations.filter(v => v.type === 'SPEED_VIOLATION').length,
        routeDeviations: violations.filter(v => v.type === 'ROUTE_DEVIATION').length,
        hardBrakes: violations.filter(v => v.type === 'HARD_BRAKE').length,
        rapidAccelerations: violations.filter(v => v.type === 'RAPID_ACCELERATION').length,
        totalViolations: violations.length
      };
    } catch (error) {
      console.error('Error fetching safety violations:', error);
      // Return default values if index is not ready
      return {
        speedViolations: 0,
        routeDeviations: 0,
        hardBrakes: 0,
        rapidAccelerations: 0,
        totalViolations: 0
      };
    }
  }

  async getWeatherImpactData(driverId, startDate) {
    try {
      let currentWeather = {
        temperature: null,
        condition: 'Clear'
      };

      try {
        // First get the driver's active bus and route
        const busQuery = query(
          collection(db, 'buses'),
          where('driverUid', '==', driverId),
          where('isActive', '==', true)
        );
        const busSnapshot = await getDocs(busQuery);
        const busData = busSnapshot.docs[0]?.data();

        if (busData?.currentLocation) {
          // Get current weather data based on bus location
          const currentWeatherQuery = query(
            collection(db, 'currentWeather'),
            where('location', '==', busData.currentLocation)
          );
          const currentWeatherSnapshot = await getDocs(currentWeatherQuery);
          if (!currentWeatherSnapshot.empty) {
            currentWeather = currentWeatherSnapshot.docs[0].data();
          }
        }
      } catch (weatherError) {
        console.error('Error fetching current weather:', weatherError);
      }

      // Get weather impact history
      const weatherQuery = query(
        collection(db, 'weatherImpact'),
        where('driverId', '==', driverId),
        where('timestamp', '>=', startDate)
      );

      const snapshot = await getDocs(weatherQuery);
      const weatherData = snapshot.docs.map(doc => doc.data());

      return {
        currentTemp: currentWeather.temperature,
        currentCondition: currentWeather.condition,
        delaysByWeather: this.aggregateWeatherDelays(weatherData),
        recommendedSpeedAdjustments: this.calculateWeatherSpeedAdjustments(weatherData)
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return default values with more detailed weather information
      return {
        currentTemp: '--',
        currentCondition: 'Clear',
        delaysByWeather: {},
        recommendedSpeedAdjustments: [],
        error: error.code === 'failed-precondition' ? 
          'Weather data index is being created. Please wait a few minutes.' : 
          'Error fetching weather data'
      };
    }
  }

  calculatePerformanceScore(routeData, safetyData) {
    const routeScore = (routeData.onTimePercentage / 100) * 50; // 50% weight for route performance
    
    // Calculate safety score (50% weight)
    const maxViolations = 10; // Threshold for minimum safety score
    const violationScore = Math.max(0, (1 - (safetyData.totalViolations / maxViolations)) * 50);
    
    return Math.round(routeScore + violationScore);
  }

  calculateOnTimePercentage(completions) {
    if (!completions.length) return 100;
    const onTimeRoutes = completions.filter(c => !c.delay || c.delay <= 300); // 5 minutes threshold
    return Math.round((onTimeRoutes.length / completions.length) * 100);
  }

  calculateAverageDelay(completions) {
    if (!completions.length) return 0;
    const totalDelay = completions.reduce((sum, c) => sum + (c.delay || 0), 0);
    return Math.round(totalDelay / completions.length);
  }

  calculateRouteEfficiency(completions) {
    if (!completions.length) return 100;
    const efficiencyScores = completions.map(c => {
      const plannedDuration = c.plannedDuration || 3600; // 1 hour default
      const actualDuration = c.actualDuration || plannedDuration;
      return (plannedDuration / actualDuration) * 100;
    });
    return Math.round(efficiencyScores.reduce((a, b) => a + b) / efficiencyScores.length);
  }

  aggregateWeatherDelays(weatherData) {
    return weatherData.reduce((acc, data) => {
      acc[data.condition] = acc[data.condition] || { count: 0, totalDelay: 0 };
      acc[data.condition].count++;
      acc[data.condition].totalDelay += data.delay || 0;
      return acc;
    }, {});
  }

  calculateWeatherSpeedAdjustments(weatherData) {
    const adjustments = {
      rain: { speed: -5, reason: 'Wet roads require lower speeds' },
      snow: { speed: -10, reason: 'Snowy conditions require significant speed reduction' },
      fog: { speed: -7, reason: 'Limited visibility requires careful driving' },
      ice: { speed: -15, reason: 'Icy conditions require extreme caution' }
    };

    return Object.entries(this.aggregateWeatherDelays(weatherData)).map(([condition, data]) => ({
      condition,
      ...adjustments[condition.toLowerCase()],
      occurrences: data.count
    }));
  }

  generateRecommendations(routeData, safetyData, weatherData) {
    const recommendations = [];

    // Route performance recommendations
    if (routeData.onTimePercentage < 80) {
      recommendations.push({
        type: 'ROUTE',
        priority: 'HIGH',
        message: 'Consider adjusting departure time or route optimization to improve on-time performance'
      });
    }

    // Safety recommendations
    if (safetyData.speedViolations > 0) {
      recommendations.push({
        type: 'SAFETY',
        priority: 'HIGH',
        message: `Reduce speed in zones with ${safetyData.speedViolations} recorded violations`
      });
    }

    // Weather-based recommendations
    Object.entries(weatherData.delaysByWeather).forEach(([condition, data]) => {
      if (data.totalDelay > 0) {
        recommendations.push({
          type: 'WEATHER',
          priority: 'MEDIUM',
          message: `Allow extra time during ${condition.toLowerCase()} conditions based on historical delays`
        });
      }
    });

    return recommendations;
  }

  async storeAnalytics(driverId, analyticsData) {
    try {
      await addDoc(collection(db, 'driverAnalytics'), {
        driverId,
        timestamp: new Date(),
        ...analyticsData
      });
    } catch (error) {
      console.error('Error storing driver analytics:', error);
    }
  }
} 