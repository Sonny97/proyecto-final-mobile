import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationState {
  currentLocation: Location | null;
  origin: Location | null;
  destination: Location | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  currentLocation: null,
  origin: null,
  destination: null,
  isLoading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
      state.error = null;
    },
    setOrigin: (state, action: PayloadAction<Location | null>) => {
      state.origin = action.payload;
    },
    setDestination: (state, action: PayloadAction<Location | null>) => {
      state.destination = action.payload;
    },
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLocationError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearLocations: (state) => {
      state.origin = null;
      state.destination = null;
    },
  },
});

export const { 
  setCurrentLocation, 
  setOrigin, 
  setDestination, 
  setLocationLoading, 
  setLocationError, 
  clearLocations 
} = locationSlice.actions;
export default locationSlice.reducer;
