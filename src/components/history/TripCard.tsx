import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export interface TripData {
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
  createdAt: any;
  completedAt?: any;
  driverName?: string;
}

interface TripCardProps {
  trip: TripData;
  onPress: (trip: TripData) => void;
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
  
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return date.toLocaleDateString('es-ES', options);
};

const formatPrice = (price: number): string => {
  return `$${price.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const truncateAddress = (address: string, maxLength: number = 30): string => {
  if (address.length <= maxLength) return address;
  return `${address.substring(0, maxLength)}...`;
};

const TripCard: React.FC<TripCardProps> = ({ trip, onPress }) => {
  const statusConfig = STATUS_CONFIG[trip.status] || STATUS_CONFIG.pending;
  const vehicleLabel = VEHICLE_LABELS[trip.vehicleCategory] || 'UberX';
  const price = trip.finalPrice || trip.estimatedPrice;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(trip)}
      activeOpacity={0.7}
    >
      {/* Header with date and status */}
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(trip.createdAt)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Route info */}
      <View style={styles.routeContainer}>
        <View style={styles.routeIndicator}>
          <View style={styles.originDot} />
          <View style={styles.routeLine} />
          <View style={styles.destinationDot} />
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.address} numberOfLines={1}>
            {truncateAddress(trip.origin.address)}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {truncateAddress(trip.destination.address)}
          </Text>
        </View>
      </View>

      {/* Footer with vehicle type and price */}
      <View style={styles.footer}>
        <View style={styles.vehicleContainer}>
          <Text style={styles.vehicleIcon}>🚗</Text>
          <Text style={styles.vehicleLabel}>{vehicleLabel}</Text>
        </View>
        <Text style={styles.price}>{formatPrice(price)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  routeIndicator: {
    width: 20,
    alignItems: 'center',
    marginRight: spacing.sm,
    paddingVertical: 2,
  },
  originDot: {
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
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  addressContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 0,
    height: 44,
  },
  address: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  vehicleLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  price: {
    ...typography.h3,
    color: colors.textPrimary,
  },
});

export default TripCard;
