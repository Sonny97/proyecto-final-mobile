import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

type TripStatus = 'idle' | 'searching' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

interface DriverInfo {
  name: string;
  photo?: string;
  rating?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  phone?: string;
}

interface TripStatusCardProps {
  status: TripStatus;
  driver?: DriverInfo;
  estimatedArrival?: number; // minutes
  onCancel?: () => void;
  onComplete?: () => void;
}

const TripStatusCard: React.FC<TripStatusCardProps> = ({
  status,
  driver,
  estimatedArrival,
  onCancel,
  onComplete,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'searching') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status, pulseAnim]);

  const getStatusConfig = () => {
    switch (status) {
      case 'searching':
        return {
          title: 'Buscando conductor',
          subtitle: 'Esto puede tomar unos segundos...',
          icon: '🔍',
          color: colors.secondary,
        };
      case 'accepted':
        return {
          title: 'Conductor en camino',
          subtitle: estimatedArrival
            ? `Llega en ${estimatedArrival} min`
            : 'En camino a recogerte',
          icon: '🚗',
          color: colors.accent,
        };
      case 'in_progress':
        return {
          title: 'En viaje',
          subtitle: estimatedArrival
            ? `${estimatedArrival} min restantes`
            : 'Rumbo a tu destino',
          icon: '🛣️',
          color: colors.secondary,
        };
      case 'completed':
        return {
          title: '¡Llegaste!',
          subtitle: 'Gracias por viajar con nosotros',
          icon: '✅',
          color: colors.success,
        };
      case 'cancelled':
        return {
          title: 'Viaje cancelado',
          subtitle: 'El viaje ha sido cancelado',
          icon: '❌',
          color: colors.error,
        };
      default:
        return {
          title: 'Preparando viaje',
          subtitle: '',
          icon: '⏳',
          color: colors.textSecondary,
        };
    }
  };

  const config = getStatusConfig();

  const handleCallDriver = () => {
    if (driver?.phone) {
      Linking.openURL(`tel:${driver.phone}`);
    }
  };

  const renderSearching = () => (
    <View style={styles.searchingContainer}>
      <View style={styles.searchingIconContainer}>
        <Animated.View
          style={[
            styles.searchingPulse,
            {
              opacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0],
              }),
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                },
              ],
            },
          ]}
        />
        <Text style={styles.statusIcon}>{config.icon}</Text>
      </View>
      <Text style={styles.statusTitle}>{config.title}</Text>
      <Text style={styles.statusSubtitle}>{config.subtitle}</Text>
      
      {onCancel && (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancelar búsqueda</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDriverInfo = () => (
    <View style={styles.driverContainer}>
      {/* Status Header */}
      <View style={[styles.statusHeader, { backgroundColor: config.color + '15' }]}>
        <Text style={styles.statusIcon}>{config.icon}</Text>
        <View style={styles.statusTextContainer}>
          <Text style={[styles.statusTitle, { color: config.color }]}>{config.title}</Text>
          <Text style={styles.statusSubtitle}>{config.subtitle}</Text>
        </View>
      </View>

      {/* Driver Info */}
      {driver && (
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}>
            {driver.photo ? (
              <Image source={{ uri: driver.photo }} style={styles.driverPhoto} />
            ) : (
              <Text style={styles.driverAvatarText}>
                {driver.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{driver.name}</Text>
            {driver.rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingStar}>⭐</Text>
                <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={styles.vehiclePlate}>{driver.vehiclePlate}</Text>
            {driver.vehicleModel && (
              <Text style={styles.vehicleModel}>{driver.vehicleModel}</Text>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {driver?.phone && (status === 'accepted' || status === 'in_progress') && (
          <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
            <Text style={styles.callButtonIcon}>📞</Text>
            <Text style={styles.callButtonText}>Llamar</Text>
          </TouchableOpacity>
        )}

        {status === 'accepted' && onCancel && (
          <TouchableOpacity style={styles.cancelButtonSmall} onPress={onCancel}>
            <Text style={styles.cancelButtonSmallText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        {status === 'completed' && onComplete && (
          <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
            <Text style={styles.completeButtonText}>Calificar viaje</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {status === 'searching' ? renderSearching() : renderDriverInfo()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  searchingIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  searchingPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
  },
  statusIcon: {
    fontSize: 36,
  },
  statusTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statusSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '500',
  },
  driverContainer: {
    paddingBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  statusTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  driverPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  driverAvatarText: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  ratingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  vehicleInfo: {
    alignItems: 'flex-end',
  },
  vehiclePlate: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  vehicleModel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
  },
  callButtonIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  callButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  cancelButtonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.round,
  },
  cancelButtonSmallText: {
    ...typography.button,
    color: colors.error,
  },
  completeButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  completeButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
});

export default TripStatusCard;
