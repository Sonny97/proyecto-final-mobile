import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppRedux';
import { setCurrentTrip, setTripLoading, setTripError } from '../../redux/slices/tripSlice';
import { createTrip } from '../../services/firebase/firestore';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface ConfirmTripButtonProps {
  onTripConfirmed?: (tripId: string) => void;
  disabled?: boolean;
}

const ConfirmTripButton: React.FC<ConfirmTripButtonProps> = ({
  onTripConfirmed,
  disabled = false,
}) => {
  const dispatch = useAppDispatch();
  const { origin, destination } = useAppSelector((state) => state.location);
  const { selectedCategory, estimatedPrice, estimatedDuration, estimatedDistance, isLoading } =
    useAppSelector((state) => state.trip);
  const user = useAppSelector((state) => state.auth.user);

  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmTrip = async () => {
    if (!origin || !destination || !user) {
      return;
    }

    setIsConfirming(true);
    dispatch(setTripLoading(true));

    try {
      const tripData = {
        userId: user.uid,
        origin: {
          latitude: origin.latitude,
          longitude: origin.longitude,
          address: origin.address,
        },
        destination: {
          latitude: destination.latitude,
          longitude: destination.longitude,
          address: destination.address,
        },
        vehicleCategory: selectedCategory,
        estimatedPrice,
        estimatedDuration,
        estimatedDistance,
        status: 'searching',
      };

      const tripId = await createTrip(tripData);

      dispatch(
        setCurrentTrip({
          id: tripId,
          originAddress: origin.address || '',
          destinationAddress: destination.address || '',
          vehicleCategory: selectedCategory,
          estimatedPrice,
          estimatedDuration,
          estimatedDistance,
          status: 'searching',
        })
      );

      onTripConfirmed?.(tripId);
    } catch (error) {
      console.error('Error creating trip:', error);
      dispatch(setTripError('No se pudo crear el viaje. Intenta de nuevo.'));
    } finally {
      setIsConfirming(false);
      dispatch(setTripLoading(false));
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isDisabled = disabled || isConfirming || isLoading || !origin || !destination;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={handleConfirmTrip}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {isConfirming || isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.textWhite} />
          <Text style={styles.loadingText}>Buscando conductor...</Text>
        </View>
      ) : (
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>Confirmar viaje</Text>
          {estimatedPrice > 0 && (
            <Text style={styles.priceText}>{formatPrice(estimatedPrice)}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonDisabled: {
    backgroundColor: colors.textLight,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  priceText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.button,
    color: colors.textWhite,
    marginLeft: spacing.sm,
  },
});

export default ConfirmTripButton;
