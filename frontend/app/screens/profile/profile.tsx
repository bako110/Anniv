import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  Animated,
  RefreshControl,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../../../services/profile';
import Profilestyles from '../../../styles/profile';
import {API_BASE_URL} from '../../../constants/config'


// Données par défaut en cas d'erreur
const defaultUserProfile = {
  id: '1',
  name: 'Alex Dubois',
  username: '@Batisseur',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
  bio: 'Ici pour vivre, rire, apprendre, et partager ❤️',
  location: 'Votre loclité',
  joinDate: 'Janvier 2025',
  level: 'Organisateur Expert',
  points: 1250,
  verified: true,
  isFollowing: false,
  isOwnProfile: true,
  stats: {
    friends: 42,
    events: 12,
    photos: 156,
    wishes: 8,
    eventsOrganized: 24,
    eventsAttended: 89
  },
  badges: [
    { id: '1', name: 'Organisateur Pro', icon: 'trophy', color: '#f59e0b' },
    { id: '2', name: 'Photographe', icon: 'camera', color: '#8b5cf6' },
    { id: '3', name: 'Social Butterfly', icon: 'people', color: '#06b6d4' },
    { id: '4', name: 'Aventurier', icon: 'airplane', color: '#10b981' }
  ],
  interests: [
    'Voyage', 'Photographie', 'Cuisine', 'Musique', 'Sport', 'Art', 'Nature', 'Technologie'
  ]
};

// Événements récents - gardés statiques pour le moment
const recentEvents = [
  {
    id: '1',
    title: 'Soirée BBQ été 2024',
    date: '15 Juin 2024',
    image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=200&h=150&fit=crop',
    attendees: 15,
    type: 'organized'
  },
  {
    id: '2',
    title: 'Anniversaire Marie',
    date: '8 Juin 2024',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&h=150&fit=crop',
    attendees: 25,
    type: 'attended'
  },
  {
    id: '3',
    title: 'Randonnée Fontainebleau',
    date: '2 Juin 2024',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=200&h=150&fit=crop',
    attendees: 8,
    type: 'organized'
  }
];

// Photos récentes - gardées statiques pour le moment
const recentPhotos = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=150&h=150&fit=crop'
];

// Amis en commun - gardés statiques pour le moment
const mutualFriends = [
  {
    id: '1',
    name: 'Marie',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Pierre',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Sophie',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'Julie',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face'
  }
];

