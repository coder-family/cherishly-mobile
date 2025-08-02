import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InvitationStatsProps {
  totalInvitations: number;
  pendingInvitations: number;
  acceptedInvitations: number;
  expiredInvitations: number;
}

export default function InvitationStats({
  totalInvitations,
  pendingInvitations,
  acceptedInvitations,
  expiredInvitations,
}: InvitationStatsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'accepted':
        return '#10b981';
      case 'expired':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'accepted':
        return 'check-circle';
      case 'expired':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const stats = [
    {
      label: 'Total',
      value: totalInvitations,
      status: 'total',
      icon: 'email',
    },
    {
      label: 'Pending',
      value: pendingInvitations,
      status: 'pending',
      icon: 'schedule',
    },
    {
      label: 'Accepted',
      value: acceptedInvitations,
      status: 'accepted',
      icon: 'check-circle',
    },
    {
      label: 'Expired',
      value: expiredInvitations,
      status: 'expired',
      icon: 'cancel',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invitation Statistics</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialIcons
                name={stat.icon as any}
                size={20}
                color={getStatusColor(stat.status)}
              />
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
            <Text style={[styles.statValue, { color: getStatusColor(stat.status) }]}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 