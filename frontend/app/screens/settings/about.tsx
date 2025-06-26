import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AboutScreen = () => {
  const appInfo = {
    name: 'CelebConnect',
    version: '2.1.0',
    buildNumber: '2024.12.15',
    description: 'L\'application parfaite pour organiser vos événements et ne jamais oublier un anniversaire.',
    developer: 'CelebConnect Team',
    email: 'contact@celebconnect.com',
    website: 'https://celebconnect.com',
    founded: '2023',
    users: '100K+',
    rating: '4.8'
  };

  const teamMembers = [
    {
      name: 'Robert Bako',
      role: 'CEO & Fondatrice',
      icon: 'person',
      color: '#667eea'
    },
    {
      name: 'Ozias Belemsobgo',
      role: 'CTO',
      icon: 'code-slash',
      color: '#48bb78'
    },
    {
      name: 'Idrissa Ouédraogo',
      role: 'Head of Design',
      icon: 'color-palette',
      color: '#ed8936'
    },
    {
      name: 'Fatime Ouédraogo',
      role: 'Product Manager',
      icon: 'rocket',
      color: '#9f7aea'
    }
  ];

  const features = [
    {
      icon: 'notifications',
      title: 'Rappels intelligents',
      description: 'Ne ratez plus jamais un anniversaire',
      color: '#667eea'
    },
    {
      icon: 'calendar',
      title: 'Gestion d\'événements',
      description: 'Organisez tous vos événements',
      color: '#48bb78'
    },
    {
      icon: 'people',
      title: 'Réseau social',
      description: 'Connectez-vous avec vos proches',
      color: '#ed8936'
    },
    {
      icon: 'gift',
      title: 'Idées cadeaux',
      description: 'Suggestions personnalisées',
      color: '#9f7aea'
    }
  ];

  const socialLinks = [
    {
      platform: 'Instagram',
      icon: 'logo-instagram',
      url: 'https://instagram.com/celebconnect',
      color: '#E4405F'
    },
    {
      platform: 'Twitter',
      icon: 'logo-twitter',
      url: 'https://twitter.com/celebconnect',
      color: '#1DA1F2'
    },
    {
      platform: 'Facebook',
      icon: 'logo-facebook',
      url: 'https://facebook.com/celebconnect',
      color: '#1877F2'
    },
    {
      platform: 'LinkedIn',
      icon: 'logo-linkedin',
      url: 'https://linkedin.com/company/celebconnect',
      color: '#0A66C2'
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleWebsite = () => {
    Linking.openURL(appInfo.website);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${appInfo.email}`);
  };

  const handleSocialLink = (url) => {
    Linking.openURL(url);
  };

  const handleRateApp = () => {
    Linking.openURL('https://apps.apple.com/app/celebconnect');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>À propos</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderAppInfo = () => (
    <View style={styles.appInfoSection}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.appInfoGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.appIconContainer}>
          <LinearGradient
            colors={['#ffffff', '#f0f9ff']}
            style={styles.appIcon}
          >
            <Ionicons name="gift" size={40} color="#667eea" />
          </LinearGradient>
        </View>
        
        <Text style={styles.appName}>{appInfo.name}</Text>
        <Text style={styles.appDescription}>{appInfo.description}</Text>
        
        <View style={styles.appStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{appInfo.users}</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{appInfo.rating}</Text>
            <Text style={styles.statLabel}>Note App Store</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{appInfo.founded}</Text>
            <Text style={styles.statLabel}>Fondée en</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderVersionInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📱 Informations de l'application</Text>
      <View style={styles.sectionContent}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>{appInfo.version}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>{appInfo.buildNumber}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Développeur</Text>
          <Text style={styles.infoValue}>{appInfo.developer}</Text>
        </View>
        <TouchableOpacity style={styles.infoItem} onPress={handleWebsite}>
          <Text style={styles.infoLabel}>Site web</Text>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>celebconnect.com</Text>
            <Ionicons name="open-outline" size={16} color="#667eea" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>✨ Fonctionnalités principales</Text>
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
              <Ionicons name={feature.icon} size={24} color="white" />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTeam = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>👥 Notre équipe</Text>
      <View style={styles.sectionContent}>
        {teamMembers.map((member, index) => (
          <View key={index} style={[styles.teamMember, index === teamMembers.length - 1 && styles.lastItem]}>
            <View style={[styles.memberIcon, { backgroundColor: member.color }]}>
              <Ionicons name={member.icon} size={20} color="white" />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSocialLinks = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🌐 Suivez-nous</Text>
      <View style={styles.socialContainer}>
        {socialLinks.map((social, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.socialButton, { backgroundColor: social.color }]}
            onPress={() => handleSocialLink(social.url)}
          >
            <Ionicons name={social.icon} size={24} color="white" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎯 Actions</Text>
      <View style={styles.sectionContent}>
        <TouchableOpacity style={styles.actionItem} onPress={handleRateApp}>
          <View style={styles.actionLeft}>
            <View style={[styles.actionIcon, { backgroundColor: '#fbbf24' }]}>
              <Ionicons name="star" size={20} color="white" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Noter l'application</Text>
              <Text style={styles.actionSubtitle}>Donnez votre avis sur l'App Store</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionItem, styles.lastItem]} onPress={handleEmail}>
          <View style={styles.actionLeft}>
            <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="mail" size={20} color="white" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Nous contacter</Text>
              <Text style={styles.actionSubtitle}>{appInfo.email}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Fait avec ❤️ par l'équipe CelebConnect
      </Text>
      <Text style={styles.footerSubtext}>
        © 2023-2024 CelebConnect. Tous droits réservés.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderAppInfo()}
        {renderVersionInfo()}
        {renderFeatures()}
        {renderTeam()}
        {renderSocialLinks()}
        {renderActions()}
        {renderFooter()}
      </ScrollView>
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
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  appInfoSection: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  appInfoGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  appIconContainer: {
    marginBottom: 16,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  appDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  appStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '600',
    marginRight: 6,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  memberIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 13,
    color: '#64748b',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default AboutScreen;