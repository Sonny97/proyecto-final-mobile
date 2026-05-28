import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { fetchPlaceSuggestions, getPlaceDetails } from '../../api/googleApis';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface SelectedPlace {
  latitude: number;
  longitude: number;
  address: string;
  name: string;
}

interface LocationSearchInputProps {
  placeholder?: string;
  onPlaceSelected: (place: SelectedPlace) => void;
  value?: string;
  icon?: React.ReactNode;
  autoFocus?: boolean;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  placeholder = 'Buscar ubicación',
  onPlaceSelected,
  value = '',
  icon,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPlaces = useCallback(async (text: string) => {
    if (text.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await fetchPlaceSuggestions(text);
      setPredictions(results);
    } catch (error) {
      console.error('Error searching places:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTextChange = (text: string) => {
    setQuery(text);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchPlaces(text);
    }, 300);
  };

  const handlePlaceSelect = async (prediction: PlacePrediction) => {
    Keyboard.dismiss();
    setQuery(prediction.description);
    setPredictions([]);
    setIsLoading(true);

    try {
      const details = await getPlaceDetails(prediction.place_id);
      if (details) {
        onPlaceSelected({
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          address: details.formatted_address,
          name: details.name,
        });
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay blur to allow selection
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  const clearInput = () => {
    setQuery('');
    setPredictions([]);
  };

  const renderPredictionItem = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity
      style={styles.predictionItem}
      onPress={() => handlePlaceSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.predictionIcon}>
        <Text style={styles.predictionIconText}>📍</Text>
      </View>
      <View style={styles.predictionTextContainer}>
        <Text style={styles.predictionMainText} numberOfLines={1}>
          {item.structured_formatting.main_text}
        </Text>
        <Text style={styles.predictionSecondaryText} numberOfLines={1}>
          {item.structured_formatting.secondary_text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={query}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          returnKeyType="search"
        />
        {isLoading && (
          <ActivityIndicator size="small" color={colors.textSecondary} style={styles.loader} />
        )}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {predictions.length > 0 && isFocused && (
        <View style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={renderPredictionItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  inputContainerFocused: {
    borderColor: colors.secondary,
    backgroundColor: colors.background,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  loader: {
    marginLeft: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  clearButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  predictionsContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    maxHeight: 240,
    ...shadows.md,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  predictionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  predictionIconText: {
    fontSize: 14,
  },
  predictionTextContainer: {
    flex: 1,
  },
  predictionMainText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  predictionSecondaryText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default LocationSearchInput;
