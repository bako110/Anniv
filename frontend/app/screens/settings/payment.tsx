import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PaymentScreen = () => {
  const params = useLocalSearchParams();
  const { planType, planName, price, billingCycle } = params;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [showAddCard, setShowAddCard] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // États pour les cartes de crédit
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // États pour l'adresse de facturation
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
  });

  // Cartes enregistrées (simulées)
  const savedCards = [
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true,
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '5555',
      expiryMonth: '10',
      expiryYear: '2026',
      isDefault: false,
    },
  ];

  const paymentMethods = [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: 'card',
      description: 'Visa, Mastercard, American Express',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'logo-paypal',
      description: 'Paiement sécurisé avec PayPal',
    },
    {
      id: 'apple',
      name: 'Apple Pay',
      icon: 'logo-apple',
      description: 'Paiement rapide avec Touch ID',
      available: Platform.OS === 'ios',
    },
    {
      id: 'google',
      name: 'Google Pay',
      icon: 'logo-google',
      description: 'Paiement rapide avec Google',
      available: Platform.OS === 'android',
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const match = cleaned.match(/\d{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateCard = () => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Erreur', 'Numéro de carte invalide');
      return false;
    }
    if (expiryDate.length < 5) {
      Alert.alert('Erreur', 'Date d\'expiration invalide');
      return false;
    }
    if (cvv.length < 3) {
      Alert.alert('Erreur', 'CVV invalide');
      return false;
    }
    if (cardholderName.trim().length < 2) {
      Alert.alert('Erreur', 'Nom du titulaire requis');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (selectedPaymentMethod === 'card' && !validateCard()) {
      return;
    }

    setProcessing(true);

    // Simulation du traitement du paiement
    setTimeout(() => {
      setProcessing(false);
      Alert.alert(
        '🎉 Paiement réussi !',
        `Votre abonnement ${planName} a été activé avec succès.`,
        [
          {
            text: 'Continuer',
            onPress: () => router.replace('/screens/social/home'),
          }
        ]
      );
    }, 2000);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Paiement</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderOrderSummary = () => (
    <View style={styles.orderSummary}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.summaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Récapitulatif de commande</Text>
        </View>
        
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan sélectionné</Text>
            <Text style={styles.summaryValue}>{planName}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Facturation</Text>
            <Text style={styles.summaryValue}>
              {billingCycle === 'monthly' ? 'Mensuelle' : 'Annuelle'}
            </Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>
              {price}€/{billingCycle === 'monthly' ? 'mois' : 'an'}
            </Text>
          </View>
          
          {billingCycle === 'yearly' && (
            <Text style={styles.savingsText}>
              Vous économisez {(price * 12 * 0.17).toFixed(2)}€ par an !
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💳 Méthode de paiement</Text>
      <View style={styles.sectionContent}>
        {paymentMethods
          .filter(method => method.available !== false)
          .map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodLeft}>
                <Ionicons 
                  name={method.icon} 
                  size={24} 
                  color={selectedPaymentMethod === method.id ? '#667eea' : '#64748b'} 
                />
                <View style={styles.paymentMethodInfo}>
                  <Text style={[
                    styles.paymentMethodName,
                    selectedPaymentMethod === method.id && styles.selectedText
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={styles.paymentMethodDescription}>
                    {method.description}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                selectedPaymentMethod === method.id && styles.selectedRadio
              ]}>
                {selectedPaymentMethod === method.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );

  const renderSavedCards = () => {
    if (selectedPaymentMethod !== 'card') return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💰 Cartes enregistrées</Text>
          <TouchableOpacity 
            style={styles.addCardButton}
            onPress={() => setShowAddCard(true)}
          >
            <Ionicons name="add" size={20} color="#667eea" />
            <Text style={styles.addCardText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionContent}>
          {savedCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.savedCard,
                card.isDefault && styles.defaultCard
              ]}
            >
              <View style={styles.cardLeft}>
                <Ionicons 
                  name={card.type === 'visa' ? 'card' : 'card'} 
                  size={24} 
                  color="#667eea" 
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
                  <Text style={styles.cardExpiry}>
                    Expire {card.expiryMonth}/{card.expiryYear}
                  </Text>
                </View>
              </View>
              {card.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Par défaut</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderAddCardModal = () => (
    <Modal
      visible={showAddCard}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddCard(false)}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ajouter une carte</Text>
            <TouchableOpacity onPress={() => setShowAddCard(false)}>
              <Text style={styles.modalSave}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Numéro de carte</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Date d'expiration</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="MM/AA"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom du titulaire</Text>
              <TextInput
                style={styles.textInput}
                placeholder="John Doe"
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setSaveCard(!saveCard)}
            >
              <View style={[styles.checkbox, saveCard && styles.checkedBox]}>
                {saveCard && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>Enregistrer cette carte</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  const renderBillingAddress = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📍 Adresse de facturation</Text>
      <View style={styles.sectionContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Adresse</Text>
          <TextInput
            style={styles.textInput}
            placeholder="123 Rue de la Paix"
            value={billingAddress.street}
            onChangeText={(text) => setBillingAddress(prev => ({ ...prev, street: text }))}
          />
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Ville</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Paris"
              value={billingAddress.city}
              onChangeText={(text) => setBillingAddress(prev => ({ ...prev, city: text }))}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Code postal</Text>
            <TextInput
              style={styles.textInput}
              placeholder="75000"
              value={billingAddress.postalCode}
              onChangeText={(text) => setBillingAddress(prev => ({ ...prev, postalCode: text }))}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderPaymentButton = () => (
    <View style={styles.paymentButtonContainer}>
      <TouchableOpacity
        style={[styles.paymentButton, processing && styles.processingButton]}
        onPress={handlePayment}
        disabled={processing}
      >
        <LinearGradient
          colors={processing ? ['#94a3b8', '#94a3b8'] : ['#667eea', '#764ba2']}
          style={styles.paymentButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {processing ? (
            <View style={styles.processingContainer}>
              <Text style={styles.paymentButtonText}>Traitement en cours...</Text>
            </View>
          ) : (
            <View style={styles.paymentButtonContent}>
              <Ionicons name="lock-closed" size={20} color="#fff" />
              <Text style={styles.paymentButtonText}>
                Payer {price}€ maintenant
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
      
      <Text style={styles.securityText}>
        🔒 Paiement 100% sécurisé • Données cryptées SSL
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderOrderSummary()}
        {renderPaymentMethods()}
        {renderSavedCards()}
        {selectedPaymentMethod === 'card' && renderBillingAddress()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderPaymentButton()}
      {renderAddCardModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerRight: {
    width: 34,
  },

  scrollView: {
    flex: 1,
  },

  // Order Summary
  orderSummary: {
    margin: 20,
    marginBottom: 15,
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 20,
  },
  summaryHeader: {
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  savingsText: {
    fontSize: 12,
    color: '#fbbf24',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },

  // Sections
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  // Payment Methods
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  selectedPaymentMethod: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
    borderWidth: 1,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  selectedText: {
    color: '#667eea',
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    borderColor: '#667eea',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },

  // Saved Cards
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  defaultCard: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
    borderWidth: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardInfo: {
    marginLeft: 12,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#64748b',
  },
  defaultBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },

  // Payment Button
  paymentButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  paymentButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  processingButton: {
    opacity: 0.7,
  },
  paymentButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  processingContainer: {
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },

  bottomSpacing: {
    height: 20,
  },
});

export default PaymentScreen;