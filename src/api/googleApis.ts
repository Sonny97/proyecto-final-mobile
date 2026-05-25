import { GOOGLE_CONFIG } from '../config';

const BASE_URL = 'https://maps.googleapis.com/maps/api';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address: string;
  name: string;
}

/**
 * Fetch place suggestions using Google Places Autocomplete
 */
export const fetchPlaceSuggestions = async (input: string): Promise<PlacePrediction[]> => {
  if (!input || input.length < 2) return [];

  const url = `${BASE_URL}/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_CONFIG.apiKey}&language=es`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.predictions || [];
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    return [];
  }
};

/**
 * Get place details by place_id
 */
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  const url = `${BASE_URL}/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,name&key=${GOOGLE_CONFIG.apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};

/**
 * Get route directions between two points
 */
export const getDirections = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) => {
  const url = `${BASE_URL}/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_CONFIG.apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.value, // meters
        duration: leg.duration.value, // seconds
        polyline: route.overview_polyline.points,
        steps: leg.steps,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching directions:', error);
    return null;
  }
};

/**
 * Calculate distance and time using Distance Matrix API
 */
export const calculateDistanceMatrix = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) => {
  const url = `${BASE_URL}/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${GOOGLE_CONFIG.apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.rows && data.rows.length > 0) {
      const element = data.rows[0].elements[0];

      if (element.status === 'OK') {
        return {
          distanceMeters: element.distance.value,
          distanceText: element.distance.text,
          durationSeconds: element.duration.value,
          durationText: element.duration.text,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error calculating distance matrix:', error);
    return null;
  }
};

/**
 * Calculate estimated fare based on distance and vehicle category
 */
export const calculateFare = (
  distanceKm: number,
  durationMinutes: number,
  category: 'economic' | 'xl' | 'premium'
): number => {
  const baseFares = {
    economic: 3500,  // COP
    xl: 5000,
    premium: 8000,
  };

  const perKmRates = {
    economic: 1200,
    xl: 1800,
    premium: 2500,
  };

  const perMinuteRates = {
    economic: 150,
    xl: 200,
    premium: 300,
  };

  const baseFare = baseFares[category];
  const distanceFare = distanceKm * perKmRates[category];
  const timeFare = durationMinutes * perMinuteRates[category];

  return Math.round(baseFare + distanceFare + timeFare);
};
