import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  RefreshControl,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// Configuration des types de notifications
const NOTIFICATION_CONFIG = {
  birthday: { icon: 'gift', color: '#f56565' },
  event: { icon: 'calendar', color: '#48bb78' },
  invitation: { icon: 'mail', color: '#667eea' },
  photo: { icon: 'camera', color: '#ed8936' },
  friend: { icon: 'person-add', color: '#9f7aea' },
  reminder: { icon: 'notifications', color: '#f59e0b' },
  default: { icon: 'information-circle', color: '#64748b' }
};

// Données de notifications
const initialNotifications = [
  {
    id: '1',
    type: 'birthday',
    title: "Anniversaire aujourd'hui",
    message: "C'est l'anniversaire de Pierre Martin aujourd'hui ! Souhaitez-lui un joyeux anniversaire 🎉",
    time: "Il y a 2 heures",
    read: false,
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    user: {
      name: "Pierre Martin",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      age: 28
    }
  },
  {
    id: '2',
    type: 'event',
    title: "Nouvel événement créé",
    message: "Marie a créé un nouvel événement 'Fête d'anniversaire Julie' pour le 28 Juin",
    time: "Il y a 5 heures",
    read: false,
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    event: {
      title: "Fête d'anniversaire Julie",
      date: "28 Juin à 19h00",
      location: "Chez Marie"
    }
  },
  {
    id: '3',
    type: 'invitation',
    title: "Invitation à un événement",
    message: "Sophie vous a invité à la soirée cinéma ce weekend",
    time: "Hier",
    read: true,
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    event: {
      title: "Soirée cinéma",
      date: "30 Juin à 20h30",
      location: "Cinéma Paradis"
    }
  },
  {
    id: '4',
    type: 'photo',
    title: "Nouvelles photos partagées",
    message: "Marie a partagé 12 nouvelles photos de l'événement 'Anniversaire Tom'",
    time: "Hier",
    read: true,
    timestamp: Date.now() - 26 * 60 * 60 * 1000,
    user: {
      name: "Marie Dubois",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
    },
    photos: 12
  },
  {
    id: '5',
    type: 'friend',
    title: "Nouvelle demande d'ami",
    message: "Julie Bernard veut vous ajouter comme ami. Vous avez 5 amis en commun",
    time: "2 jours",
    read: true,
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    user: {
      name: "Julie Bernard",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face",
      mutualFriends: 5
    }
  },
  {
    id: '6',
    type: 'reminder',
    title: "Rappel d'anniversaire",
    message: "L'anniversaire de Sophie Laurent est dans 9 jours (2 Juillet). Pensez à préparer un cadeau !",
    time: "3 jours",
    read: true,
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    user: {
      name: "Sophie Laurent",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      daysLeft: 9,
      age: 22
    }
  }
];

