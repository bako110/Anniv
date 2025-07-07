import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../../../services/profile';
import Homestyles from '../../../styles/home';
import { API_BASE_URL } from '../../../constants/config';


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
    id: 'events',
    title: 'Événements',
    icon: 'calendar',
    color: '#ed8936',
    route: '/screens/events/eventsList',
    type: 'Ionicons'
  },
  {
    id: 'social',
    title: 'Social',
    icon: 'people',
    color: '#48bb78',
    route: '/screens/social/home',
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

// Profil par défaut
const defaultUserProfile = {
  name: 'Utilisateur',
  avatar: 'https://ui-avatars.com/api/?name=User&background=667eea&color=ffffff&size=128',
  profileImage: null,
  level: 'Nouveau',
  points: 0,
  online_status: false
};

const HomeScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [notificationCount] = useState(5);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(defaultUserProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  // États pour la gestion du bouton retour
  const [backPressCount, setBackPressCount] = useState(0);
  const backPressTimer = useRef(null);

  // Convertir le niveau numérique en texte
  const getLevelText = (level) => {
    switch(level) {
      case 1: return 'Nouveau';
      case 2: return 'Intermédiaire';
      case 3: return 'Avancé';
      case 4: return 'Expert';
      default: return 'Nouveau';
    }
  };

  // Fonction pour générer l'avatar de fallback
  const generateFallbackAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=667eea&color=ffffff&size=128`;
  };

  // Fonction pour créer un profil basique
  const createBasicProfile = (identifierObj) => {
    return {
      first_name: 'Utilisateur',
      last_name: '',
      email: identifierObj.type === 'email' ? identifierObj.value : null,
      phone: identifierObj.type === 'phone' ? identifierObj.value : null,
      avatar_url: generateFallbackAvatar('Utilisateur'),
      level: 1,
      points: 0,
      online_status: false
    };
  };

  // Fonction pour formater l'URL de l'avatar
  const formatAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return generateFallbackAvatar('Utilisateur');
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }
    return `${API_BASE_URL}${avatarUrl}`;
  };

  // Fonction pour mettre à jour les données du profil utilisateur
  const updateUserProfileData = (profileData) => {
    const userName = profileData.first_name || 'Utilisateur';
    setUser({
      name: userName,
      avatar: formatAvatarUrl(profileData.avatar_url),
      profileImage: profileData.profile_image_url || null,
      level: getLevelText(profileData.level),
      points: profileData.points || 0,
      online_status: profileData.online_status || false
    });
  };

  // Fonction pour récupérer l'identifiant utilisateur
  const getUserIdentifier = async () => {
    try {
      const loginIdentifier = await AsyncStorage.getItem('loginIdentifier');
      if (loginIdentifier) {
        const parsed = JSON.parse(loginIdentifier);
        console.log('Identifiant de connexion trouvé:', parsed);
        return parsed;
      }

      const sources = [
        'userEmail',
        'userPhone',
        'userIdentifier',
        'userInfo',
        'loginCredentials'
      ];
      const foundIdentifiers = [];
      for (const source of sources) {
        const data = await AsyncStorage.getItem(source);
        if (data) {
          let identifier = null;
          try {
            if (source === 'userEmail' || source === 'userPhone' || source === 'userIdentifier') {
              const parsed = JSON.parse(data);
              identifier = typeof parsed === 'string' ? parsed : parsed.value || parsed;
            } else {
              const parsedData = JSON.parse(data);
              identifier = parsedData.email || parsedData.phone || parsedData.identifier;
            }
          } catch (parseError) {
            identifier = data;
          }
          if (identifier) {
            const formattedIdentifier = formatIdentifier(identifier);
            if (formattedIdentifier) {
              foundIdentifiers.push({
                source,
                ...formattedIdentifier
              });
            }
          }
        }
      }
      if (foundIdentifiers.length === 0) {
        throw new Error("Aucun identifiant valide trouvé (email ou téléphone).");
      }

      const emailIdentifier = foundIdentifiers.find(id => id.type === 'email');
      if (emailIdentifier) {
        console.log(`Identifiant email sélectionné depuis ${emailIdentifier.source}:`, emailIdentifier);
        return {
          type: emailIdentifier.type,
          value: emailIdentifier.value
        };
      }

      const phoneIdentifier = foundIdentifiers.find(id => id.type === 'phone');
      if (phoneIdentifier) {
        console.log(`Identifiant téléphone sélectionné depuis ${phoneIdentifier.source}:`, phoneIdentifier);
        return {
          type: phoneIdentifier.type,
          value: phoneIdentifier.value
        };
      }

      throw new Error("Aucun identifiant valide trouvé après formatage.");
    } catch (error) {
      console.error("Erreur getUserIdentifier:", error);
      throw error;
    }
  };

  // Fonction pour formater l'identifiant
  const formatIdentifier = (identifier) => {
    if (!identifier) return null;
    const cleanIdentifier = typeof identifier === 'string' ? identifier.trim() : String(identifier).trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(cleanIdentifier)) {
      return {
        type: 'email',
        value: cleanIdentifier.toLowerCase()
      };
    }
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    const cleanPhone = cleanIdentifier.replace(/[\s\-\(\)]/g, '');
    if (phoneRegex.test(cleanIdentifier) && cleanPhone.length >= 8) {
      return {
        type: 'phone',
        value: cleanPhone
      };
    }
    return null;
  };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const identifierObj = await getUserIdentifier();
        console.log('Identifiant utilisateur récupéré:', identifierObj);

        const cachedProfileString = await AsyncStorage.getItem('userProfile');
        if (cachedProfileString) {
          const cachedProfile = JSON.parse(cachedProfileString);
          console.log('Profil en cache trouvé:', cachedProfile);
          updateUserProfileData(cachedProfile);
        }

        try {
          console.log('Appel API avec identifiant:', identifierObj.value);
          const profileData = await getProfile(identifierObj.value);
          console.log('Profil récupéré depuis l\'API:', profileData);

          await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
          updateUserProfileData(profileData);
        } catch (apiError) {
          console.error('Erreur API:', apiError);
          if (!cachedProfileString && apiError.status === 404) {
            const basicProfile = createBasicProfile(identifierObj);
            updateUserProfileData(basicProfile);
          } else if (!cachedProfileString) {
            console.warn('Utilisation profil par défaut suite erreur API');
            updateUserProfileData(defaultUserProfile);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        console.warn('Utilisation profil par défaut suite erreur');
        updateUserProfileData(defaultUserProfile);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
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
      setBackPressCount(1);
      backPressTimer.current = setTimeout(() => {
        setBackPressCount(0);
      }, 2000);
    } else if (backPressCount === 1) {
      setBackPressCount(2);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Appuyez encore une fois pour quitter l\'application', ToastAndroid.SHORT);
      }
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
      backPressTimer.current = setTimeout(() => {
        setBackPressCount(0);
      }, 2000);
    } else if (backPressCount === 2) {
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
      BackHandler.exitApp();
    }
  };

  const handleMenuPress = (route) => {
    setBackPressCount(0);
    if (backPressTimer.current) {
      clearTimeout(backPressTimer.current);
    }
    router.push(route);
  };

  const handleAvatarError = () => {
    setAvatarError(true);
    setUser(prevUser => ({
      ...prevUser,
      avatar: `${generateFallbackAvatar(prevUser.name)}?${Math.random()}`
    }));
  };

  const handleProfileImageError = () => {
    setProfileImageError(true);
    setUser(prevUser => ({
      ...prevUser,
      profileImage: prevUser.profileImage ? `${prevUser.profileImage}?${Math.random()}` : null
    }));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    const loadProfile = async () => {
      try {
        const identifierObj = await getUserIdentifier();
        if (identifierObj) {
          const profile = await getProfile(identifierObj.value);
          if (profile) {
            updateUserProfileData(profile);
            await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
          }
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du profil:', error);
      } finally {
        setRefreshing(false);
      }
    };
    loadProfile();
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const renderHeader = () => (
    <View style={Homestyles.header}>
      <View style={Homestyles.headerLeft}>
        <TouchableOpacity onPress={() => handleMenuPress('/screens/profile/profile')}>
          <View style={Homestyles.avatarContainer}>
            {!profileImageError && user.profileImage && (
              <Image
                source={{ uri: user.profileImage }}
                style={Homestyles.profileImage}
                onError={handleProfileImageError}
              />
            )}
            <Image
              source={{ uri: avatarError ? generateFallbackAvatar(user.name) : user.avatar }}
              style={Homestyles.userAvatar}
              onError={handleAvatarError}
            />
            <View style={[
              Homestyles.statusIndicator,
              { backgroundColor: user.online_status ? '#22c55e' : '#64748b' }
            ]} />
          </View>
        </TouchableOpacity>
        <View style={Homestyles.userInfo}>
          <Text style={Homestyles.greeting}>{getGreeting()},</Text>
          <Text style={Homestyles.userName}>{user.name} 👋</Text>
          <View style={Homestyles.userLevel}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={Homestyles.userLevelText}>{user.level} • {user.points} pts</Text>
          </View>
        </View>
      </View>
      <View style={Homestyles.headerRight}>
        <TouchableOpacity
          style={Homestyles.headerIcon}
          onPress={() => handleMenuPress('/screens/social/search')}
        >
          <Ionicons name="search" size={24} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity
          style={Homestyles.headerIcon}
          onPress={() => handleMenuPress('/screens/social/notifications')}
        >
          <Ionicons name="notifications" size={24} color="#667eea" />
          {notificationCount > 0 && (
            <View style={Homestyles.notificationBadge}>
              <Text style={Homestyles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHorizontalMainMenu = () => (
    <View style={Homestyles.horizontalMenuContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={Homestyles.horizontalMenuScroll}
      >
        {mainMenuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={Homestyles.horizontalMenuItem}
            onPress={() => handleMenuPress(item.route)}
          >
            <View style={[Homestyles.horizontalMenuIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color="white" />
            </View>
            <Text style={Homestyles.horizontalMenuText}>{item.title}</Text>
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
      <Animated.View style={[Homestyles.todayHighlight, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={Homestyles.todayGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={Homestyles.todayContent}>
            <Text style={Homestyles.todayTitle}>🎉 Aujourd'hui</Text>
            {todaysBirthdays.map(birthday => (
              <Text key={birthday.id} style={Homestyles.todayItem}>
                🎂 Anniversaire de {birthday.name} ({birthday.age} ans)
              </Text>
            ))}
            {todaysEvents.map(event => (
              <Text key={event.id} style={Homestyles.todayItem}>
                📅 {event.title} à {event.time}
              </Text>
            ))}
          </View>
          <TouchableOpacity
            style={Homestyles.todayButton}
            onPress={() => handleMenuPress('/screens/calendar/CalendarScreen')}
          >
            <AntDesign name="right" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderQuickActions = () => (
    <View style={Homestyles.quickActionsContainer}>
      <Text style={Homestyles.sectionTitle}>⚡ Actions rapides</Text>
      <View style={Homestyles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={Homestyles.quickActionItem}
            onPress={() => handleMenuPress(action.route)}
          >
            <View style={[Homestyles.quickActionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={20} color="white" />
            </View>
            <Text style={Homestyles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUpcomingBirthdays = () => (
    <View style={Homestyles.birthdaysContainer}>
      <View style={Homestyles.sectionHeader}>
        <Text style={Homestyles.sectionTitle}>🎂 Prochains anniversaires</Text>
        <TouchableOpacity onPress={() => handleMenuPress('/screens/calendar/birthdays')}>
          <Text style={Homestyles.seeAllText}>Voir tout</Text>
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
              Homestyles.birthdayCard,
              item.isToday && Homestyles.birthdayCardToday
            ]}
            onPress={() => handleMenuPress(`/screens/profile/ProfileScreen?userId=${item.id}`)}
          >
            <View style={Homestyles.birthdayImageContainer}>
              <Image source={{ uri: item.avatar }} style={Homestyles.birthdayImage} />
              {item.isToday ? (
                <View style={Homestyles.todayBadge}>
                  <Text style={Homestyles.todayBadgeText}>🎉</Text>
                </View>
              ) : (
                <View style={Homestyles.daysLeftBadge}>
                  <Text style={Homestyles.daysLeftText}>{item.daysLeft}j</Text>
                </View>
              )}
            </View>
            <Text style={Homestyles.birthdayName} numberOfLines={1}>{item.name}</Text>
            <Text style={Homestyles.birthdayAge}>{item.age} ans</Text>
            <Text style={Homestyles.birthdayDate}>{item.date}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={Homestyles.birthdaysList}
      />
    </View>
  );

  const renderUpcomingEvents = () => (
    <View style={Homestyles.eventsContainer}>
      <View style={Homestyles.sectionHeader}>
        <Text style={Homestyles.sectionTitle}>📅 Événements à venir</Text>
        <TouchableOpacity onPress={() => handleMenuPress('/screens/events/EventsListScreen')}>
          <Text style={Homestyles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      {upcomingEvents.map((event) => (
        <TouchableOpacity
          key={event.id}
          style={Homestyles.eventCard}
          onPress={() => handleMenuPress(`/screens/events/EventDetailsScreen?eventId=${event.id}`)}
        >
          <Image source={{ uri: event.image }} style={Homestyles.eventImage} />
          <View style={Homestyles.eventInfo}>
            <Text style={Homestyles.eventTitle} numberOfLines={1}>{event.title}</Text>
            <View style={Homestyles.eventDetails}>
              <View style={Homestyles.eventDetailItem}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={Homestyles.eventDetailText}>{event.date} à {event.time}</Text>
              </View>
              <View style={Homestyles.eventDetailItem}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={Homestyles.eventDetailText}>{event.location}</Text>
              </View>
              <View style={Homestyles.eventDetailItem}>
                <Ionicons name="people-outline" size={14} color="#64748b" />
                <Text style={Homestyles.eventDetailText}>{event.attendees} participants</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={Homestyles.eventActionButton}>
            <Ionicons name="chevron-forward" size={20} color="#667eea" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRecentActivity = () => (
    <View style={Homestyles.activityContainer}>
      <View style={Homestyles.sectionHeader}>
        <Text style={Homestyles.sectionTitle}>🔔 Activité récente</Text>
        <TouchableOpacity onPress={() => handleMenuPress('/screens/social/notifications')}>
          <Text style={Homestyles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      {recentActivities.map((activity) => (
        <TouchableOpacity key={activity.id} style={Homestyles.activityItem}>
          <Image source={{ uri: activity.avatar }} style={Homestyles.activityAvatar} />
          <View style={Homestyles.activityContent}>
            <Text style={Homestyles.activityText}>
              <Text style={Homestyles.activityUser}>{activity.user}</Text>
              {' '}{activity.action}{' '}
              <Text style={Homestyles.activityEvent}>{activity.event}</Text>
            </Text>
            <Text style={Homestyles.activityTime}>{activity.time}</Text>
          </View>
          <View style={[Homestyles.activityTypeIcon, { backgroundColor: getActivityColor(activity.type) }]}>
            <Ionicons name={getActivityIcon(activity.type)} size={12} color="white" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFriendSuggestions = () => (
    <View style={Homestyles.suggestionsContainer}>
      <View style={Homestyles.sectionHeader}>
        <Text style={Homestyles.sectionTitle}>👥 Suggestions d'amis</Text>
        <TouchableOpacity onPress={() => handleMenuPress('/screens/social/friends')}>
          <Text style={Homestyles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={friendSuggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={Homestyles.suggestionCard}>
            <Image source={{ uri: item.avatar }} style={Homestyles.suggestionAvatar} />
            <Text style={Homestyles.suggestionName} numberOfLines={1}>{item.name}</Text>
            <Text style={Homestyles.suggestionConnection}>{item.mutualFriends} amis en commun</Text>
            <View style={Homestyles.suggestionActions}>
              <TouchableOpacity style={Homestyles.addFriendButton}>
                <Ionicons name="person-add" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={Homestyles.ignoreButton}>
                <Ionicons name="close" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={Homestyles.suggestionsList}
      />
    </View>
  );

  const renderStatsCard = () => (
    <View style={Homestyles.statsContainer}>
      <Text style={Homestyles.sectionTitle}>📊 Vos statistiques</Text>
      <View style={Homestyles.statsGrid}>
        <TouchableOpacity
          style={Homestyles.statItem}
          onPress={() => handleMenuPress('/screens/social/friends')}
        >
          <View style={[Homestyles.statIcon, { backgroundColor: '#667eea' }]}>
            <Ionicons name="people" size={20} color="white" />
          </View>
          <Text style={Homestyles.statNumber}>42</Text>
          <Text style={Homestyles.statLabel}>Amis</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={Homestyles.statItem}
          onPress={() => handleMenuPress('/screens/events/EventsListScreen')}
        >
          <View style={[Homestyles.statIcon, { backgroundColor: '#48bb78' }]}>
            <Ionicons name="calendar" size={20} color="white" />
          </View>
          <Text style={Homestyles.statNumber}>12</Text>
          <Text style={Homestyles.statLabel}>Événements</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={Homestyles.statItem}
          onPress={() => handleMenuPress('/screens/memories/gallery')}
        >
          <View style={[Homestyles.statIcon, { backgroundColor: '#ed8936' }]}>
            <Ionicons name="images" size={20} color="white" />
          </View>
          <Text style={Homestyles.statNumber}>156</Text>
          <Text style={Homestyles.statLabel}>Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={Homestyles.statItem}
          onPress={() => handleMenuPress('/screens/ecommerce/wishlist')}
        >
          <View style={[Homestyles.statIcon, { backgroundColor: '#9f7aea' }]}>
            <Ionicons name="gift" size={20} color="white" />
          </View>
          <Text style={Homestyles.statNumber}>8</Text>
          <Text style={Homestyles.statLabel}>Souhaits</Text>
        </TouchableOpacity>
      </View>
      <View style={Homestyles.userPoints}>
        <Ionicons name="trophy" size={16} color="#f59e0b" />
        <Text style={Homestyles.pointsText}>{user.points} points CelebConnect</Text>
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
    <SafeAreaView style={Homestyles.container}>
      {renderHeader()}
      {renderHorizontalMainMenu()}
      <ScrollView
        style={Homestyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={Homestyles.scrollContent}
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
        <View style={{ height: 30 }} />
      </ScrollView>
      <TouchableOpacity
        style={Homestyles.floatingButton}
        onPress={() => handleMenuPress('/screens/events/createevent')}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={Homestyles.floatingButtonGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;
