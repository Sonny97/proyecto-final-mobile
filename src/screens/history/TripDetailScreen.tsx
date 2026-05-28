import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getDirections } from '../../api/googleApis';
import { decodePolyline } from '../../utils/polylineDecoder';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

// Types
type RootStackParamList = {
  TripDetail: { trip: TripData };
};

type TripDetailRouteProp = RouteProp<RootStackParamList, 'TripDetail'>;
type TripDetailNavigationProp = StackNavigationProp<RootStackParamList, 'TripDetail'>;

interface TripData {
  id: string;
  origin: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };
  vehicleCategory: 'economic' | 'xl' | 'premium';
  status: 'completed' | 'cancelled' | 'pending' | 'in_progress';
  estimatedPrice: number;
  finalPrice?: number;
  estimatedDistance?: number;
  estimatedDuration?: number;
  createdAt: any;
  completedAt?: any;
  driverName?: string;
  driverPhoto?: string;
  driverRating?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  paymentMethod?: string;
}

const VEHICLE_LABELS: Record<string, string> = {
  economic: 'UberX',
  xl: 'UberXL',
  premium: 'Black',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  completed: {
    label: 'Completado',
    color: colors.success,
    bgColor: '#E6F4ED',
  },
  cancelled: {
    label: 'Cancelado',
    color: colors.error,
    bgColor: '#FDECEA',
  },
  pending: {
    label: 'Pendiente',
    color: colors.warning,
    bgColor: '#FFF8E6',
  },
  in_progress: {
    label: 'En progreso',
    color: colors.info,
    bgColor: '#E8F0FE',
  },
};

