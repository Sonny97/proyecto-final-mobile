import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { setCurrentLocation } from '../../redux/slices/locationSlice';
import { colors, spacing } from '../../theme';

const INITIAL_REGION: Region = {
  latitude: 4.6097,  // Bogotá default
  longitude: -74.0817,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

interface MapViewContainerProps {
  showOriginMarker?: boolean;
  showDestinationMarker?: boolean;
  onMapReady?: () => void;
}

const MapViewContainer: React.FC<MapViewContainerProps> = ({
  showOriginMarker = true,
  showDestinationMarker = true,
  onMapReady,
}) => {
  const mapRef = useRef<MapView>(null);
  const dispatch = useAppDispatch();
  const { currentLocation, loading, error, refreshLocation } = useLocation();
  const { origin, destination } = useAppSelector((state) => state.location);

  // Update Redux store when location changes
  useEffect(() => {
    if (currentLocation) {
      dispatch(setCurrentLocation(currentLocation));
    }
  }, [currentLocation, dispatch]);

  // Animate map to fit markers when origin/destination change
  useEffect(() => {
    if (mapRef.current && origin && destination) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude },
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        }
      );
    } else if (mapRef.current && origin) {
      mapRef.current.animateToRegion({
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [origin, destination]);

  // Animate to current location on load
  useEffect(() => {
    if (mapRef.current && currentLocation && !origin) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation, origin]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.retryText} onPress={refreshLocation}>
          Intentar de nuevo
        </Text>
      </View>
    );
  }

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : INITIAL_REGION;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onMapReady={onMapReady}
      >
        {/* Origin Marker */}
        {showOriginMarker && origin && (
          <Marker
            coordinate={{
              latitude: origin.latitude,
              longitude: origin.longitude,
            }}
            title="Origen"
            description={origin.address}
            pinColor={colors.secondary}
          />
        )}

        {/* Destination Marker */}
        {showDestinationMarker && destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destino"
            description={destination.address}
            pinColor={colors.accent}
          />
        )}

        {/* Current Location Marker (when no origin set) */}
        {!origin && currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Tu ubicación"
          >
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(39, 110, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.textWhite,
  },
});

export default MapViewContainer;
