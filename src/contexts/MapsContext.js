import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const MapsContext = createContext(null);

// Create a singleton loader instance
const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry', 'directions']
});

let googleMapsPromise = null;

export function useMaps() {
  const context = useContext(MapsContext);
  if (!context) {
    throw new Error('useMaps must be used within a MapsProvider');
  }
  return context;
}

export function MapsProvider({ children }) {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const [googleMaps, setGoogleMaps] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [currentNavigation, setCurrentNavigation] = useState(null);
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!googleMapsPromise) {
      googleMapsPromise = loader.load();
    }

    googleMapsPromise
      .then((google) => {
        window.google = google;
        setGoogleMaps(google);
        setDirectionsService(new google.maps.DirectionsService());
        setDirectionsRenderer(new google.maps.DirectionsRenderer());
        setMapsLoaded(true);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setMapsError('Failed to load Google Maps');
      });
  }, []);

  const calculateRoute = async (origin, destination, waypoints = []) => {
    if (!directionsService) return null;

    try {
      const response = await directionsService.route({
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setCurrentNavigation(response);
      setNavigationSteps(response.routes[0].legs[0].steps);
      setCurrentStepIndex(0);
      
      if (directionsRenderer) {
        directionsRenderer.setDirections(response);
      }

      return response;
    } catch (error) {
      console.error('Error calculating route:', error);
      return null;
    }
  };

  const nextStep = () => {
    if (currentStepIndex < navigationSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const resetNavigation = () => {
    setCurrentNavigation(null);
    setNavigationSteps([]);
    setCurrentStepIndex(0);
    if (directionsRenderer) {
      directionsRenderer.setDirections(null);
    }
  };

  const value = {
    mapsLoaded,
    mapsError,
    googleMaps,
    directionsService,
    directionsRenderer,
    currentNavigation,
    navigationSteps,
    currentStepIndex,
    calculateRoute,
    nextStep,
    previousStep,
    resetNavigation
  };

  return (
    <MapsContext.Provider value={value}>
      {children}
    </MapsContext.Provider>
  );
} 