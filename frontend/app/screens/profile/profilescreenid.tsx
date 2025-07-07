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
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { getUserProfile, followUser, unfollowUser } from '../../../services/userService';
import { API_BASE_URL } from '../../../constants/config';

const { width } = Dimensions.get('window');

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

const ProfileScreen = () => {
  const { userId } = useLocalSearchParams();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [userData, setUserData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const fetchUser = async () => {
      try {
        setLoading(true);
        const rawData = await getUserProfile(userId);
        setUserData(rawData);
        setIsFollowing(!!rawData.is_following);
        setError(null);
      } catch (err) {
        setError(err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const newFollowState = !isFollowing;
      setIsFollowing(newFollowState);
      setUserData((prev) => ({
        ...prev,
        followers: (prev.followers || 0) + (newFollowState ? 1 : -1),
      }));

      if (newFollowState) {
        await followUser(userId);
      } else {
        await unfollowUser(userId);
      }

    } catch (error) {
      setIsFollowing((prev) => !prev);
      setUserData((prev) => ({
        ...prev,
        followers: (prev.followers || 0) + (isFollowing ? 1 : -1),
      }));
      Alert.alert('Erreur', 'Impossible de mettre à jour le suivi.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Chargement du profil...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Erreur : {error}</Text>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Aucun profil trouvé.</Text>
      </SafeAreaView>
    );
  }

  const safeArray = (val) => (Array.isArray(val) ? val : []);

  const educationArray =
    typeof userData.education === 'string' && userData.education.trim() !== ''
      ? [{ degree: userData.education, school: '', year: '' }]
      : safeArray(userData.education);

  const experienceArray =
    typeof userData.experience === 'string' && userData.experience.trim() !== ''
      ? [{ role: userData.experience, company: '', duration: '', description: userData.experience }]
      : safeArray(userData.experience);

  // Ici, on récupère ou génère un conversationId pour la redirection message
  // A adapter en fonction de ta logique et données disponibles
  const conversationId = userData.conversationId || 'default-conversation-id';

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerIcon}>
        <Ionicons name="ellipsis-vertical" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <Image
        source={{ uri: getFullImageUrl(userData.coverPhoto) || 'https://placehold.co/800x300' }}
        style={styles.coverPhoto}
      />
      <View style={styles.profileInfoContainer}>
        <Image
          source={{ uri: getFullImageUrl(userData.avatar_url) || 'https://placehold.co/200x200' }}
          style={styles.profileAvatar}
        />
        <View style={styles.profileTextContainer}>
          <Text style={styles.nameFooterText}>{userData.name || 'Nom inconnu'}</Text>
          <Text style={styles.profileTitle}>{userData.title || 'Titre non défini'}</Text>
          <Text style={styles.profileCompany}>{userData.company || 'Entreprise non définie'}</Text>
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.connections || 0}</Text>
              <Text style={styles.statLabel}>Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.followers || 0}</Text>
              <Text style={styles.statLabel}>Abonnés</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.views || 0}</Text>
              <Text style={styles.statLabel}>Vues</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isFollowing && styles.followingButton]}
          onPress={handleFollow}
        >
          <Text style={[styles.actionButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? 'Suivi' : 'Suivre'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => router.push(`/screens/messages/chat?conversationId=${conversationId}`)}
        >
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {['about', 'experience', 'skills'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab === 'about' ? 'À propos' : tab === 'experience' ? 'Expérience' : 'Compétences'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>À propos</Text>
      <Text style={styles.aboutText}>{userData.about || 'Aucune information disponible'}</Text>

      <Text style={styles.sectionTitle}>Formation</Text>
      {educationArray.map((edu, idx) => (
        <View key={idx} style={styles.educationItem}>
          <View style={styles.educationIcon}>
            <Ionicons name="school" size={20} color="#4f46e5" />
          </View>
          <View style={styles.educationDetails}>
            <Text style={styles.educationDegree}>{edu.degree}</Text>
            <Text style={styles.educationSchool}>{edu.school}</Text>
            <Text style={styles.educationYear}>{edu.year}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Contact</Text>
      {userData.contact?.email && (
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => Linking.openURL(`mailto:${userData.contact.email}`)}
        >
          <Ionicons name="mail" size={20} color="#4f46e5" />
          <Text style={styles.contactText}>{userData.contact.email}</Text>
        </TouchableOpacity>
      )}
      {userData.contact?.phone && (
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => Linking.openURL(`tel:${userData.contact.phone}`)}
        >
          <Ionicons name="call" size={20} color="#4f46e5" />
          <Text style={styles.contactText}>{userData.contact.phone}</Text>
        </TouchableOpacity>
      )}
      {userData.contact?.website && (
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => Linking.openURL(`https://${userData.contact.website}`)}
        >
          <Ionicons name="globe" size={20} color="#4f46e5" />
          <Text style={styles.contactText}>{userData.contact.website}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderExperienceTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Expérience professionnelle</Text>
      {experienceArray.map((exp, idx) => (
        <View key={idx} style={styles.experienceItem}>
          <View style={styles.experienceIcon}>
            <FontAwesome5 name="briefcase" size={16} color="#4f46e5" />
          </View>
          <View style={styles.experienceDetails}>
            <Text style={styles.experienceRole}>{exp.role}</Text>
            <Text style={styles.experienceCompany}>{exp.company}</Text>
            <Text style={styles.experienceDuration}>{exp.duration}</Text>
            <Text style={styles.experienceDescription}>{exp.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSkillsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Compétences</Text>
      <View style={styles.skillsContainer}>
        {safeArray(userData.skills).map((skill, index) => (
          <View key={index} style={styles.skillPill}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'experience':
        return renderExperienceTab();
      case 'skills':
        return renderSkillsTab();
      default:
        return renderAboutTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {renderHeader()}
        {renderProfileHeader()}
        <Animated.View style={{ opacity: fadeAnim }}>
          {renderTabs()}
          {renderTabContent()}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  headerIcon: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  profileHeader: {
    marginBottom: 20,
  },
  coverPhoto: {
    width: '100%',
    height: 200,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    top: -100,
  },
  profileTitle: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  profileCompany: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileInfoContainer: {
    paddingHorizontal: 20,
    marginTop: 0,
    flexDirection: 'row',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 20,
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  followingButton: {
    backgroundColor: '#e0e7ff',
  },
  followingButtonText: {
    color: '#4f46e5',
  },
  messageButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#e0e7ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#4f46e5',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 15,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
    marginBottom: 10,
  },
  educationItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  educationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  educationDetails: {
    flex: 1,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  educationSchool: {
    fontSize: 14,
    color: '#4f46e5',
    marginTop: 2,
  },
  educationYear: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  contactText: {
    fontSize: 15,
    color: '#334155',
    marginLeft: 15,
  },
  experienceItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  experienceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  experienceDetails: {
    flex: 1,
  },
  experienceRole: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  experienceCompany: {
    fontSize: 14,
    color: '#4f46e5',
    marginTop: 2,
  },
  experienceDuration: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#334155',
    marginTop: 8,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skillPill: {
    backgroundColor: '#e0e7ff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  nameFooterContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'center',
  },
  nameFooterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
});

export default ProfileScreen;