const ProfileScreen = () => {
  const [scrollY] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [userProfile, setUserProfile] = useState(defaultUserProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Hauteur fixe du header
  const HEADER_HEIGHT = 250;

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Fonction pour valider si c'est un email
  const isValidEmail = (identifier) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(identifier);
  };

  // Fonction pour valider si c'est un numéro de téléphone
  const isValidPhone = (identifier) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = identifier.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 8;
  };

  // Fonction pour formater l'identifiant selon son type
  const formatIdentifier = (identifier) => {
    if (!identifier) return null;
    
    const cleanIdentifier = identifier.trim().toLowerCase();
    
    if (isValidEmail(cleanIdentifier)) {
      return { type: 'email', value: cleanIdentifier };
    } else if (isValidPhone(identifier)) {
      return { type: 'phone', value: identifier.trim() };
    }
    
    return null;
  };

  // Fonction pour générer un nom d'utilisateur basé sur l'identifiant
  const generateUsername = (identifierObj) => {
    if (identifierObj.type === 'email') {
      return '@' + identifierObj.value.split('@')[0];
    } else if (identifierObj.type === 'phone') {
      const digits = identifierObj.value.replace(/\D/g, '');
      return '@user' + digits.slice(-4);
    }
    return '@utilisateur';
  };

  // Fonction pour charger le profil utilisateur
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer identifiant email ou téléphone
      const identifierObj = await getUserIdentifier();
      console.log('Identifiant utilisateur récupéré:', identifierObj);

      // Chargement depuis le cache
      const cachedProfileString = await AsyncStorage.getItem('userProfile');
      if (cachedProfileString) {
        const cachedProfile = JSON.parse(cachedProfileString);
        console.log('Profil en cache trouvé:', cachedProfile);
        updateUserProfileData(cachedProfile);
      }

      // Chargement depuis API
      try {
        const profileData = await getProfile(identifierObj.value);
        console.log('Profil récupéré depuis l\'API:', profileData);
        
        await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
        updateUserProfileData(profileData);
      } catch (apiError) {
        console.error('Erreur API:', apiError);

        if (!cachedProfileString) {
          if (apiError.status === 404) {
            // Profil non trouvé, profil basique
            const basicProfile = {
              ...defaultUserProfile,
              name: 'Nouvel utilisateur',
              username: generateUsername(identifierObj),
              email: identifierObj.type === 'email' ? identifierObj.value : '',
              phone: identifierObj.type === 'phone' ? identifierObj.value : '',
              bio: 'Nouveau membre de CelebConnect 🌟',
            };
            updateUserProfileData(basicProfile);
          } else {
            console.warn('Utilisation profil par défaut suite erreur API');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      console.warn('Utilisation profil par défaut suite erreur');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer l'identifiant utilisateur (email ou téléphone)
  const getUserIdentifier = async () => {
    try {
      const sources = [
        'userIdentifier',
        'userInfo',
        'loginCredentials'
      ];

      for (const source of sources) {
        const data = await AsyncStorage.getItem(source);
        if (data) {
          let identifier = null;

          if (source === 'userIdentifier') {
            identifier = data;
          } else {
            const parsedData = JSON.parse(data);
            identifier = parsedData.email || parsedData.phone || parsedData.identifier;
          }

          if (identifier) {
            const formattedIdentifier = formatIdentifier(identifier);
            if (formattedIdentifier) {
              console.log(`Identifiant trouvé dans ${source}:`, formattedIdentifier);
              return formattedIdentifier;
            }
          }
        }
      }

      throw new Error("Aucun identifiant valide trouvé (email ou téléphone).");

    } catch (error) {
      console.error("Erreur getUserIdentifier:", error);
      throw error;
    }
  };

  // Fonction pour mettre à jour les données du profil utilisateur
  const updateUserProfileData = (profileData) => {
    const avatarUrl = profileData.avatar_url 
      ? (profileData.avatar_url.startsWith('http') 
          ? profileData.avatar_url 
          : `${API_BASE_URL}${profileData.avatar_url}`) 
      : defaultUserProfile.avatar;

    const coverPhotoUrl = profileData.coverPhoto 
      ? (profileData.coverPhoto.startsWith('http') 
          ? profileData.coverPhoto 
          : `${API_BASE_URL}${profileData.coverPhoto}`) 
      : defaultUserProfile.coverPhoto;

    const updatedProfile = {
      ...defaultUserProfile,
      id: profileData.id || profileData.user_id || defaultUserProfile.id,
      name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.name || defaultUserProfile.name,
      username: profileData.username ? `@${profileData.username}` : defaultUserProfile.username,
      email: profileData.email || '',
      phone: profileData.phone || '',
      avatar: avatarUrl,
      coverPhoto: coverPhotoUrl,
      bio: profileData.bio || defaultUserProfile.bio,
      location: profileData.location || defaultUserProfile.location,
      website: profileData.website || '',
      birthDate: profileData.birth_date || '',
      joinDate: profileData.created_at ? formatJoinDate(profileData.created_at) : defaultUserProfile.joinDate,
      interests: profileData.interests || defaultUserProfile.interests,
      stats: defaultUserProfile.stats,
      badges: defaultUserProfile.badges,
      level: profileData.level || defaultUserProfile.level,
      points: profileData.points || defaultUserProfile.points,
      verified: profileData.verified || defaultUserProfile.verified,
      isFollowing: profileData.isFollowing || defaultUserProfile.isFollowing,
      isOwnProfile: true,
    };
    setUserProfile(updatedProfile);
    setIsFollowing(updatedProfile.isFollowing);
  };


  // Fonction pour formater la date d'inscription
  const formatJoinDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long' };
      return date.toLocaleDateString('fr-FR', options);
    } catch (error) {
      return defaultUserProfile.joinDate;
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadUserProfile().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez le profil de ${userProfile.name} sur CelebConnect !`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    Alert.alert(
      isFollowing ? 'Ne plus suivre' : 'Suivre',
      isFollowing 
        ? `Vous ne suivez plus ${userProfile.name}` 
        : `Vous suivez maintenant ${userProfile.name}`
    );
  };


const renderHeader = () => (
  <View style={[Profilestyles.header, { height: HEADER_HEIGHT }]}>
    <Animated.View style={[Profilestyles.headerImageContainer, { opacity: headerOpacity }]}>
      <Image source={{ uri: userProfile.coverPhoto }} style={Profilestyles.coverPhoto} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={Profilestyles.coverGradient}
      />
    </Animated.View>

    <View style={Profilestyles.headerContent}>
      <TouchableOpacity 
        style={Profilestyles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={Profilestyles.headerActions}>
        <TouchableOpacity 
          style={Profilestyles.headerActionButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color="white" />
        </TouchableOpacity>

        {!userProfile.isOwnProfile && (
          <TouchableOpacity 
            style={Profilestyles.headerActionButton}
            onPress={() => {/* Options menu */}}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
);

const renderProfileInfo = () => (
  <View style={Profilestyles.profileInfo}>
    <View style={Profilestyles.avatarContainer}>
      <Image source={{ uri: userProfile.avatar }} style={Profilestyles.avatar} />

      {userProfile.verified && (
        <View style={Profilestyles.verifiedBadge}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
      <View style={Profilestyles.statusIndicator} />
    </View>

    <View style={Profilestyles.userInfo}>
      <View style={Profilestyles.nameContainer}>
        <Text style={Profilestyles.userName}>{userProfile.name}</Text>
        <Text style={Profilestyles.userUsername}>{userProfile.username}</Text>
      </View>

      <View style={Profilestyles.userLevel}>
        <Ionicons name="star" size={16} color="#f59e0b" />
        <Text style={Profilestyles.userLevelText}>{userProfile.level}</Text>
        <Text style={Profilestyles.userPoints}>• {userProfile.points} pts</Text>
      </View>

      <Text style={Profilestyles.userBio}>{userProfile.bio}</Text>

      <View style={Profilestyles.userDetails}>
        {userProfile.location && (
          <View style={Profilestyles.userDetailItem}>
            <Ionicons name="location-outline" size={14} color="#64748b" />
            <Text style={Profilestyles.userDetailText}>{userProfile.location}</Text>
          </View>
        )}
        <View style={Profilestyles.userDetailItem}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={Profilestyles.userDetailText}>Membre depuis {userProfile.joinDate}</Text>
        </View>
        {userProfile.website && (
          <View style={Profilestyles.userDetailItem}>
            <Ionicons name="link-outline" size={14} color="#64748b" />
            <Text style={Profilestyles.userDetailText}>{userProfile.website}</Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

const renderActionButtons = () => (
  <View style={Profilestyles.actionButtons}>
    {userProfile.isOwnProfile ? (
      <>
        <TouchableOpacity 
          style={[Profilestyles.actionButton, Profilestyles.primaryButton]}
          onPress={() => router.push('/screens/profile/editprofile')}
        >
          <Ionicons name="create-outline" size={18} color="white" />
          <Text style={[Profilestyles.actionButtonText, Profilestyles.primaryButtonText]}>
            Modifier profil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[Profilestyles.actionButton, Profilestyles.secondaryButton]}
          onPress={() => router.push('/screens/profile/settings')}
        >
          <Ionicons name="settings-outline" size={18} color="#667eea" />
        </TouchableOpacity>
      </>
    ) : (
      <>
        <TouchableOpacity 
          style={[
            Profilestyles.actionButton, 
            Profilestyles.primaryButton,
            isFollowing && Profilestyles.followingButton
          ]}
          onPress={handleFollow}
        >
          <Ionicons 
            name={isFollowing ? "checkmark" : "person-add"} 
            size={18} 
            color={isFollowing ? "#667eea" : "white"} 
          />
          <Text style={[
            Profilestyles.actionButtonText, 
            isFollowing ? Profilestyles.followingButtonText : Profilestyles.primaryButtonText
          ]}>
            {isFollowing ? 'Suivi' : 'Suivre'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[Profilestyles.actionButton, Profilestyles.secondaryButton]}
          onPress={() => router.push('/screens/social/chat')}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#667eea" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[Profilestyles.actionButton, Profilestyles.secondaryButton]}
          onPress={() => {/* Add friend */}}
        >
          <Ionicons name="person-add-outline" size={18} color="#667eea" />
        </TouchableOpacity>
      </>
    )}
  </View>
);

const renderStats = () => (
  <View style={Profilestyles.statsContainer}>
    <TouchableOpacity 
      style={Profilestyles.statItem}
      onPress={() => router.push('/screens/social/friends')}
    >
      <Text style={Profilestyles.statNumber}>{userProfile.stats.friends}</Text>
      <Text style={Profilestyles.statLabel}>Amis</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={Profilestyles.statItem}
      onPress={() => router.push('/screens/events/myevents')}
    >
      <Text style={Profilestyles.statNumber}>{userProfile.stats.eventsOrganized}</Text>
      <Text style={Profilestyles.statLabel}>Organisés</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={Profilestyles.statItem}
      onPress={() => router.push('/screens/events/myevents')}
    >
      <Text style={Profilestyles.statNumber}>{userProfile.stats.eventsAttended}</Text>
      <Text style={Profilestyles.statLabel}>Participés</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={Profilestyles.statItem}
      onPress={() => router.push('/screens/memories/photos')}
    >
      <Text style={Profilestyles.statNumber}>{userProfile.stats.photos}</Text>
      <Text style={Profilestyles.statLabel}>Photos</Text>
    </TouchableOpacity>
  </View>
);

const renderBadges = () => (
  <View style={Profilestyles.badgesContainer}>
    <Text style={Profilestyles.sectionTitle}>🏆 Badges</Text>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={Profilestyles.badgesList}
    >
      {userProfile.badges.map((badge) => (
        <View key={badge.id} style={Profilestyles.badgeItem}>
          <View style={[Profilestyles.badgeIcon, { backgroundColor: badge.color }]}>
            <Ionicons name={badge.icon} size={20} color="white" />
          </View>
          <Text style={Profilestyles.badgeName}>{badge.name}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const renderInterests = () => (
  <View style={Profilestyles.interestsContainer}>
    <Text style={Profilestyles.sectionTitle}>💫 Centres d'intérêt</Text>
    <View style={Profilestyles.interestsList}>
      {userProfile.interests.map((interest, index) => (
        <TouchableOpacity key={index} style={Profilestyles.interestTag}>
          <Text style={Profilestyles.interestText}>{interest}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const renderTabBar = () => (
  <View style={Profilestyles.tabBar}>
    <TouchableOpacity
      style={[Profilestyles.tabItem, activeTab === 'events' && Profilestyles.activeTab]}
      onPress={() => setActiveTab('events')}
    >
      <Ionicons 
        name="calendar" 
        size={20} 
        color={activeTab === 'events' ? '#667eea' : '#64748b'} 
      />
      <Text style={[
        Profilestyles.tabText,
        activeTab === 'events' && Profilestyles.activeTabText
      ]}>
        Événements
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[Profilestyles.tabItem, activeTab === 'photos' && Profilestyles.activeTab]}
      onPress={() => setActiveTab('photos')}
    >
      <Ionicons 
        name="images" 
        size={20} 
        color={activeTab === 'photos' ? '#667eea' : '#64748b'} 
      />
      <Text style={[
        Profilestyles.tabText,
        activeTab === 'photos' && Profilestyles.activeTabText
      ]}>
        Photos
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[Profilestyles.tabItem, activeTab === 'friends' && Profilestyles.activeTab]}
      onPress={() => setActiveTab('friends')}
    >
      <Ionicons 
        name="people" 
        size={20} 
        color={activeTab === 'friends' ? '#667eea' : '#64748b'} 
      />
      <Text style={[
        Profilestyles.tabText,
        activeTab === 'friends' && Profilestyles.activeTabText
      ]}>
        Amis
      </Text>
    </TouchableOpacity>
  </View>
);

const renderEventsContent = () => (
  <View style={Profilestyles.contentContainer}>
    {recentEvents.map((event) => (
      <TouchableOpacity 
        key={event.id} 
        style={Profilestyles.eventCard}
        onPress={() => router.push(`/screens/events/eventdetails?id=${event.id}`)}
      >
        <Image source={{ uri: event.image }} style={Profilestyles.eventImage} />
        <View style={Profilestyles.eventInfo}>
          <View style={Profilestyles.eventHeader}>
            <Text style={Profilestyles.eventTitle}>{event.title}</Text>
            <View style={[
              Profilestyles.eventTypeTag,
              { backgroundColor: event.type === 'organized' ? '#667eea' : '#48bb78' }
            ]}>
              <Text style={Profilestyles.eventTypeText}>
                {event.type === 'organized' ? 'Organisé' : 'Participé'}
              </Text>
            </View>
          </View>
          <View style={Profilestyles.eventDetails}>
            <View style={Profilestyles.eventDetailItem}>
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text style={Profilestyles.eventDetailText}>{event.date}</Text>
            </View>
            <View style={Profilestyles.eventDetailItem}>
              <Ionicons name="people-outline" size={14} color="#64748b" />
              <Text style={Profilestyles.eventDetailText}>{event.attendees} participants</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

const renderPhotosContent = () => (
  <View style={Profilestyles.contentContainer}>
    <View style={Profilestyles.photosGrid}>
      {recentPhotos.map((photo, index) => (
        <TouchableOpacity 
          key={index} 
          style={Profilestyles.photoItem}
          onPress={() => router.push(`/screens/memories/photoviewer?index=${index}`)}
        >
          <Image source={{ uri: photo }} style={Profilestyles.photoImage} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const renderFriendsContent = () => (
  <View style={Profilestyles.contentContainer}>
    <View style={Profilestyles.friendsGrid}>
      {mutualFriends.map((friend) => (
        <TouchableOpacity 
          key={friend.id} 
          style={Profilestyles.friendCard}
          onPress={() => router.push(`/screens/profile/profile?userId=${friend.id}`)}
        >
          <Image source={{ uri: friend.avatar }} style={Profilestyles.friendAvatar} />
          <Text style={Profilestyles.friendName}>{friend.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const renderTabContent = () => {
  switch (activeTab) {
    case 'events':
      return renderEventsContent();
    case 'photos':
      return renderPhotosContent();
    case 'friends':
      return renderFriendsContent();
    default:
      return renderEventsContent();
  }
};


  // Affichage du loader pendant le chargement
  if (isLoading) {
    return (
      <SafeAreaView style={Profilestyles.container}>
        <View style={Profilestyles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={Profilestyles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={Profilestyles.container}>
      {renderHeader()}
      
      <ScrollView
        style={[Profilestyles.scrollView, { marginTop: HEADER_HEIGHT - 60 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderProfileInfo()}
        {renderActionButtons()}
        {renderStats()}
        {renderBadges()}
        {renderInterests()}
        {renderTabBar()}
        {renderTabContent()}
        
        {/* Espace supplémentaire en bas */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;