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
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SecurityScreen = () => {
  // États pour les paramètres de sécurité
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [autoLock, setAutoLock] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionManagement, setSessionManagement] = useState(true);
  const [deviceVerification, setDeviceVerification] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Données fictives pour les sessions actives
  const [activeSessions] = useState([
    {
      id: 1,
      device: 'iPhone 14 Pro',
      location: 'Paris, France',
      lastActive: '2 minutes',
      current: true,
      platform: 'iOS'
    },
    {
      id: 2,
      device: 'MacBook Pro',
      location: 'Paris, France',
      lastActive: '1 heure',
      current: false,
      platform: 'Web'
    },
    {
      id: 3,
      device: 'iPad Air',
      location: 'Lyon, France',
      lastActive: '2 jours',
      current: false,
      platform: 'iOS'
    }
  ]);

  const handleBack = () => {
    router.back();
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // Simuler la validation du mot de passe actuel
    if (currentPassword !== 'password123') {
      Alert.alert('Erreur', 'Mot de passe actuel incorrect');
      return;
    }

    Alert.alert(
      'Succès',
      'Votre mot de passe a été modifié avec succès',
      [{ text: 'OK', onPress: () => setShowPasswordModal(false) }]
    );
    
    // Réinitialiser les champs
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSetup2FA = () => {
    if (twoFactorEnabled) {
      Alert.alert(
        'Désactiver l\'authentification à deux facteurs',
        'Êtes-vous sûr de vouloir désactiver la 2FA ? Cela réduira la sécurité de votre compte.',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Désactiver', 
            style: 'destructive',
            onPress: () => setTwoFactorEnabled(false)
          }
        ]
      );
    } else {
      router.push('/screens/settings/setup2fa');
    }
  };

  const handleBiometricToggle = (value) => {
    if (value) {
      Alert.alert(
        'Activer la biométrie',
        'Voulez-vous utiliser Face ID/Touch ID pour sécuriser votre application ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Activer', 
            onPress: () => setBiometricEnabled(true)
          }
        ]
      );
    } else {
      setBiometricEnabled(false);
    }
  };

  const handleLogoutSession = (sessionId) => {
    Alert.alert(
      'Déconnecter l\'appareil',
      'Cette action déconnectera cet appareil de votre compte.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: () => {
            // Logique pour déconnecter la session
            Alert.alert('Session fermée', 'L\'appareil a été déconnecté avec succès.');
          }
        }
      ]
    );
  };

  const handleLogoutAllSessions = () => {
    Alert.alert(
      'Déconnecter tous les appareils',
      'Cette action déconnectera tous vos appareils sauf celui-ci. Vous devrez vous reconnecter sur chaque appareil.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter tout', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Sessions fermées', 'Tous les appareils ont été déconnectés.');
          }
        }
      ]
    );
  };

  const handleSecurityCheck = () => {
    Alert.alert(
      'Analyse de sécurité',
      'Votre compte sera analysé pour détecter d\'éventuelles vulnérabilités.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Analyser', 
          onPress: () => {
            // Simuler une analyse
            setTimeout(() => {
              Alert.alert(
                '✅ Analyse terminée',
                'Votre compte est sécurisé. Aucune vulnérabilité détectée.\n\n• Mot de passe fort ✓\n• Authentification 2FA ' + (twoFactorEnabled ? '✓' : '✗') + '\n• Connexions récentes normales ✓'
              );
            }, 2000);
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Sécurité</Text>
      <TouchableOpacity onPress={handleSecurityCheck} style={styles.headerAction}>
        <Ionicons name="shield-checkmark" size={24} color="#667eea" />
      </TouchableOpacity>
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
              ) : item.type === 'badge' ? (
                <View style={[styles.badge, { backgroundColor: item.badgeColor || '#dcfce7' }]}>
                  <Text style={[styles.badgeText, { color: item.badgeTextColor || '#16a34a' }]}>
                    {item.badgeText}
                  </Text>
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

  const renderActiveSessions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>📱 Appareils connectés</Text>
          <Text style={styles.sectionSubtitle}>Gérez les appareils ayant accès à votre compte</Text>
        </View>
        <TouchableOpacity style={styles.logoutAllButton} onPress={handleLogoutAllSessions}>
          <Text style={styles.logoutAllText}>Tout déconnecter</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.sectionContent}>
        {activeSessions.map((session, index) => (
          <View
            key={session.id}
            style={[
              styles.sessionItem,
              index === activeSessions.length - 1 && styles.lastItem
            ]}
          >
            <View style={styles.sessionLeft}>
              <View style={[styles.sessionIcon, { backgroundColor: session.current ? '#16a34a' : '#667eea' }]}>
                <Ionicons 
                  name={session.platform === 'iOS' ? 'phone-portrait' : session.platform === 'Web' ? 'desktop' : 'tablet-portrait'} 
                  size={18} 
                  color="white" 
                />
              </View>
              <View style={styles.sessionInfo}>
                <View style={styles.sessionTitleRow}>
                  <Text style={styles.sessionDevice}>{session.device}</Text>
                  {session.current && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Actuel</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sessionLocation}>{session.location}</Text>
                <Text style={styles.sessionTime}>Dernière activité: {session.lastActive}</Text>
              </View>
            </View>
            
            {!session.current && (
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={() => handleLogoutSession(session.id)}
              >
                <Ionicons name="log-out-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>
            <TouchableOpacity 
              onPress={() => setShowPasswordModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe actuel</Text>
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={true}
                placeholder="Entrez votre mot de passe actuel"
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={true}
                placeholder="Minimum 8 caractères"
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmer le nouveau mot de passe</Text>
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                placeholder="Répétez le nouveau mot de passe"
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <View style={styles.passwordTips}>
              <Text style={styles.tipsTitle}>💡 Conseils pour un mot de passe fort :</Text>
              <Text style={styles.tipText}>• Au moins 8 caractères</Text>
              <Text style={styles.tipText}>• Mélangez majuscules et minuscules</Text>
              <Text style={styles.tipText}>• Incluez des chiffres et des symboles</Text>
              <Text style={styles.tipText}>• Évitez les informations personnelles</Text>
            </View>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowPasswordModal(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handlePasswordSubmit}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const authenticationSettings = [
    {
      icon: 'key',
      iconColor: '#667eea',
      title: 'Changer le mot de passe',
      subtitle: 'Dernière modification: il y a 2 mois',
      type: 'arrow',
      onPress: handleChangePassword
    },
    {
      icon: 'shield-checkmark',
      iconColor: twoFactorEnabled ? '#16a34a' : '#f59e0b',
      title: 'Authentification à deux facteurs',
      subtitle: twoFactorEnabled ? 'Activée - Votre compte est protégé' : 'Recommandé pour sécuriser votre compte',
      type: 'badge',
      badgeText: twoFactorEnabled ? 'Activé' : 'Inactif',
      badgeColor: twoFactorEnabled ? '#dcfce7' : '#fef3c7',
      badgeTextColor: twoFactorEnabled ? '#16a34a' : '#d97706',
      onPress: handleSetup2FA
    },
    {
      icon: 'finger-print',
      iconColor: '#8b5cf6',
      title: 'Biométrie (Face ID / Touch ID)',
      subtitle: 'Déverrouillage rapide et sécurisé',
      type: 'switch',
      value: biometricEnabled,
      onValueChange: handleBiometricToggle
    }
  ];

  const appSecuritySettings = [
    {
      icon: 'lock-closed',
      iconColor: '#059669',
      title: 'Verrouillage automatique',
      subtitle: 'Verrouiller l\'app après 5 minutes d\'inactivité',
      type: 'switch',
      value: autoLock,
      onValueChange: setAutoLock
    },
    {
      icon: 'notifications',
      iconColor: '#0ea5e9',
      title: 'Alertes de connexion',
      subtitle: 'Recevoir une notification à chaque connexion',
      type: 'switch',
      value: loginAlerts,
      onValueChange: setLoginAlerts
    },
    {
      icon: 'checkmark-circle',
      iconColor: '#7c3aed',
      title: 'Vérification des appareils',
      subtitle: 'Approuver les nouveaux appareils',
      type: 'switch',
      value: deviceVerification,
      onValueChange: setDeviceVerification
    }
  ];

  const securityToolsSettings = [
    {
      icon: 'document-text',
      iconColor: '#64748b',
      title: 'Journal d\'activité',
      subtitle: 'Voir l\'historique de vos connexions',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/ActivityLogScreen')
    },
    {
      icon: 'bug',
      iconColor: '#ef4444',
      title: 'Signaler un problème de sécurité',
      subtitle: 'Contactez notre équipe de sécurité',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/SecurityReportScreen')
    },
    {
      icon: 'information-circle',
      iconColor: '#0891b2',
      title: 'Conseils de sécurité',
      subtitle: 'Bonnes pratiques pour protéger votre compte',
      type: 'arrow',
      onPress: () => router.push('/screens/settings/SecurityTipsScreen')
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
          <Text style={styles.introTitle}>🔐 Sécurité de votre compte</Text>
          <Text style={styles.introText}>
            Protégez votre compte CelebConnect avec ces paramètres de sécurité avancés. Nous recommandons d'activer l'authentification à deux facteurs.
          </Text>
        </View>

        {renderSection('🔑 Authentification', authenticationSettings)}
        {renderSection('📱 Sécurité de l\'application', appSecuritySettings)}
        {renderActiveSessions()}
        {renderSection('🛠️ Outils de sécurité', securityToolsSettings)}
        
        <View style={styles.securityScoreSection}>
          <Text style={styles.securityScoreTitle}>Score de sécurité</Text>
          <View style={styles.securityScoreBar}>
            <View style={[styles.securityScoreFill, { width: '75%' }]} />
          </View>
          <Text style={styles.securityScoreText}>75/100 - Bien protégé</Text>
          <TouchableOpacity style={styles.improveButton} onPress={handleSecurityCheck}>
            <Text style={styles.improveButtonText}>Améliorer la sécurité</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
      
      {renderPasswordModal()}
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
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    lineHeight: 18,
  },
  logoutAllButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutAllText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  sessionDevice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 8,
  },
  currentBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
  },
  sessionLocation: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  logoutButton: {
    padding: 8,
  },
  securityScoreSection: {
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
  securityScoreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  securityScoreBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  securityScoreFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  securityScoreText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  improveButton: {
    backgroundColor: '#667eea',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  improveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f9fafb',
  },
  passwordTips: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
 saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#667eea',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default SecurityScreen;