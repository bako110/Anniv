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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const { userId } = useLocalSearchParams();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [userData, setUserData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  // Données utilisateur simulées (remplacer par vos données réelles)
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Simulation de chargement des données utilisateur
    setTimeout(() => {
      setUserData({
        id: userId,
        name: 'Alexandre Martin',
        title: 'Développeur Full Stack | Expert React Native',
        company: 'Tech Innovations Inc.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        coverPhoto: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=300&fit=crop',
        connections: 423,
        followers: 1280,
        views: 5400,
        about: 'Développeur passionné avec 8 ans d\'expérience dans la création d\'applications mobiles et web. Spécialisé en React Native et Node.js. J\'aime résoudre des problèmes complexes et créer des expériences utilisateur exceptionnelles.',
        experience: [
          {
            id: 1,
            role: 'Développeur Full Stack Senior',
            company: 'Tech Innovations Inc.',
            duration: '2020 - Présent',
            description: 'Responsable du développement des applications mobiles et de l\'architecture backend.'
          },
          {
            id: 2,
            role: 'Développeur Frontend',
            company: 'Digital Solutions',
            duration: '2017 - 2020',
            description: 'Développement d\'interfaces utilisateur réactives pour applications web.'
          }
        ],
        education: [
          {
            id: 1,
            degree: 'Master en Informatique',
            school: 'Université de Paris',
            year: '2016'
          }
        ],
        skills: ['React Native', 'JavaScript', 'TypeScript', 'Node.js', 'GraphQL', 'Redux', 'Firebase'],
        contact: {
          email: 'alex.martin@example.com',
          phone: '+33 6 12 34 56 78',
          website: 'alexmartin-dev.com'
        }
      });
    }, 800);
  }, []);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    Animated.spring(fadeAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

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
      {/* Photo de couverture */}
      <Image 
        source={{ uri: userData?.coverPhoto || 'https://placehold.co/800x300' }} 
        style={styles.coverPhoto} 
      />
      
      {/* Photo de profil et infos */}
      <View style={styles.profileInfoContainer}>
        <Image 
          source={{ uri: userData?.avatar || 'https://placehold.co/200x200' }} 
          style={styles.profileAvatar} 
        />
        
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>{userData?.name || 'Chargement...'}</Text>
          <Text style={styles.profileTitle}>{userData?.title || ''}</Text>
          <Text style={styles.profileCompany}>{userData?.company || ''}</Text>
          
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{userData?.connections || '0'}</Text>
              <Text style={styles.statLabel}>Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{userData?.followers || '0'}</Text>
              <Text style={styles.statLabel}>Abonnés</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{userData?.views || '0'}</Text>
              <Text style={styles.statLabel}>Vues</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Boutons d'action */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, isFollowing && styles.followingButton]}
          onPress={handleFollow}
        >
          <Text style={[styles.actionButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? 'Suivi' : 'Suivre'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.messageButton}>
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'about' && styles.activeTab]}
        onPress={() => setActiveTab('about')}
      >
        <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>À propos</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'experience' && styles.activeTab]}
        onPress={() => setActiveTab('experience')}
      >
        <Text style={[styles.tabText, activeTab === 'experience' && styles.activeTabText]}>Expérience</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'skills' && styles.activeTab]}
        onPress={() => setActiveTab('skills')}
      >
        <Text style={[styles.tabText, activeTab === 'skills' && styles.activeTabText]}>Compétences</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>À propos</Text>
      <Text style={styles.aboutText}>{userData?.about || ''}</Text>
      
      <Text style={styles.sectionTitle}>Formation</Text>
      {userData?.education?.map(edu => (
        <View key={edu.id} style={styles.educationItem}>
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
      <TouchableOpacity 
        style={styles.contactItem}
        onPress={() => Linking.openURL(`mailto:${userData?.contact?.email}`)}
      >
        <Ionicons name="mail" size={20} color="#4f46e5" />
        <Text style={styles.contactText}>{userData?.contact?.email}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.contactItem}
        onPress={() => Linking.openURL(`tel:${userData?.contact?.phone}`)}
      >
        <Ionicons name="call" size={20} color="#4f46e5" />
        <Text style={styles.contactText}>{userData?.contact?.phone}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.contactItem}
        onPress={() => Linking.openURL(`https://${userData?.contact?.website}`)}
      >
        <Ionicons name="globe" size={20} color="#4f46e5" />
        <Text style={styles.contactText}>{userData?.contact?.website}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderExperienceTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Expérience professionnelle</Text>
      {userData?.experience?.map(exp => (
        <View key={exp.id} style={styles.experienceItem}>
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
        {userData?.skills?.map((skill, index) => (
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

  if (!userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Chargement du profil...</Text>
      </SafeAreaView>
    );
  }

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
  profileInfoContainer: {
    paddingHorizontal: 20,
    marginTop: -50,
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
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  profileTitle: {
    fontSize: 16,
    color: '#4f46e5',
    marginTop: 2,
  },
  profileCompany: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
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
});

export default ProfileScreen;