const TABS = [
  { id: 'all', label: 'Toutes', icon: null },
  { id: 'unread', label: 'Non lues', icon: null },
  { id: 'birthday', label: 'Anniversaires', icon: 'gift' },
  { id: 'event', label: 'Événements', icon: 'calendar' },
  { id: 'invitation', label: 'Invitations', icon: 'mail' },
];

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Mémorisation des notifications filtrées
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return !notification.read;
      return notification.type === activeTab;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, activeTab]);

  // Compteurs pour les badges
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulation d'une nouvelle notification
    setTimeout(() => {
      const newNotification = {
        id: Date.now().toString(),
        type: 'event',
        title: "Nouvelle notification",
        message: "Une nouvelle notification a été ajoutée",
        time: "Maintenant",
        read: false,
        timestamp: Date.now()
      };
      setNotifications(prev => [newNotification, ...prev]);
      setRefreshing(false);
    }, 1500);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    if (unreadCount === 0) {
      Alert.alert("Information", "Toutes les notifications sont déjà lues");
      return;
    }
    
    Alert.alert(
      "Confirmer",
      `Marquer ${unreadCount} notification${unreadCount > 1 ? 's' : ''} comme lue${unreadCount > 1 ? 's' : ''} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () => {
            setNotifications(prev => 
              prev.map(notification => ({ ...notification, read: true }))
            );
          }
        }
      ]
    );
  }, [unreadCount]);

  const deleteNotification = useCallback((id) => {
    Alert.alert(
      "Supprimer",
      "Voulez-vous supprimer cette notification ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            setNotifications(prev => prev.filter(n => n.id !== id));
          }
        }
      ]
    );
  }, []);

  const handleNotificationAction = useCallback((type, action, notificationId) => {
    switch (type) {
      case 'birthday':
        if (action === 'message') {
          Alert.alert("Message", "Ouverture de la messagerie...");
        } else if (action === 'post') {
          Alert.alert("Publication", "Ouverture du mur...");
        }
        break;
      case 'invitation':
      case 'friend':
        if (action === 'accept') {
          Alert.alert("Accepté", "Invitation acceptée !");
          deleteNotification(notificationId);
        } else if (action === 'decline') {
          Alert.alert("Refusé", "Invitation refusée");
          deleteNotification(notificationId);
        }
        break;
    }
  }, [deleteNotification]);

  const getNotificationConfig = (type) => {
    return NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.default;
  };

  const renderTabItem = ({ item }) => {
    const isActive = activeTab === item.id;
    const config = item.id !== 'all' && item.id !== 'unread' ? 
      getNotificationConfig(item.id) : null;
    
    let badgeCount = 0;
    if (item.id === 'unread') {
      badgeCount = unreadCount;
    } else if (item.id !== 'all') {
      badgeCount = notifications.filter(n => !n.read && n.type === item.id).length;
    }

    return (
      <TouchableOpacity
        style={[styles.tabItem, isActive && styles.activeTab]}
        onPress={() => setActiveTab(item.id)}
      >
        {item.icon && (
          <Ionicons 
            name={item.icon} 
            size={16} 
            color={isActive ? config?.color || '#667eea' : '#64748b'} 
          />
        )}
        <Text style={[
          styles.tabText,
          isActive && styles.activeTabText,
          item.icon && { marginLeft: 5 }
        ]}>
          {item.label}
        </Text>
        {badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderActionButtons = (item) => {
    switch (item.type) {
      case 'birthday':
        return (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => handleNotificationAction('birthday', 'message', item.id)}
            >
              <Text style={styles.secondaryButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => handleNotificationAction('birthday', 'post', item.id)}
            >
              <Text style={styles.primaryButtonText}>Poster</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'invitation':
      case 'friend':
        return (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => handleNotificationAction(item.type, 'accept', item.id)}
            >
              <Text style={styles.acceptButtonText}>Accepter</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={() => handleNotificationAction(item.type, 'decline', item.id)}
            >
              <Text style={styles.declineButtonText}>
                {item.type === 'friend' ? 'Ignorer' : 'Décliner'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  const renderNotificationItem = ({ item }) => {
    const config = getNotificationConfig(item.type);
    
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification,
        ]}
        onPress={() => markAsRead(item.id)}
        onLongPress={() => deleteNotification(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationIconContainer}>
          <View style={[
            styles.notificationIcon,
            { backgroundColor: config.color }
          ]}>
            <Ionicons 
              name={config.icon} 
              size={20} 
              color="white" 
            />
          </View>
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={3}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
          
          {renderActionButtons(item)}
        </View>
        
        {!item.read && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.markAllButton}
          onPress={markAllAsRead}
        >
          <Ionicons name="checkmark-done" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={TABS}
          renderItem={renderTabItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        />
      </View>
      
      {/* Notifications List */}
      <View style={styles.listContainer}>
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredNotifications.length === 0 && styles.emptyListContent
          ]}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#667eea']}
              tintColor="#667eea"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off" size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'unread' 
                  ? "Toutes vos notifications ont été lues"
                  : "Vous n'avez aucune notification pour le moment"
                }
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10, // Assure que le header reste au-dessus
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  headerBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    padding: 8,
    borderRadius: 8,
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 12,
    zIndex: 9, // Juste en dessous du header
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#e0e7ff',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    marginTop: 8, // Ajout d'une marge en haut pour séparer du header
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 20, // Ajout de padding en bas pour éviter que le contenu ne soit coupé
  },
  emptyListContent: {
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    elevation: 2,
    shadowOpacity: 0.15,
  },
  notificationIconContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  primaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#667eea',
  },
  primaryButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  acceptButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#48bb78',
  },
  acceptButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  declineButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  declineButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;