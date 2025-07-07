import React, { useState, useEffect } from 'react';
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
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { logout } from '../../../services/auth';
import { getProfile } from '../../../services/profile';
import { STORAGE_KEYS } from '@/constants/storageKeys';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [birthdayReminders, setBirthdayReminders] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [socialNotifications, setSocialNotifications] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  const [user, setUser] = useState({
    name: 'Chargement...',
    email: '',
    phone: '',
    plan: 'Gratuit',
    version: '2.1.0',
  });

  const getUserIdentifier = async () => {
    try {
      const sources = [
        'userEmail',
        'userPhone',
        'userIdentifier',
        'userInfo',
        'loginCredentials',
      ];

      for (const source of sources) {
        const data = await AsyncStorage.getItem(source);
        if (data) {
          let identifier = null;
          if (source === 'userEmail' || source === 'userPhone' || source === 'userIdentifier') {
            identifier = data;
          } else {
            try {
              const parsed = JSON.parse(data);
              identifier = parsed.email || parsed.phone || parsed.identifier;
            } catch (err) {
              console.warn(`Erreur parsing ${source}:`, err);
              continue;
            }
          }

          if (identifier) {
            const formatted = formatIdentifier(identifier);
            if (formatted) return formatted;
          }
        }
      }

      throw new Error('Aucun identifiant valide trouvé');
    } catch (error) {
      console.error('Erreur getUserIdentifier:', error);
      return null;
    }
  };

  const formatIdentifier = (identifier) => {
    const clean = identifier.toString().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    const cleanPhone = clean.replace(/[\s\-\(\)]/g, '');

    if (emailRegex.test(clean)) return { type: 'email', value: clean.toLowerCase() };
    if (phoneRegex.test(clean) && cleanPhone.length >= 8) return { type: 'phone', value: cleanPhone };
    return null;
  };

  const getDefaultName = (idObj) => {
    if (idObj?.type === 'email') return idObj.value.split('@')[0];
    if (idObj?.type === 'phone') return `Utilisateur ${idObj.value.slice(-4)}`;
    return 'Utilisateur';
  };

  const loadUserProfile = async () => {
    try {
      const identifier = await getUserIdentifier();
      if (identifier) {
        const profile = await getProfile(identifier.value);
        setUser({
          name: profile.first_name || getDefaultName(identifier),
          email: profile.email || (identifier.type === 'email' ? identifier.value : ''),
          phone: profile.phone || (identifier.type === 'phone' ? identifier.value : ''),
          plan: profile.premium ? 'Premium' : 'Gratuit',
          version: '2.1.0',
        });
      } else {
        setUser({ name: 'Utilisateur', email: '', phone: '', plan: 'Gratuit', version: '2.1.0' });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      setUser({ name: 'Utilisateur', email: '', phone: '', plan: 'Gratuit', version: '2.1.0' });
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

              if (token) {
                try {
                  await logout(token);
                } catch (apiError) {
                  console.warn('Erreur API logout:', apiError.message);
                }
              }

              // VIDER COMPLÈTEMENT AsyncStorage - supprime toutes les données
              await AsyncStorage.clear();

              console.log('AsyncStorage vidé complètement lors de la déconnexion');

              // Redirection après déconnexion
              router.replace('/screens/auth/login');
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmation finale',
              'Tapez "SUPPRIMER" pour confirmer la suppression de votre compte.',
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Confirmer', style: 'destructive' }
              ]
            );
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Découvrez CelebConnect, l\'app parfaite pour organiser vos événements et ne jamais oublier un anniversaire ! 🎉',
        url: 'https://celebconnect.app'
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@celebconnect.com?subject=Support CelebConnect');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://celebconnect.com/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://celebconnect.com/terms');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Paramètres</Text>
      <View style={styles.headerRight} />
    </View>
  );

    const renderUserSection = () => (
    <View style={styles.userSection}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.userGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>{user.name.charAt(0)}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userPlan}>
              <Ionicons name="diamond" size={12} color="#fbbf24" />
              <Text style={styles.userPlanText}>Plan {user.plan}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => router.push('/screens/profile/editprofile')}
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );


  const renderSettingsSection = (title, items) => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
                <Ionicons name={item.icon} size={20} color="white" />
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
              ) : item.type === 'badge' ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badgeText}</Text>
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

  const notificationSettings = [
    {
      icon: 'notifications',
      iconColor: '#667eea',
      title: 'Notifications push',
      subtitle: 'Recevoir les notifications sur votre appareil',
      type: 'switch',
      value: notificationsEnabled,
      onValueChange: setNotificationsEnabled
    },
    {
      icon: 'gift',
      iconColor: '#f56565',
      title: 'Rappels d\'anniversaires',
      subtitle: '3 jours avant chaque anniversaire',
      type: 'switch',
      value: birthdayReminders,
      onValueChange: setBirthdayReminders
    },
    {
      icon: 'calendar',
      iconColor: '#ed8936',
      title: 'Rappels d\'événements',
      subtitle: '1 jour avant chaque événement',
      type: 'switch',
      value: eventReminders,
      onValueChange: setEventReminders
    },
    {
      icon: 'people',
      iconColor: '#48bb78',
      title: 'Activité sociale',
      subtitle: 'Nouvelles invitations et interactions',
      type: 'switch',
      value: socialNotifications,
      onValueChange: setSocialNotifications
    }
  ];

  const appearanceSettings = [
    {
      icon: 'moon',
      iconColor: '#6b46c1',
      title: 'Mode sombre',
      subtitle: 'Activer le thème sombre',
      type: 'switch',
      value: darkModeEnabled,
      onValueChange: setDarkModeEnabled
    },
    {
      icon: 'language',
      iconColor: '#0891b2',
      title: 'Langue',
      subtitle: 'Français',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/language')
    },
    {
      icon: 'color-palette',
      iconColor: '#7c3aed',
      title: 'Thème et couleurs',
      subtitle: 'Personnaliser l\'apparence',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/theme')
    }
  ];

  const privacySettings = [
    {
      icon: 'location',
      iconColor: '#059669',
      title: 'Localisation',
      subtitle: 'Permettre l\'accès à votre position',
      type: 'switch',
      value: locationEnabled,
      onValueChange: setLocationEnabled
    },
    {
      icon: 'cloud-upload',
      iconColor: '#0284c7',
      title: 'Sauvegarde automatique',
      subtitle: 'Sauvegarder vos données dans le cloud',
      type: 'switch',
      value: autoBackup,
      onValueChange: setAutoBackup
    },
    {
      icon: 'shield-checkmark',
      iconColor: '#16a34a',
      title: 'Confidentialité',
      subtitle: 'Gérer vos paramètres de confidentialité',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/privacy')
    },
    {
      icon: 'lock-closed',
      iconColor: '#dc2626',
      title: 'Sécurité',
      subtitle: 'Mot de passe et authentification',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/security')
    }
  ];

  const accountSettings = [
    {
      icon: 'diamond',
      iconColor: '#fbbf24',
      title: 'Plan Premium',
      subtitle: 'Gérer votre abonnement',
      type: 'badge',
      badgeText: 'Actif',
      onPress: () => router.push('/screens/settings/subscription')
    },
    {
      icon: 'card',
      iconColor: '#8b5cf6',
      title: 'Moyens de paiement',
      subtitle: 'Cartes et méthodes de paiement',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/payment')
    },
    {
      icon: 'download',
      iconColor: '#06b6d4',
      title: 'Exporter mes données',
      subtitle: 'Télécharger une copie de vos données',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/export')
    }
  ];

  const supportSettings = [
    {
      icon: 'help-circle',
      iconColor: '#0ea5e9',
      title: 'Centre d\'aide',
      subtitle: 'FAQ et guides d\'utilisation',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/help')
    },
    {
      icon: 'mail',
      iconColor: '#8b5cf6',
      title: 'Contacter le support',
      subtitle: 'support@celebconnect.com',
      type: 'arrow',
      onPress: handleSupport
    },
    {
      icon: 'share',
      iconColor: '#f59e0b',
      title: 'Partager l\'app',
      subtitle: 'Invitez vos amis à découvrir CelebConnect',
      type: 'arrow',
      onPress: handleShare
    },
    {
      icon: 'star',
      iconColor: '#eab308',
      title: 'Noter l\'application',
      subtitle: 'Donnez votre avis sur l\'App Store',
      type: 'arrow',
      onPress: () => Linking.openURL('https://apps.apple.com/app/celebconnect')
    }
  ];

  const legalSettings = [
    {
      icon: 'document-text',
      iconColor: '#64748b',
      title: 'Conditions d\'utilisation',
      type: 'arrow',
      onPress: handleTerms
    },
    {
      icon: 'shield',
      iconColor: '#64748b',
      title: 'Politique de confidentialité',
      type: 'arrow',
      onPress: handlePrivacyPolicy
    },
    {
      icon: 'information-circle',
      iconColor: '#64748b',
      title: 'À propos',
      subtitle: `Version ${user.version}`,
      type: 'arrow',
      onPress: () => router.push('/screens/settings/about')
    }
  ];

  const renderDangerZone = () => (
    <View style={styles.dangerZone}>
      <Text style={styles.dangerTitle}>Zone de danger</Text>
      <View style={styles.sectionContent}>
        <TouchableOpacity style={styles.dangerItem} onPress={handleLogout}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#f97316' }]}>
              <Ionicons name="log-out-outline" size={20} color="white" />
            </View>
            <Text style={[styles.settingTitle, { color: '#f97316' }]}>Se déconnecter</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.dangerItem, styles.lastItem]} onPress={handleDeleteAccount}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#ef4444' }]}>
              <Ionicons name="trash-outline" size={20} color="white" />
            </View>
            <Text style={[styles.settingTitle, { color: '#ef4444' }]}>Supprimer le compte</Text>
          </View>
        </TouchableOpacity>
      </View>
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
        {renderUserSection()}
        
        {renderSettingsSection('🔔 Notifications', notificationSettings)}
        {renderSettingsSection('🎨 Apparence', appearanceSettings)}
        {renderSettingsSection('🔒 Confidentialité et sécurité', privacySettings)}
        {renderSettingsSection('💎 Compte', accountSettings)}
        {renderSettingsSection('🆘 Support', supportSettings)}
        {renderSettingsSection('📋 Légal', legalSettings)}
        
        {renderDangerZone()}
        
        {/* Espace supplémentaire en bas */}
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
  userSection: {
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
  userGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  userPlan: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPlanText: {
    fontSize: 12,
    color: '#fbbf24',
    marginLeft: 4,
    fontWeight: '600',
  },
  editProfileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsSection: {
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  settingRight: {
    marginLeft: 12,
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  dangerZone: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
});

export default SettingsScreen;