import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppRedux';
import { clearTrip } from '../../redux/slices/tripSlice';
import { clearLocations } from '../../redux/slices/locationSlice';
import VehicleCategorySelector from '../../components/trip/VehicleCategorySelector';
import TripEstimate from '../../components/trip/TripEstimate';
import ConfirmTripButton from '../../components/trip/ConfirmTripButton';
import { decodePolyline } from '../../utils/polylineDecoder';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

type TripRequestNavigationProp = StackNavigationProp<RootStackParamList, 'TripRequest'>;

const TripRequestScreen = () => {
  const navigation = useNavigation<TripRequestNavigationProp>();
  const dispatch = useAppDispatch();
  const mapRef = useRef<MapView>(null);

  const { origin, destination } = useAppSelector((state) => state.location);
  const { estimatedPrice } = useAppSelector((state) => state.trip);

  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);

  // Fit map to show both markers
  useEffect(() => {
    if (mapRef.current && origin && destination) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude },
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
          animated: true,
        }
      );
    }
  }, [origin, destination]);

  const handleEstimateCalculated = useCallback(
    (estimate: { polyline: string }) => {
      if (estimate.polyline) {
        const coords = decodePolyline(estimate.polyline);
        setRouteCoordinates(coords);
      }
    },
    []
  );

  const handleTripConfirmed = useCallback(
    (tripId: string) => {
      // Navigate to tracking screen
      navigation.navigate('TripTracking', { tripId });
    },
    [navigation]
  );

  const handleGoBack = () => {
    dispatch(clearTrip());
    navigation.goBack();
  };

  const handleCancelTrip = () => {
    dispatch(clearTrip());
    dispatch(clearLocations());
    navigation.goBack();
  };

  if (!origin || !destination) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró el origen o destino</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Map with Route */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Origin Marker */}
        <Marker
          coordinate={{
            latitude: origin.latitude,
            longitude: origin.longitude,
          }}
          title="Origen"
          description={origin.address}
        >
          <View style={styles.originMarker}>
            <View style={styles.originMarkerDot} />
          </View>
        </Marker>

        {/* Destination Marker */}
        <Marker
          coordinate={{
            latitude: destination.latitude,
            longitude: destination.longitude,
          }}
          title="Destino"
          description={destination.address}
        >
          <View style={styles.destinationMarker}>
            <View style={styles.destinationMarkerIcon}>
              <Text style={styles.destinationMarkerText}>📍</Text>
            </View>
          </View>
        </Marker>

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.secondary}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Back Button */}
      <SafeAreaView style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <Text style={styles.headerBackIcon}>←</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Trip Summary */}
          <View style={styles.tripSummary}>
            <View style={styles.locationRow}>
              <View style={styles.locationDot}>
                <View style={styles.originDot} />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Origen</Text>
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {origin.address}
                </Text>
              </View>
            </View>

            <View style={styles.locationConnector} />

            <View style={styles.locationRow}>
              <View style={styles.locationDot}>
                <View style={styles.destinationDot} />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Destino</Text>
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {destination.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Trip Estimate */}
          <View style={styles.estimateContainer}>
            <TripEstimate onEstimateCalculated={handleEstimateCalculated} />
          </View>

          {/* Vehicle Selector */}
          <VehicleCategorySelector basePrice={estimatedPrice || 5000} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <ConfirmTripButton onTripConfirmed={handleTripConfirmed} />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelTrip}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
    marginTop: spacing.md,
    ...shadows.md,
  },
  headerBackIcon: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '60%',
    ...shadows.lg,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  scrollContent: {
    maxHeight: 300,
  },
  tripSummary: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 24,
    alignItems: 'center',
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  destinationDot: {
    width: 10,
    height: 10,
    backgroundColor: colors.primary,
  },
  locationConnector: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 11,
    marginVertical: spacing.xs,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  locationLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locationAddress: {
    ...typography.body,
    color: colors.textPrimary,
  },
  estimateContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  actionContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  originMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(39, 110, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  originMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.textWhite,
  },
  destinationMarker: {
    alignItems: 'center',
  },
  destinationMarkerIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationMarkerText: {
    fontSize: 24,
  },
});

export default TripRequestScreen;
