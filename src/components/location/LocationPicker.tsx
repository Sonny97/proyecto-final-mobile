import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LocationSearchInput from '../search/LocationSearchInput';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { setOrigin, setDestination, clearLocations } from '../../redux/slices/locationSlice';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

interface SelectedPlace {
  latitude: number;
  longitude: number;
  address: string;
  name: string;
}

interface LocationPickerProps {
  onOriginSet?: (place: SelectedPlace) => void;
  onDestinationSet?: (place: SelectedPlace) => void;
  onRequestTrip?: () => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onOriginSet,
  onDestinationSet,
  onRequestTrip,
}) => {
  const dispatch = useAppDispatch();
  const { origin, destination, currentLocation } = useAppSelector((state) => state.location);
  const [showDestinationInput, setShowDestinationInput] = useState(false);

  const handleOriginSelected = (place: SelectedPlace) => {
    dispatch(
      setOrigin({
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
      })
    );
    setShowDestinationInput(true);
    onOriginSet?.(place);
  };

  const handleDestinationSelected = (place: SelectedPlace) => {
    dispatch(
      setDestination({
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
      })
    );
    onDestinationSet?.(place);
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      dispatch(
        setOrigin({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: 'Mi ubicación actual',
        })
      );
      setShowDestinationInput(true);
    }
  };

  const handleClearLocations = () => {
    dispatch(clearLocations());
    setShowDestinationInput(false);
  };

  const canRequestTrip = origin && destination;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Origin Input */}
        <View style={styles.inputRow}>
          <View style={styles.dotContainer}>
            <View style={styles.originDot} />
            {showDestinationInput && <View style={styles.dotLine} />}
          </View>
          <View style={styles.inputWrapper}>
            {origin ? (
              <TouchableOpacity style={styles.selectedLocation} onPress={handleClearLocations}>
                <Text style={styles.selectedLocationText} numberOfLines={1}>
                  {origin.address}
                </Text>
                <Text style={styles.changeText}>Cambiar</Text>
              </TouchableOpacity>
            ) : (
              <>
                <LocationSearchInput
                  placeholder="¿Dónde te recogemos?"
                  onPlaceSelected={handleOriginSelected}
                  icon={null}
                />
                {currentLocation && (
                  <TouchableOpacity
                    style={styles.currentLocationButton}
                    onPress={handleUseCurrentLocation}
                  >
                    <Text style={styles.currentLocationIcon}>📍</Text>
                    <Text style={styles.currentLocationText}>Usar mi ubicación actual</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {/* Destination Input */}
        {showDestinationInput && (
          <View style={styles.inputRow}>
            <View style={styles.dotContainer}>
              <View style={styles.destinationDot} />
            </View>
            <View style={styles.inputWrapper}>
              {destination ? (
                <TouchableOpacity
                  style={styles.selectedLocation}
                  onPress={() => dispatch(setDestination(null))}
                >
                  <Text style={styles.selectedLocationText} numberOfLines={1}>
                    {destination.address}
                  </Text>
                  <Text style={styles.changeText}>Cambiar</Text>
                </TouchableOpacity>
              ) : (
                <LocationSearchInput
                  placeholder="¿A dónde vas?"
                  onPlaceSelected={handleDestinationSelected}
                  autoFocus={!!origin}
                  icon={null}
                />
              )}
            </View>
          </View>
        )}

        {/* Request Trip Button */}
        {canRequestTrip && (
          <TouchableOpacity
            style={styles.requestButton}
            onPress={onRequestTrip}
            activeOpacity={0.8}
          >
            <Text style={styles.requestButtonText}>Buscar vehículo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Favorite Places (Optional) */}
      {!origin && (
        <View style={styles.favoritesContainer}>
          <Text style={styles.favoritesTitle}>Lugares frecuentes</Text>
          <TouchableOpacity style={styles.favoriteItem}>
            <View style={styles.favoriteIcon}>
              <Text>🏠</Text>
            </View>
            <View style={styles.favoriteTextContainer}>
              <Text style={styles.favoriteMainText}>Casa</Text>
              <Text style={styles.favoriteSecondaryText}>Agregar dirección</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteItem}>
            <View style={styles.favoriteIcon}>
              <Text>💼</Text>
            </View>
            <View style={styles.favoriteTextContainer}>
              <Text style={styles.favoriteMainText}>Trabajo</Text>
              <Text style={styles.favoriteSecondaryText}>Agregar dirección</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  dotContainer: {
    width: 24,
    alignItems: 'center',
    paddingTop: spacing.md,
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
  dotLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },
  inputWrapper: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  selectedLocation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  selectedLocationText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  changeText: {
    ...typography.bodySmall,
    color: colors.secondary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.xs,
  },
  currentLocationIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  currentLocationText: {
    ...typography.bodySmall,
    color: colors.secondary,
    fontWeight: '500',
  },
  requestButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  requestButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  favoritesContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadows.md,
  },
  favoritesTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  favoriteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  favoriteTextContainer: {
    flex: 1,
  },
  favoriteMainText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  favoriteSecondaryText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default LocationPicker;
