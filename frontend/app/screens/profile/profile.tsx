import React, { useState, useEffect } from 'react';
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
  Alert,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Données du profil utilisateur
const userProfile = {
  id: '1',
  name: 'Alex Dubois',
  username: '@alexdubois',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
  bio: 'Passionné d\'aventures et de moments partagés 🌟 Organisateur d\'événements inoubliables',
  location: 'Paris, France',
  joinDate: 'Janvier 2023',
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

// Événements récents
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

// Photos récentes
const recentPhotos = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=150&h=150&fit=crop'
];

// Amis en commun
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
  const [isFollowing, setIsFollowing] = useState(userProfile.isFollowing);

  // Hauteur fixe du header
  const HEADER_HEIGHT = 250;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
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
    <View style={[styles.header, { height: HEADER_HEIGHT }]}>
      <Animated.View style={[styles.headerImageContainer, { opacity: headerOpacity }]}>
        <Image source={{ uri: userProfile.coverPhoto }} style={styles.coverPhoto} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.coverGradient}
        />
      </Animated.View>
      
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color="white" />
          </TouchableOpacity>
          
          {!userProfile.isOwnProfile && (
            <TouchableOpacity 
              style={styles.headerActionButton}
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
    <View style={styles.profileInfo}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
        {userProfile.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
        <View style={styles.statusIndicator} />
      </View>
      
      <View style={styles.userInfo}>
        <View style={styles.nameContainer}>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userUsername}>{userProfile.username}</Text>
        </View>
        
        <View style={styles.userLevel}>
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text style={styles.userLevelText}>{userProfile.level}</Text>
          <Text style={styles.userPoints}>• {userProfile.points} pts</Text>
        </View>
        
        <Text style={styles.userBio}>{userProfile.bio}</Text>
        
        <View style={styles.userDetails}>
          <View style={styles.userDetailItem}>
            <Ionicons name="location-outline" size={14} color="#64748b" />
            <Text style={styles.userDetailText}>{userProfile.location}</Text>
          </View>
          <View style={styles.userDetailItem}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text style={styles.userDetailText}>Membre depuis {userProfile.joinDate}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {userProfile.isOwnProfile ? (
        <>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push('/screens/profile/editprofile')}
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
              Modifier profil
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/screens/profile/settings')}
          >
            <Ionicons name="settings-outline" size={18} color="#667eea" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.primaryButton,
              isFollowing && styles.followingButton
            ]}
            onPress={handleFollow}
          >
            <Ionicons 
              name={isFollowing ? "checkmark" : "person-add"} 
              size={18} 
              color={isFollowing ? "#667eea" : "white"} 
            />
            <Text style={[
              styles.actionButtonText, 
              isFollowing ? styles.followingButtonText : styles.primaryButtonText
            ]}>
              {isFollowing ? 'Suivi' : 'Suivre'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/screens/social/chat')}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#667eea" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => {/* Add friend */}}
          >
            <Ionicons name="person-add-outline" size={18} color="#667eea" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => router.push('/screens/social/friends')}
      >
        <Text style={styles.statNumber}>{userProfile.stats.friends}</Text>
        <Text style={styles.statLabel}>Amis</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => router.push('/screens/events/myevents')}
      >
        <Text style={styles.statNumber}>{userProfile.stats.eventsOrganized}</Text>
        <Text style={styles.statLabel}>Organisés</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => router.push('/screens/events/myevents')}
      >
        <Text style={styles.statNumber}>{userProfile.stats.eventsAttended}</Text>
        <Text style={styles.statLabel}>Participés</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => router.push('/screens/memories/photos')}
      >
        <Text style={styles.statNumber}>{userProfile.stats.photos}</Text>
        <Text style={styles.statLabel}>Photos</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBadges = () => (
    <View style={styles.badgesContainer}>
      <Text style={styles.sectionTitle}>🏆 Badges</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesList}
      >
        {userProfile.badges.map((badge) => (
          <View key={badge.id} style={styles.badgeItem}>
            <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
              <Ionicons name={badge.icon} size={20} color="white" />
            </View>
            <Text style={styles.badgeName}>{badge.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderInterests = () => (
    <View style={styles.interestsContainer}>
      <Text style={styles.sectionTitle}>💫 Centres d'intérêt</Text>
      <View style={styles.interestsList}>
        {userProfile.interests.map((interest, index) => (
          <TouchableOpacity key={index} style={styles.interestTag}>
            <Text style={styles.interestText}>{interest}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'events' && styles.activeTab]}
        onPress={() => setActiveTab('events')}
      >
        <Ionicons 
          name="calendar" 
          size={20} 
          color={activeTab === 'events' ? '#667eea' : '#64748b'} 
        />
        <Text style={[
          styles.tabText,
          activeTab === 'events' && styles.activeTabText
        ]}>
          Événements
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'photos' && styles.activeTab]}
        onPress={() => setActiveTab('photos')}
      >
        <Ionicons 
          name="images" 
          size={20} 
          color={activeTab === 'photos' ? '#667eea' : '#64748b'} 
        />
        <Text style={[
          styles.tabText,
          activeTab === 'photos' && styles.activeTabText
        ]}>
          Photos
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'friends' && styles.activeTab]}
        onPress={() => setActiveTab('friends')}
      >
        <Ionicons 
          name="people" 
          size={20} 
          color={activeTab === 'friends' ? '#667eea' : '#64748b'} 
        />
        <Text style={[
          styles.tabText,
          activeTab === 'friends' && styles.activeTabText
        ]}>
          Amis
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEventsContent = () => (
    <View style={styles.contentContainer}>
      {recentEvents.map((event) => (
        <TouchableOpacity 
          key={event.id} 
          style={styles.eventCard}
          onPress={() => router.push(`/screens/events/eventdetails?id=${event.id}`)}
        >
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <View style={styles.eventInfo}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={[
                styles.eventTypeTag,
                { backgroundColor: event.type === 'organized' ? '#667eea' : '#48bb78' }
              ]}>
                <Text style={styles.eventTypeText}>
                  {event.type === 'organized' ? 'Organisé' : 'Participé'}
                </Text>
              </View>
            </View>
            <View style={styles.eventDetails}>
              <View style={styles.eventDetailItem}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.eventDetailText}>{event.date}</Text>
              </View>
              <View style={styles.eventDetailItem}>
                <Ionicons name="people-outline" size={14} color="#64748b" />
                <Text style={styles.eventDetailText}>{event.attendees} participants</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPhotosContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.photosGrid}>
        {recentPhotos.map((photo, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.photoItem}
            onPress={() => router.push(`/screens/memories/photoviewer?index=${index}`)}
          >
            <Image source={{ uri: photo }} style={styles.photoImage} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFriendsContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.friendsGrid}>
        {mutualFriends.map((friend) => (
          <TouchableOpacity 
            key={friend.id} 
            style={styles.friendCard}
            onPress={() => router.push(`/screens/profile/profile?userId=${friend.id}`)}
          >
            <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
            <Text style={styles.friendName}>{friend.name}</Text>
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

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={[styles.scrollView, { marginTop: HEADER_HEIGHT - 60 }]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  headerImageContainer: {
    width: '100%',
    height: '76%',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  headerContent: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerActionButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileInfo: {
    top: 10,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#667eea',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 16,
    color: '#64748b',
  },
  userLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 6,
  },
  userPoints: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  userBio: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15,
  },
  userDetails: {
    alignItems: 'center',
    gap: 5,
  },
  userDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetailText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: 50,
  },
  followingButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
  },
  followingButtonText: {
    color: '#667eea',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  badgesContainer: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  badgesList: {
    paddingLeft: 5,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },
  interestsContainer: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  interestText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 12,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#f8fafc',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  contentContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  eventInfo: {
    padding: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  eventTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 15,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  photoItem: {
    width: (width - 52) / 3,
    height: (width - 52) / 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  friendCard: {
    alignItems: 'center',
    width: (width - 70) / 3,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  friendName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },
});

export default ProfileScreen;