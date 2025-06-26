import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Animated,
  RefreshControl,
  BackHandler,
  ToastAndroid,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Données d'exemple pour les prochains anniversaires
const upcomingBirthdays = [
  {
    id: '1',
    name: 'Marie Dubois',
    date: '25 Juin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    daysLeft: 2,
    age: 25,
    isToday: false
  },
  {
    id: '2',
    name: 'Pierre Martin',
    date: 'Aujourd\'hui',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    daysLeft: 0,
    age: 28,
    isToday: true
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    date: '2 Juillet',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    daysLeft: 9,
    age: 22,
    isToday: false
  }
];

// Événements à venir
const upcomingEvents = [
  {
    id: '1',
    title: 'Fête d\'anniversaire Julie',
    date: '28 Juin',
    time: '19h00',
    location: 'Chez Marie',
    attendees: 12,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=150&h=100&fit=crop',
    type: 'birthday'
  },
  {
    id: '2',
    title: 'Soirée barbecue amis',
    date: '30 Juin',
    time: '18h30',
    location: 'Parc central',
    attendees: 8,
    image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=150&h=100&fit=crop',
    type: 'social'
  }
];

// Activités récentes
const recentActivities = [
  {
    id: '1',
    user: 'Marie',
    action: 'a partagé des photos',
    event: 'Anniversaire Tom',
    time: '2h',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    type: 'photo'
  },
  {
    id: '2',
    user: 'Pierre',
    action: 'a créé un événement',
    event: 'Barbecue weekend',
    time: '5h',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    type: 'event'
  },
  {
    id: '3',
    user: 'Sophie',
    action: 'vous a invité à',
    event: 'Soirée cinéma',
    time: '1j',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    type: 'invitation'
  }
];

// Suggestions d'amis
const friendSuggestions = [
  {
    id: '1',
    name: 'Julie Bernard',
    mutualFriends: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face',
    connectionType: 'Amis en commun'
  },
  {
    id: '2',
    name: 'Thomas Petit',
    mutualFriends: 3,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    connectionType: 'Contacts téléphone'
  }
];

// Menu principal avec icônes
const mainMenuItems = [
  {
    id: 'social',
    title: 'Social',
    icon: 'people',
    color: '#48bb78',
    route: '/screens/social/home',
    type: 'Ionicons'
  },
  {
    id: 'events',
    title: 'Événements',
    icon: 'calendar',
    color: '#ed8936',
    route: '/screens/events/eventsList',
    type: 'Ionicons'
  },
  {
    id: 'messages',
    title: 'Messages',
    icon: 'chatbubble',
    color: '#48bb78',
    route: '/screens/messages/inbox',
    type: 'Ionicons'
  },
  {
    id: 'calendar',
    title: 'Calendrier',
    icon: 'calendar-outline',
    color: '#9f7aea',
    route: '/screens/calendar/calendar',
    type: 'Ionicons'
  },
  {
    id: 'memories',
    title: 'Souvenirs',
    icon: 'images',
    color: '#38b2ac',
    route: '/screens/memories/gallery',
    type: 'Ionicons'
  },
  {
    id: 'wishlist',
    title: 'Wishlist',
    icon: 'gift',
    color: '#f56565',
    route: '/screens/ecommerce/wishlist',
    type: 'Ionicons'
  },
  {
    id: 'profile',
    title: 'Profil',
    icon: 'person',
    color: '#667eea',
    route: '/screens/profile/profile',
    type: 'Ionicons'
  },
  {
    id: 'settings',
    title: 'Paramètres',
    icon: 'settings',
    color: '#64748b',
    route: '/screens/profile/settings',
    type: 'Ionicons'
  }
];

// Actions rapides
const quickActions = [
  {
    id: 'create-event',
    title: 'Créer événement',
    icon: 'add-circle',
    color: '#667eea',
    route: '/screens/events/createevent',
    type: 'Ionicons'
  },
  {
    id: 'invite',
    title: 'Inviter amis',
    icon: 'person-add',
    color: '#48bb78',
    route: '/screens/social/friends',
    type: 'Ionicons'
  },
  {
    id: 'memories',
    title: 'Ajouter photo',
    icon: 'camera',
    color: '#ed8936',
    route: '/screens/memories/stories',
    type: 'Ionicons'
  },
  {
    id: 'wishlist',
    title: 'Ma wishlist',
    icon: 'gift',
    color: '#f56565',
    route: '/screens/ecommerce/wishlist',
    type: 'Ionicons'
  }
];

const HomeScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [notificationCount] = useState(5);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // États pour la gestion du bouton retour
  const [backPressCount, setBackPressCount] = useState(0);
  const backPressTimer = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Mettre à jour l'heure toutes les minutes
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Gestion du bouton retour
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true; // Empêche le comportement par défaut
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
    };
  }, [backPressCount]);

  const handleBackPress = () => {
    if (backPressCount === 0) {
      // Premier appui : ne rien faire, juste rester sur l'écran
      setBackPressCount(1);
      
      // Réinitialiser le compteur après 2 secondes
      backPressTimer.current = setTimeout(() => {
        setBackPressCount(0);
      }, 2000);

    } else if (backPressCount === 1) {
      // Deuxième appui : afficher le message d'avertissement
      setBackPressCount(2);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Appuyez encore une fois pour quitter l\'application', ToastAndroid.SHORT);
      }
      
      // Réinitialiser le compteur après 2 secondes
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
      backPressTimer.current = setTimeout(() => {
        setBackPressCount(0);
      }, 2000);

    } else if (backPressCount === 2) {
      // Troisième appui : quitter l'application
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
      BackHandler.exitApp();
    }
  };

  const user = {
    name: 'Alex',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
    level: 'Organisateur Expert',
    points: 1250
  };

  const handleMenuPress = (route) => {
    // Réinitialiser le compteur de retour quand on navigue vers un autre écran
    setBackPressCount(0);
    if (backPressTimer.current) {
      clearTimeout(backPressTimer.current);
    }
    router.push(route);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simuler le rechargement des données
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={() => handleMenuPress('/screens/profile/profile')}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
            <View style={styles.statusIndicator} />
          </View>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user.name} 👋</Text>
          <View style={styles.userLevel}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.userLevelText}>{user.level}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => handleMenuPress('/screens/social/search')}
        >
          <Ionicons name="search" size={24} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => handleMenuPress('/screens/social/notifications')}
        >
          <Ionicons name="notifications" size={24} color="#667eea" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHorizontalMainMenu = () => (
    <View style={styles.horizontalMenuContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalMenuScroll}
      >
        {mainMenuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.horizontalMenuItem}
            onPress={() => handleMenuPress(item.route)}
          >
            <View style={[styles.horizontalMenuIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color="white" />
            </View>
            <Text style={styles.horizontalMenuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTodayHighlight = () => {
    const todaysBirthdays = upcomingBirthdays.filter(b => b.isToday);
    const todaysEvents = upcomingEvents.filter(e => e.date === 'Aujourd\'hui');
    
    if (todaysBirthdays.length === 0 && todaysEvents.length === 0) {
      return null;
    }

    return (
      <Animated.View style={[styles.todayHighlight, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.todayGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.todayContent}>
            <Text style={styles.todayTitle}>🎉 Aujourd'hui</Text>
            {todaysBirthdays.map(birthday => (
              <Text key={birthday.id} style={styles.todayItem}>
                🎂 Anniversaire de {birthday.name} ({birthday.age} ans)
              </Text>
            ))}
            {todaysEvents.map(event => (
              <Text key={event.id} style={styles.todayItem}>
                📅 {event.title} à {event.time}
              </Text>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.todayButton}
            onPress={() => handleMenuPress('/screens/calendar/CalendarScreen')}
          >
            <AntDesign name="right" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionItem}
            onPress={() => handleMenuPress(action.route)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={20} color="white" />
            </View>
            <Text style={styles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUpcomingBirthdays = () => (
    <View style={styles.birthdaysContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🎂 Prochains anniversaires</Text>
        <TouchableOpacity onPress={() => handleMenuPress('/screens/calendar/birthdays')}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={upcomingBirthdays}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.birthdayCard,
              item.isToday && styles.birthdayCardToday
            ]}
            onPress={() => handleMenuPress(`/screens/profile/ProfileScreen?userId=${item.id}`)}
          >
            <View style={styles.birthdayImageContainer}>
              <Image source={{ uri: item.avatar }} style={styles.birthdayImage} />
              {item.isToday ? (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>🎉</Text>
                </View>
              ) : (
                <View style={styles.daysLeftBadge}>
                  <Text style={styles.daysLeftText}>{item.daysLeft}j</Text>
                </View>
              )}
            </View>
            <Text style={styles.birthdayName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.birthdayAge}>{item.age} ans</Text>
            <Text style={styles.birthdayDate}>{item.date}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.birthdaysList}
      />
    </View>
  );

  const renderUpcomingEvents = () => (
    <View style={styles.eventsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📅 Événements à venir</Text>
        <TouchableOpacity onPress={() => handleMenuPress('/screens/events/EventsListScreen')}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      
      {upcomingEvents.map((event) => (
        <TouchableOpacity 
          key={event.id}
          style={styles.eventCard}
          onPress={() => handleMenuPress(`/screens/events/EventDetailsScreen?eventId=${event.id}`)}
        >
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
            <View style={styles.eventDetails}>
              <View style={styles.eventDetailItem}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.eventDetailText}>{event.date} à {event.time}</Text>
              </View>
              <View style={styles.eventDetailItem}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={styles.eventDetailText}>{event.location}</Text>
              </View>
              <View style={styles.eventDetailItem}>
                <Ionicons name="people-outline" size={14} color="#64748b" />
                <Text style={styles.eventDetailText}>{event.attendees} participants</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.eventActionButton}>
            <Ionicons name="chevron-forward" size={20} color="#667eea" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.activityContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔔 Activité récente</Text>
        <TouchableOpacity onPress={() => handleMenuPress('/screens/social/notifications')}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      
      {recentActivities.map((activity) => (
        <TouchableOpacity key={activity.id} style={styles.activityItem}>
          <Image source={{ uri: activity.avatar }} style={styles.activityAvatar} />
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>
              <Text style={styles.activityUser}>{activity.user}</Text>
              {' '}{activity.action}{' '}
              <Text style={styles.activityEvent}>{activity.event}</Text>
            </Text>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
          <View style={[styles.activityTypeIcon, { backgroundColor: getActivityColor(activity.type) }]}>
            <Ionicons name={getActivityIcon(activity.type)} size={12} color="white" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFriendSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👥 Suggestions d'amis</Text>
        <TouchableOpacity onPress={() => handleMenuPress('/screens/social/friends')}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={friendSuggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.suggestionCard}>
            <Image source={{ uri: item.avatar }} style={styles.suggestionAvatar} />
            <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.suggestionConnection}>{item.mutualFriends} amis en commun</Text>
            <View style={styles.suggestionActions}>
              <TouchableOpacity style={styles.addFriendButton}>
                <Ionicons name="person-add" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.ignoreButton}>
                <Ionicons name="close" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.suggestionsList}
      />
    </View>
  );

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>📊 Vos statistiques</Text>
      <View style={styles.statsGrid}>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => handleMenuPress('/screens/social/friends')}
        >
          <View style={[styles.statIcon, { backgroundColor: '#667eea' }]}>
            <Ionicons name="people" size={20} color="white" />
          </View>
          <Text style={styles.statNumber}>42</Text>
          <Text style={styles.statLabel}>Amis</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => handleMenuPress('/screens/events/EventsListScreen')}
        >
          <View style={[styles.statIcon, { backgroundColor: '#48bb78' }]}>
            <Ionicons name="calendar" size={20} color="white" />
          </View>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Événements</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => handleMenuPress('/screens/memories/gallery')}
        >
          <View style={[styles.statIcon, { backgroundColor: '#ed8936' }]}>
            <Ionicons name="images" size={20} color="white" />
          </View>
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => handleMenuPress('/screens/ecommerce/wishlist')}
        >
          <View style={[styles.statIcon, { backgroundColor: '#9f7aea' }]}>
            <Ionicons name="gift" size={20} color="white" />
          </View>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Souhaits</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.userPoints}>
        <Ionicons name="trophy" size={16} color="#f59e0b" />
        <Text style={styles.pointsText}>{user.points} points CelebConnect</Text>
      </View>
    </View>
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'photo': return 'camera';
      case 'event': return 'calendar';
      case 'invitation': return 'mail';
      default: return 'information-circle';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'photo': return '#ed8936';
      case 'event': return '#48bb78';
      case 'invitation': return '#667eea';
      default: return '#64748b';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderHorizontalMainMenu()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTodayHighlight()}
        {renderQuickActions()}
        {renderUpcomingBirthdays()}
        {renderUpcomingEvents()}
        {renderRecentActivity()}
        {renderFriendSuggestions()}
        {renderStatsCard()}
        
        {/* Espace supplémentaire en bas */}
        <View style={{ height: 30 }} />
      </ScrollView>

      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => handleMenuPress('/screens/events/createevent')}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.floatingButtonGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 45,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  userLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userLevelText: {
    fontSize: 11,
    color: '#f59e0b',
    marginLeft: 4,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  horizontalMenuContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  horizontalMenuScroll: {
    paddingHorizontal: 15,
  },
  horizontalMenuItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  horizontalMenuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  horizontalMenuText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },
  todayHighlight: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  todayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  todayContent: {
    flex: 1,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  todayItem: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
todayButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  quickActionItem: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  birthdaysContainer: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  birthdaysList: {
    paddingLeft: 5,
  },
  birthdayCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 130,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  birthdayCardToday: {
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: '#f8fafc',
  },
  birthdayImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  birthdayImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  todayBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#667eea',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBadgeText: {
    fontSize: 12,
  },
  daysLeftBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  daysLeftText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  birthdayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 2,
  },
  birthdayAge: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  birthdayDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  eventsContainer: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventImage: {
    width: 80,
    height: 80,
  },
  eventInfo: {
    flex: 1,
    padding: 15,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  eventDetails: {
    gap: 4,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
  eventActionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  activityContainer: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  activityItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 18,
  },
  activityUser: {
    fontWeight: '600',
    color: '#1e293b',
  },
  activityEvent: {
    fontWeight: '600',
    color: '#667eea',
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  activityTypeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  suggestionsList: {
    paddingLeft: 5,
  },
  suggestionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 140,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  suggestionConnection: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addFriendButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ignoreButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statItem: {
    width: (width - 80) / 4,
    alignItems: 'center',
    marginBottom: 15,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  userPoints: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;