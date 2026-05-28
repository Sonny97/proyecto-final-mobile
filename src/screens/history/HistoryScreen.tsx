import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { getUserTrips } from '../../services/firebase/firestore';
import TripCard, { TripData } from '../../components/history/TripCard';
import { colors, spacing, typography } from '../../theme';

type RootStackParamList = {
  TripDetail: { trip: TripData };
};

type HistoryNavigationProp = StackNavigationProp<RootStackParamList>;

const HistoryScreen = () => {
  const navigation = useNavigation<HistoryNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [trips, setTrips] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTrips = useCallback(async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    try {
      const userTrips = await getUserTrips(user.uid);
      setTrips(userTrips as TripData[]);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTrips();
  }, [fetchTrips]);

  const handleTripPress = useCallback(
    (trip: TripData) => {
      navigation.navigate('TripDetail', { trip });
    },
    [navigation]
  );

  const renderTrip = useCallback(
    ({ item }: { item: TripData }) => (
      <TripCard trip={item} onPress={handleTripPress} />
    ),
    [handleTripPress]
  );

  const keyExtractor = useCallback((item: TripData) => item.id, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🚗</Text>
      <Text style={styles.emptyTitle}>No hay viajes</Text>
      <Text style={styles.emptySubtitle}>
        Tus viajes completados aparecerán aquí
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Historial de viajes</Text>
      <Text style={styles.headerSubtitle}>
        {trips.length} {trips.length === 1 ? 'viaje' : 'viajes'}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          trips.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  emptyListContent: {
    flex: 1,
  },
  separator: {
    height: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HistoryScreen;