const formatDate = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatPrice = (price: number): string => {
  return `$${price.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatDistance = (meters?: number): string => {
  if (!meters) return '-- km';
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
};

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '-- min';
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
};

const TripDetailScreen = () => {
  const navigation = useNavigation<TripDetailNavigationProp>();
  const route = useRoute<TripDetailRouteProp>();
  const mapRef = useRef<MapView>(null);

  const { trip } = route.params;
  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const statusConfig = STATUS_CONFIG[trip.status] || STATUS_CONFIG.pending;
  const vehicleLabel = VEHICLE_LABELS[trip.vehicleCategory] || 'UberX';
  const price = trip.finalPrice || trip.estimatedPrice;

  // Fetch route for map
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const directions = await getDirections(
          `${trip.origin.latitude},${trip.origin.longitude}`,
          `${trip.destination.latitude},${trip.destination.longitude}`
        );

        if (directions?.routes?.[0]?.overview_polyline?.points) {
          const points = decodePolyline(directions.routes[0].overview_polyline.points);
          setRouteCoordinates(points);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoute();
  }, [trip]);

  // Fit map to route
  useEffect(() => {
    if (routeCoordinates.length > 0 && mapRef.current) {
      const coordinates = [
        trip.origin,
        trip.destination,
        ...routeCoordinates,
      ];
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [routeCoordinates, trip]);

  const handleReportProblem = () => {
    Alert.alert(
      'Reportar problema',
      'Selecciona el tipo de problema',
      [
        { text: 'Cobro incorrecto', onPress: () => console.log('Report: incorrect charge') },
        { text: 'Ruta incorrecta', onPress: () => console.log('Report: incorrect route') },
        { text: 'Problema con conductor', onPress: () => console.log('Report: driver issue') },
        { text: 'Otro', onPress: () => console.log('Report: other') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleGetReceipt = () => {
    Alert.alert(
      'Recibo enviado',
      'El recibo ha sido enviado a tu correo electrónico registrado.'
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Map */}
      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: trip.origin.latitude,
              longitude: trip.origin.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* Origin marker */}
            <Marker
              coordinate={{
                latitude: trip.origin.latitude,
                longitude: trip.origin.longitude,
              }}
              title="Origen"
            >
              <View style={styles.originMarker}>
                <View style={styles.originDot} />
              </View>
            </Marker>

            {/* Destination marker */}
            <Marker
              coordinate={{
                latitude: trip.destination.latitude,
                longitude: trip.destination.longitude,
              }}
              title="Destino"
            >
              <View style={styles.destinationMarker}>
                <View style={styles.destinationSquare} />
              </View>
            </Marker>

            {/* Route polyline */}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor={colors.primary}
              />
            )}
          </MapView>
        )}

        {/* Back button */}
        <SafeAreaView style={styles.headerOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Details */}
      <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.detailsHeader}>
          <View>
            <Text style={styles.dateText}>{formatDate(trip.createdAt)}</Text>
            <Text style={styles.timeText}>{formatTime(trip.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Route info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ruta</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routeIndicator}>
              <View style={styles.originDotSmall} />
              <View style={styles.routeLine} />
              <View style={styles.destinationDotSmall} />
            </View>
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Origen</Text>
              <Text style={styles.addressText}>{trip.origin.address}</Text>
              <View style={styles.addressSpacer} />
              <Text style={styles.addressLabel}>Destino</Text>
              <Text style={styles.addressText}>{trip.destination.address}</Text>
            </View>
          </View>
        </View>

        {/* Trip stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del viaje</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Distancia</Text>
              <Text style={styles.statValue}>{formatDistance(trip.estimatedDistance)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Duración</Text>
              <Text style={styles.statValue}>{formatDuration(trip.estimatedDuration)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Vehículo</Text>
              <Text style={styles.statValue}>{vehicleLabel}</Text>
            </View>
          </View>
        </View>

        {/* Driver info (if available) */}
        {trip.driverName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conductor</Text>
            <View style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>
                  {trip.driverName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{trip.driverName}</Text>
                {trip.driverRating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingIcon}>⭐</Text>
                    <Text style={styles.ratingText}>{trip.driverRating.toFixed(1)}</Text>
                  </View>
                )}
                {trip.vehicleModel && (
                  <Text style={styles.vehicleInfo}>
                    {trip.vehicleModel} • {trip.vehiclePlate}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Payment breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de pago</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tarifa base</Text>
              <Text style={styles.paymentValue}>{formatPrice(2500)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Distancia</Text>
              <Text style={styles.paymentValue}>
                {formatPrice(Math.max(0, price - 2500 - 500))}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tarifa de servicio</Text>
              <Text style={styles.paymentValue}>{formatPrice(500)}</Text>
            </View>
            <View style={styles.paymentDivider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentTotalLabel}>Total</Text>
              <Text style={styles.paymentTotalValue}>{formatPrice(price)}</Text>
            </View>
            {trip.paymentMethod && (
              <View style={styles.paymentMethodRow}>
                <Text style={styles.paymentMethodIcon}>💳</Text>
                <Text style={styles.paymentMethodText}>
                  Pagado con {trip.paymentMethod}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGetReceipt}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📧</Text>
            <Text style={styles.actionText}>Obtener recibo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.reportButton]}
            onPress={handleReportProblem}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>⚠️</Text>
            <Text style={styles.actionText}>Reportar problema</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    height: 220,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.md,
    ...shadows.sm,
  },
  backIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  originMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  destinationMarker: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  destinationSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -16,
    paddingTop: spacing.md,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dateText: {
    ...typography.h3,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  timeText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  routeContainer: {
    flexDirection: 'row',
  },
  routeIndicator: {
    width: 24,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  originDotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  routeLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  destinationDotSmall: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  addressContainer: {
    flex: 1,
  },
  addressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  addressText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  addressSpacer: {
    height: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  driverAvatarText: {
    ...typography.h3,
    color: colors.textWhite,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  vehicleInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  paymentCard: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  paymentLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  paymentValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  paymentTotalLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  paymentTotalValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentMethodIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  paymentMethodText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  reportButton: {
    backgroundColor: '#FDECEA',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  actionText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

export default TripDetailScreen;
