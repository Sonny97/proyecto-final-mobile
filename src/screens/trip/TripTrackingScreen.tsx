import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppRedux';
import {
  setCurrentTrip,
  updateTripStatus,
  clearTrip,
} from '../../redux/slices/tripSlice';
import { clearLocations } from '../../redux/slices/locationSlice';
import {
  subscribeToTrip,
  subscribeToDriverLocation,
  updateTripStatus as updateTripStatusFirestore,
} from '../../services/firebase/firestore';
import { getDirections } from '../../api/googleApis';
import { decodePolyline } from '../../utils/polylineDecoder';
import DriverMarker from '../../components/tracking/DriverMarker';
import TripStatusCard from '../../components/tracking/TripStatusCard';
import PaymentSheet from '../../components/payment/PaymentSheet';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, spacing, borderRadius, shadows } from '../../theme';

type TripTrackingRouteProp = RouteProp<RootStackParamList, 'TripTracking'>;
type TripTrackingNavigationProp = StackNavigationProp<RootStackParamList, 'TripTracking'>;

type TripStatus = 'idle' | 'searching' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

interface DriverInfo {
  name: string;
  photo?: string;
  rating?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  phone?: string;
}

const TripTrackingScreen = () => {
  const navigation = useNavigation<TripTrackingNavigationProp>();
  const route = useRoute<TripTrackingRouteProp>();
  const dispatch = useAppDispatch();
  const mapRef = useRef<MapView>(null);

  const { tripId } = route.params;
  const { origin, destination } = useAppSelector((state) => state.location);
  const { currentTrip } = useAppSelector((state) => state.trip);

  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<number | undefined>();
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  // Show payment sheet when trip is completed
  useEffect(() => {
    if (currentTrip?.status === 'completed') {
      setShowPaymentSheet(true);
    }
  }, [currentTrip?.status]);

  // Subscribe to trip updates
  useEffect(() => {
    const unsubscribe = subscribeToTrip(tripId, (tripData) => {
      if (tripData) {
        dispatch(
          setCurrentTrip({
            id: tripData.id,
            originAddress: tripData.origin?.address || '',
            destinationAddress: tripData.destination?.address || '',
            vehicleCategory: tripData.vehicleCategory || 'economic',
            estimatedPrice: tripData.estimatedPrice || 0,
            estimatedDuration: tripData.estimatedDuration || 0,
            estimatedDistance: tripData.estimatedDistance || 0,
            status: tripData.status as TripStatus,
            driverId: tripData.driverId,
            driverName: tripData.driverName,
            driverPhoto: tripData.driverPhoto,
            vehiclePlate: tripData.vehiclePlate,
          })
        );

        // Update driver info
        if (tripData.driverId) {
          setDriverInfo({
            name: tripData.driverName || 'Conductor',
            photo: tripData.driverPhoto,
            rating: tripData.driverRating,
            vehiclePlate: tripData.vehiclePlate,
            vehicleModel: tripData.vehicleModel,
            phone: tripData.driverPhone,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [tripId, dispatch]);

  // Subscribe to driver location
  useEffect(() => {
    if (currentTrip?.driverId) {
      const unsubscribe = subscribeToDriverLocation(
        currentTrip.driverId,
        (location) => {
          setDriverLocation(location);
        }
      );

      return () => unsubscribe();
    }
  }, [currentTrip?.driverId]);

  // Calculate route
  useEffect(() => {
    const calculateRoute = async () => {
      if (origin && destination) {
        const directions = await getDirections(origin, destination);
        if (directions?.polyline) {
          const coords = decodePolyline(directions.polyline);
          setRouteCoordinates(coords);
        }
      }
    };

    calculateRoute();
  }, [origin, destination]);

  // Calculate ETA from driver to pickup/destination
  useEffect(() => {
    const calculateETA = async () => {
      if (!driverLocation) return;

      let targetLocation = origin;
      if (currentTrip?.status === 'in_progress') {
        targetLocation = destination;
      }

      if (targetLocation) {
        const directions = await getDirections(driverLocation, targetLocation);
        if (directions) {
          const minutes = Math.round(directions.duration / 60);
          setEstimatedArrival(minutes);
        }
      }
    };

    calculateETA();
  }, [driverLocation, origin, destination, currentTrip?.status]);

  // Fit map to show all markers
  useEffect(() => {
    if (!mapRef.current) return;

    const coordinates: Array<{ latitude: number; longitude: number }> = [];

    if (origin) coordinates.push(origin);
    if (destination) coordinates.push(destination);
    if (driverLocation) coordinates.push(driverLocation);

    if (coordinates.length >= 2) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
  }, [origin, destination, driverLocation]);

  const handleCancelTrip = useCallback(async () => {
    Alert.alert(
      'Cancelar viaje',
      '¿Estás seguro de que deseas cancelar el viaje?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateTripStatusFirestore(tripId, 'cancelled');
              dispatch(updateTripStatus('cancelled'));
              dispatch(clearTrip());
              dispatch(clearLocations());
              navigation.navigate('HomeScreen');
            } catch (error) {
              console.error('Error cancelling trip:', error);
              Alert.alert('Error', 'No se pudo cancelar el viaje');
            }
          },
        },
      ]
    );
  }, [tripId, dispatch, navigation]);

  const handleCompleteTrip = useCallback(() => {
    setShowPaymentSheet(false);
    dispatch(clearTrip());
    dispatch(clearLocations());
    navigation.navigate('HomeScreen');
  }, [dispatch, navigation]);

  const handlePaymentSuccess = useCallback(() => {
    Alert.alert(
      '¡Pago exitoso!',
      'Gracias por tu viaje. ¿Te gustaría calificar al conductor?',
      [
        {
          text: 'Más tarde',
          onPress: handleCompleteTrip,
        },
        {
          text: 'Calificar',
          onPress: () => {
            // TODO: Navigate to rating screen
            handleCompleteTrip();
          },
        },
      ]
    );
  }, [handleCompleteTrip]);

  const handlePaymentError = useCallback((error: string) => {
    Alert.alert(
      'Error en el pago',
      `${error}. ¿Deseas intentar de nuevo?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Reintentar',
          onPress: () => setShowPaymentSheet(true),
        },
      ]
    );
  }, []);

  const handleClosePaymentSheet = useCallback(() => {
    setShowPaymentSheet(false);
  }, []);

  const handleAddPaymentMethod = useCallback(() => {
    setShowPaymentSheet(false);
    navigation.navigate('AddPaymentMethod');
  }, [navigation]);

  const handleGoBack = () => {
    if (currentTrip?.status === 'searching') {
      handleCancelTrip();
    } else {
      navigation.goBack();
    }
  };

  const tripStatus: TripStatus = currentTrip?.status || 'searching';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: origin?.latitude || 4.6097,
          longitude: origin?.longitude || -74.0817,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Origin Marker */}
        {origin && (
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
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destino"
            description={destination.address}
          >
            <View style={styles.destinationMarker}>
              <Text style={styles.destinationMarkerText}>📍</Text>
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.secondary}
            strokeWidth={4}
          />
        )}

        {/* Driver Marker */}
        {driverLocation && currentTrip?.status !== 'searching' && (
          <DriverMarker
            coordinate={driverLocation}
            isAnimated={currentTrip?.status === 'accepted'}
          />
        )}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Status Card */}
      <View style={styles.bottomContainer}>
        <View style={styles.dragHandle} />
        <TripStatusCard
          status={tripStatus}
          driver={driverInfo || undefined}
          estimatedArrival={estimatedArrival}
          onCancel={
            tripStatus === 'searching' || tripStatus === 'accepted'
              ? handleCancelTrip
              : undefined
          }
          onComplete={tripStatus === 'completed' ? handleCompleteTrip : undefined}
        />
      </View>

      {/* Payment Sheet Modal */}
      <PaymentSheet
        visible={showPaymentSheet}
        amount={currentTrip?.estimatedPrice || 0}
        tripId={tripId}
        onClose={handleClosePaymentSheet}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onAddPaymentMethod={handleAddPaymentMethod}
      />
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
  backButton: {
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
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
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
  destinationMarkerText: {
    fontSize: 24,
  },
});

export default TripTrackingScreen;
