import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const PrivacyScreen = () => {
  // États pour les paramètres de confidentialité
  const [profileVisibility, setProfileVisibility] = useState('friends'); // 'public', 'friends', 'private'
  const [showBirthday, setShowBirthday] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showLocation, setShowLocation] = useState(false);
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [showOnline, setShowOnline] = useState(true);
  const [allowEventInvites, setAllowEventInvites] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [personalizedAds, setPersonalizedAds] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [contactSync, setContactSync] = useState(true);
  const [photoTagging, setPhotoTagging] = useState(true);
  const [searchable, setSearchable] = useState(true);

  const handleBack = () => {
    router.back();
  };

  const handleDataDownload = () => {
    Alert.alert(
      'Télécharger mes données',
      'Nous préparerons un fichier avec toutes vos données. Vous recevrez un email avec le lien de téléchargement dans les 48h.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            Alert.alert('Demande enregistrée', 'Vous recevrez un email de confirmation sous peu.');
          }
        }
      ]
    );
  };

  const handleDataDeletion = () => {
    Alert.alert(
      '⚠️ Supprimer mes données',
      'Cette action supprimera définitivement toutes vos données personnelles de nos serveurs. Votre compte sera également supprimé.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Continuer', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmation finale',
              'Tapez "SUPPRIMER" pour confirmer la suppression définitive de toutes vos données.',
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Confirmer suppression', style: 'destructive' }
              ]
            );
          }
        }
      ]
    );
  };

  const getVisibilityText = (value) => {
    switch(value) {
      case 'public': return 'Public';
      case 'friends': return 'Amis uniquement';
      case 'private': return 'Privé';
      default: return 'Amis uniquement';
    }
  };

  const handleVisibilityChange = () => {
    Alert.alert(
      'Visibilité du profil',
      'Choisissez qui peut voir votre profil',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Public', onPress: () => setProfileVisibility('public') },
        { text: 'Amis uniquement', onPress: () => setProfileVisibility('friends') },
        { text: 'Privé', onPress: () => setProfileVisibility('private') }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Confidentialité</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderSection = (title, items, subtitle = null) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.settingItem,
              index === items.length - 1 && styles.lastItem
            ]}
            onPress={item.onPress}
            disabled={item.type === 'switch' && !item.onPress}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: item.iconColor || '#667eea' }]}>
                <Ionicons name={item.icon} size={18} color="white" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.settingRight}>
              {item.type === 'switch' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: '#d1d5db', true: '#667eea' }}
                  thumbColor={item.value ? '#ffffff' : '#f3f4f6'}
                />
              ) : item.type === 'select' ? (
                <View style={styles.selectValue}>
                  <Text style={styles.selectText}>{item.selectedValue}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const profilePrivacySettings = [
    {
      icon: 'eye',
      iconColor: '#667eea',
      title: 'Visibilité du profil',
      subtitle: 'Qui peut voir votre profil',
      type: 'select',
      selectedValue: getVisibilityText(profileVisibility),
      onPress: handleVisibilityChange
    },
    {
      icon: 'gift',
      iconColor: '#f56565',
      title: 'Afficher mon anniversaire',
      subtitle: 'Visible dans votre profil et le calendrier',
      type: 'switch',
      value: showBirthday,
      onValueChange: setShowBirthday
    },
    {
      icon: 'calendar',
      iconColor: '#ed8936',
      title: 'Afficher mes événements',
      subtitle: 'Événements publics créés par vous',
      type: 'switch',
      value: showEvents,
      onValueChange: setShowEvents
    },
    {
      icon: 'location',
      iconColor: '#059669',
      title: 'Partager ma localisation',
      subtitle: 'Visible dans les événements que vous créez',
      type: 'switch',
      value: showLocation,
      onValueChange: setShowLocation
    },
    {
      icon: 'search',
      iconColor: '#0891b2',
      title: 'Recherche par nom',
      subtitle: 'Permettre aux autres de vous trouver',
      type: 'switch',
      value: searchable,
      onValueChange: setSearchable
    }
  ];

  const socialPrivacySettings = [
    {
      icon: 'people',
      iconColor: '#48bb78',
      title: 'Demandes d\'amis',
      subtitle: 'Recevoir des demandes d\'amis',
      type: 'switch',
      value: allowFriendRequests,
      onValueChange: setAllowFriendRequests
    },
    {
      icon: 'mail',
      iconColor: '#8b5cf6',
      title: 'Invitations aux événements',
      subtitle: 'Recevoir des invitations d\'autres utilisateurs',
      type: 'switch',
      value: allowEventInvites,
      onValueChange: setAllowEventInvites
    },
    {
      icon: 'radio-button-on',
      iconColor: '#16a34a',
      title: 'Statut en ligne',
      subtitle: 'Afficher quand vous êtes connecté',
      type: 'switch',
      value: showOnline,
      onValueChange: setShowOnline
    },
    {
      icon: 'image',
      iconColor: '#7c3aed',
      title: 'Identification sur photos',
      subtitle: 'Permettre d\'être identifié sur les photos',
      type: 'switch',
      value: photoTagging,
      onValueChange: setPhotoTagging
    }
  ];

  const dataPrivacySettings = [
    {
      icon: 'phone-portrait',
      iconColor: '#0284c7',
      title: 'Synchroniser les contacts',
      subtitle: 'Trouver des amis dans vos contacts',
      type: 'switch',
      value: contactSync,
      onValueChange: setContactSync
    },
    {
      icon: 'location',
      iconColor: '#dc2626',
      title: 'Suivi de localisation',
      subtitle: 'Enregistrer votre position pour les recommandations',
      type: 'switch',
      value: locationTracking,
      onValueChange: setLocationTracking
    },
    {
      icon: 'analytics',
      iconColor: '#059669',
      title: 'Données d\'utilisation',
      subtitle: 'Collecter des données pour améliorer l\'app',
      type: 'switch',
      value: dataCollection,
      onValueChange: setDataCollection
    },
    {
      icon: 'bar-chart',
      iconColor: '#f59e0b',
      title: 'Partage analytique',
      subtitle: 'Données anonymisées pour les statistiques',
      type: 'switch',
      value: shareAnalytics,
      onValueChange: setShareAnalytics
    }
  ];

  const advertisingSettings = [
    {
      icon: 'megaphone',
      iconColor: '#8b5cf6',
      title: 'Publicités personnalisées',
      subtitle: 'Publicités basées sur vos intérêts',
      type: 'switch',
      value: personalizedAds,
      onValueChange: setPersonalizedAds
    },
    {
      icon: 'settings',
      iconColor: '#64748b',
      title: 'Préférences publicitaires',
      subtitle: 'Gérer vos centres d\'intérêt',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/AdPreferencesScreen')
    }
  ];

  const dataRightsSettings = [
    {
      icon: 'download',
      iconColor: '#0ea5e9',
      title: 'Télécharger mes données',
      subtitle: 'Obtenir une copie de toutes vos données',
      type: 'arrow',
      onPress: handleDataDownload
    },
    {
      icon: 'trash',
      iconColor: '#ef4444',
      title: 'Supprimer mes données',
      subtitle: 'Suppression définitive et irréversible',
      type: 'arrow',
      onPress: handleDataDeletion
    },
    {
      icon: 'document-text',
      iconColor: '#64748b',
      title: 'Politique de confidentialité',
      subtitle: 'Consulter notre politique complète',
      type: 'arrow',
      onPress: () => Linking.openURL('https://celebconnect.com/privacy')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Vos données, vos choix</Text>
          <Text style={styles.introText}>
            Contrôlez qui peut voir vos informations et comment nous utilisons vos données pour améliorer votre expérience CelebConnect.
          </Text>
        </View>

        {renderSection('👤 Profil et visibilité', profilePrivacySettings)}
        {renderSection('🤝 Interactions sociales', socialPrivacySettings)}
        {renderSection('📊 Données et suivi', dataPrivacySettings, 'Ces paramètres affectent la façon dont nous collectons et utilisons vos données')}
        {renderSection('📢 Publicité', advertisingSettings)}
        {renderSection('⚖️ Vos droits', dataRightsSettings, 'Conformément au RGPD, vous avez le droit de contrôler vos données personnelles')}
        
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            🔒 Toutes vos données sont chiffrées et sécurisées. Nous ne vendons jamais vos informations personnelles à des tiers.
          </Text>
          <Text style={styles.footerSubtext}>
            Dernière mise à jour de la politique : 15 juin 2025
          </Text>
        </View>

        <View style={{ height: 30 }} />
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
  introSection: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 18,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  settingRight: {
    marginLeft: 12,
  },
  selectValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginRight: 4,
  },
  footerSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  footerText: {
    fontSize: 13,
    color: '#0f172a',
    lineHeight: 18,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },
});

export default PrivacyScreen;