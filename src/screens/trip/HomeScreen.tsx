import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapViewContainer, LocationPicker } from '../../components';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const handleRequestTrip = useCallback(() => {
    // Navigate to TripRequestScreen when implemented
    // navigation.navigate('TripRequest');
    console.log('Navigate to trip request screen');
  }, [navigation]);

  const toggleSearchPanel = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Full Screen Map */}
      <MapViewContainer
        showOriginMarker={true}
        showDestinationMarker={true}
        onMapReady={handleMapReady}
      />

      {/* Top Safe Area with Menu Button */}
      <SafeAreaView style={styles.topOverlay}>
        <TouchableOpacity style={styles.menuButton} activeOpacity={0.8}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Search Panel */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bottomOverlay}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <SafeAreaView style={styles.bottomSafeArea}>
          {/* Drag Handle */}
          <TouchableOpacity
            style={styles.dragHandleContainer}
            onPress={toggleSearchPanel}
            activeOpacity={0.8}
          >
            <View style={styles.dragHandle} />
          </TouchableOpacity>

          {/* Location Picker */}
          {isSearchExpanded && (
            <View style={styles.searchContainer}>
              <LocationPicker onRequestTrip={handleRequestTrip} />
            </View>
          )}

          {/* Collapsed State - Quick Search */}
          {!isSearchExpanded && (
            <TouchableOpacity
              style={styles.collapsedSearch}
              onPress={toggleSearchPanel}
              activeOpacity={0.8}
            >
              <View style={styles.searchIcon}>
                <Text style={styles.searchIconText}>🔍</Text>
              </View>
              <Text style={styles.collapsedSearchText}>¿A dónde vas?</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* My Location Button */}
      <TouchableOpacity style={styles.myLocationButton} activeOpacity={0.8}>
        <Text style={styles.myLocationIcon}>📍</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  menuButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.background,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
    marginTop: spacing.md,
    ...shadows.md,
  },
  menuIcon: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  bottomSafeArea: {
    paddingBottom: Platform.OS === 'android' ? spacing.md : 0,
  },
  dragHandleContainer: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  collapsedSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  searchIconText: {
    fontSize: 18,
  },
  collapsedSearchText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  myLocationButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: 280,
    width: 48,
    height: 48,
    backgroundColor: colors.background,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  myLocationIcon: {
    fontSize: 20,
  },
});

export default HomeScreen;
