import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Setup2FAScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [method, setMethod] = useState(''); // 'app' ou 'sms'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);

  // Code QR simulé et clé secrète
  const secretKey = 'JBSWY3DPEHPK3PXP';
  const qrCodeData = `otpauth://totp/CelebConnect:user@example.com?secret=${secretKey}&issuer=CelebConnect`;

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleMethodSelection = (selectedMethod) => {
    setMethod(selectedMethod);
    setCurrentStep(2);
  };

  const handlePhoneSubmit = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }
    
    setIsLoading(true);
    // Simuler l'envoi du SMS
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(3);
      Alert.alert('SMS envoyé', 'Un code de vérification a été envoyé à votre numéro');
    }, 2000);
  };

  const handleAppSetup = () => {
    setQrCodeGenerated(true);
    setCurrentStep(3);
  };

  const handleCodeVerification = () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer un code à 6 chiffres valide');
      return;
    }

    setIsLoading(true);
    // Simuler la vérification
    setTimeout(() => {
      setIsLoading(false);
      // Générer les codes de sauvegarde
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      setCurrentStep(4);
    }, 1500);
  };

  const handleComplete = () => {
    Alert.alert(
      'Configuration terminée!',
      'L\'authentification à deux facteurs a été activée avec succès sur votre compte.',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Configuration 2FA</Text>
      <View style={styles.headerAction} />
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>Étape {currentStep} sur 4</Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>🔐 Choisissez votre méthode</Text>
        <Text style={styles.stepDescription}>
          Sélectionnez comment vous souhaitez recevoir vos codes de vérification
        </Text>
      </View>

      <View style={styles.methodsContainer}>
        <TouchableOpacity
          style={styles.methodCard}
          onPress={() => handleMethodSelection('app')}
        >
          <View style={styles.methodIcon}>
            <Ionicons name="phone-portrait" size={32} color="#667eea" />
          </View>
          <Text style={styles.methodTitle}>Application d'authentification</Text>
          <Text style={styles.methodDescription}>
            Utilisez Google Authenticator, Authy ou une autre app compatible
          </Text>
          <View style={styles.methodBadge}>
            <Text style={styles.methodBadgeText}>Recommandé</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.methodCard}
          onPress={() => handleMethodSelection('sms')}
        >
          <View style={styles.methodIcon}>
            <Ionicons name="chatbubble" size={32} color="#059669" />
          </View>
          <Text style={styles.methodTitle}>SMS</Text>
          <Text style={styles.methodDescription}>
            Recevez les codes par message texte sur votre téléphone
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#0891b2" />
        <Text style={styles.infoText}>
          L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => {
    if (method === 'app') {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>📱 Configuration de l'application</Text>
            <Text style={styles.stepDescription}>
              Suivez ces étapes pour configurer votre application d'authentification
            </Text>
          </View>

          <View style={styles.instructionsContainer}>
            <View style={styles.instruction}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Téléchargez une application d'authentification comme Google Authenticator ou Authy
              </Text>
            </View>

            <View style={styles.instruction}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Ouvrez l'application et ajoutez un nouveau compte
              </Text>
            </View>

            <View style={styles.instruction}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Scannez le code QR ou saisissez manuellement la clé secrète
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleAppSetup}>
            <Text style={styles.primaryButtonText}>J'ai installé l'application</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>📱 Numéro de téléphone</Text>
            <Text style={styles.stepDescription}>
              Entrez votre numéro de téléphone pour recevoir les codes par SMS
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+33 6 12 34 56 78"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>
              Assurez-vous que votre téléphone peut recevoir des SMS. Des frais peuvent s'appliquer.
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handlePhoneSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>Envoyer le code SMS</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderStep3 = () => {
    if (method === 'app') {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>📷 Scannez le code QR</Text>
            <Text style={styles.stepDescription}>
              Utilisez votre application d'authentification pour scanner ce code
            </Text>
          </View>

          <View style={styles.qrContainer}>
            <View style={styles.qrCodePlaceholder}>
              <Ionicons name="qr-code" size={120} color="#667eea" />
              <Text style={styles.qrCodeText}>Code QR</Text>
            </View>
          </View>

          <View style={styles.secretKeyContainer}>
            <Text style={styles.secretKeyLabel}>Ou saisissez cette clé manuellement :</Text>
            <View style={styles.secretKeyBox}>
              <Text style={styles.secretKeyText}>{secretKey}</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Ionicons name="copy" size={16} color="#667eea" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Code de vérification (6 chiffres)</Text>
            <TextInput
              style={styles.textInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="000000"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handleCodeVerification}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>Vérifier le code</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>💬 Vérification SMS</Text>
            <Text style={styles.stepDescription}>
              Entrez le code à 6 chiffres envoyé au {phoneNumber}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Code de vérification</Text>
            <TextInput
              style={styles.textInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="000000"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <TouchableOpacity style={styles.resendButton}>
            <Text style={styles.resendButtonText}>Renvoyer le code</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handleCodeVerification}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>Vérifier le code</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>🔑 Codes de sauvegarde</Text>
        <Text style={styles.stepDescription}>
          Sauvegardez ces codes en lieu sûr. Ils vous permettront d'accéder à votre compte si vous perdez votre téléphone.
        </Text>
      </View>

      <View style={styles.backupCodesContainer}>
        <View style={styles.backupCodesGrid}>
          {backupCodes.map((code, index) => (
            <View key={index} style={styles.backupCodeItem}>
              <Text style={styles.backupCodeText}>{code}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.warningBox}>
        <Ionicons name="warning" size={20} color="#f59e0b" />
        <Text style={styles.warningText}>
          Chaque code ne peut être utilisé qu'une seule fois. Conservez-les dans un endroit sûr et secret.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="download" size={16} color="#667eea" />
          <Text style={styles.secondaryButtonText}>Télécharger</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
          <Text style={styles.primaryButtonText}>Terminer la configuration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderProgressBar()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
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
  headerAction: {
    width: 40,
    height: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  stepHeader: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  methodsContainer: {
    marginBottom: 30,
  },
  methodCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  methodIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#f1f5f9',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  methodBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  methodBadgeText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0891b2',
  },
  infoText: {
    fontSize: 14,
    color: '#0f172a',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#0f172a',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  instructionsContainer: {
    marginBottom: 30,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: 'white',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  qrCodeText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  secretKeyContainer: {
    marginBottom: 30,
  },
  secretKeyLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  secretKeyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  secretKeyText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#1e293b',
    flex: 1,
  },
  copyButton: {
    padding: 8,
  },
  backupCodesContainer: {
    marginBottom: 30,
  },
  backupCodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  backupCodeItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  backupCodeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#1e293b',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667eea',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default Setup2FAScreen;