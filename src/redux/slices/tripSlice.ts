import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type VehicleCategory = 'economic' | 'xl' | 'premium';
type TripStatus = 'idle' | 'searching' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

interface TripDetails {
  id: string;
  originAddress: string;
  destinationAddress: string;
  vehicleCategory: VehicleCategory;
  estimatedPrice: number;
  estimatedDuration: number;
  estimatedDistance: number;
  status: TripStatus;
  driverId?: string;
  driverName?: string;
  driverPhoto?: string;
  vehiclePlate?: string;
}

interface TripState {
  currentTrip: TripDetails | null;
  selectedCategory: VehicleCategory;
  estimatedPrice: number;
  estimatedDuration: number;
  estimatedDistance: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: TripState = {
  currentTrip: null,
  selectedCategory: 'economic',
  estimatedPrice: 0,
  estimatedDuration: 0,
  estimatedDistance: 0,
  isLoading: false,
  error: null,
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<VehicleCategory>) => {
      state.selectedCategory = action.payload;
    },
    setEstimates: (state, action: PayloadAction<{ price: number; duration: number; distance: number }>) => {
      state.estimatedPrice = action.payload.price;
      state.estimatedDuration = action.payload.duration;
      state.estimatedDistance = action.payload.distance;
    },
    setCurrentTrip: (state, action: PayloadAction<TripDetails | null>) => {
      state.currentTrip = action.payload;
      state.isLoading = false;
    },
    updateTripStatus: (state, action: PayloadAction<TripStatus>) => {
      if (state.currentTrip) {
        state.currentTrip.status = action.payload;
      }
    },
    setTripLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTripError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearTrip: (state) => {
      state.currentTrip = null;
      state.estimatedPrice = 0;
      state.estimatedDuration = 0;
      state.estimatedDistance = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { 
  setSelectedCategory, 
  setEstimates, 
  setCurrentTrip, 
  updateTripStatus, 
  setTripLoading, 
  setTripError, 
  clearTrip 
} = tripSlice.actions;
export default tripSlice.reducer;
