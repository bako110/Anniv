import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SubscriptionScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' ou 'yearly'

  const plans = {
    free: {
      name: 'Gratuit',
      price: 0,
      yearlyPrice: 0,
      color: ['#64748b', '#475569'],
      features: [
        'Jusqu\'à 10 contacts',
        'Rappels d\'anniversaires basiques',
        '3 événements par mois',
        'Support par email',
      ],
      limitations: [
        'Pas de personnalisation avancée',
        'Pas de sauvegarde cloud',
        'Publicités incluses',
      ]
    },
    premium: {
      name: 'Premium',
      price: 4.99,
      yearlyPrice: 49.99,
      color: ['#667eea', '#764ba2'],
      popular: true,
      features: [
        'Contacts illimités',
        'Rappels personnalisés avancés',
        'Événements illimités',
        'Thèmes et personnalisation',
        'Sauvegarde cloud automatique',
        'Partage d\'événements',
        'Support prioritaire 24/7',
        'Pas de publicités',
      ]
    },
    family: {
      name: 'Famille',
      price: 9.99,
      yearlyPrice: 99.99,
      color: ['#f093fb', '#f5576c'],
      features: [
        'Tout du plan Premium',
        'Jusqu\'à 6 comptes familiaux',
        'Calendrier familial partagé',
        'Gestion des cadeaux collaborative',
        'Notifications de groupe',
        'Historique familial',
        'Support dédié famille',
      ]
    }
  };

  const currentPlan = 'premium'; // Plan actuel de l'utilisateur

  const handleBack = () => {
    router.back();
  };

  const handleUpgrade = (planType) => {
    if (planType === 'free') {
      Alert.alert(
        'Plan Gratuit',
        'Êtes-vous sûr de vouloir rétrograder vers le plan gratuit ? Vous perdrez l\'accès aux fonctionnalités premium.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Confirmer',
            style: 'destructive',
            onPress: () => {
              // Logique de rétrogradation
              Alert.alert('Succès', 'Vous avez été rétrogradé vers le plan gratuit.');
            }
          }
        ]
      );
      return;
    }

    if (planType === currentPlan) {
      Alert.alert('Information', 'Vous utilisez déjà ce plan.');
      return;
    }

    // Redirection vers l'écran de paiement
    router.push({
      pathname: '/screens/settings/payment',
      params: {
        planType,
        planName: plans[planType].name,
        price: billingCycle === 'monthly' ? plans[planType].price : plans[planType].yearlyPrice,
        billingCycle
      }
    });
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Gérer l\'abonnement',
      'Choisissez une action :',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Modifier le plan', onPress: () => {} },
        { text: 'Suspendre', onPress: () => {} },
        { text: 'Annuler l\'abonnement', style: 'destructive', onPress: () => {} }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Abonnements</Text>
      <TouchableOpacity onPress={handleManageSubscription} style={styles.manageButton}>
        <Ionicons name="settings-outline" size={24} color="#667eea" />
      </TouchableOpacity>
    </View>
  );

  const renderBillingToggle = () => (
    <View style={styles.billingToggle}>
      <TouchableOpacity
        style={[
          styles.billingOption,
          billingCycle === 'monthly' && styles.billingOptionActive
        ]}
        onPress={() => setBillingCycle('monthly')}
      >
        <Text style={[
          styles.billingText,
          billingCycle === 'monthly' && styles.billingTextActive
        ]}>
          Mensuel
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.billingOption,
          billingCycle === 'yearly' && styles.billingOptionActive
        ]}
        onPress={() => setBillingCycle('yearly')}
      >
        <Text style={[
          styles.billingText,
          billingCycle === 'yearly' && styles.billingTextActive
        ]}>
          Annuel
        </Text>
        <View style={styles.saveBadge}>
          <Text style={styles.saveText}>-17%</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderPlanCard = (planKey, plan) => {
    const isCurrentPlan = planKey === currentPlan;
    const price = billingCycle === 'monthly' ? plan.price : plan.yearlyPrice;
    const priceText = price === 0 ? 'Gratuit' : `${price}€/${billingCycle === 'monthly' ? 'mois' : 'an'}`;

    return (
      <TouchableOpacity
        key={planKey}
        style={[
          styles.planCard,
          selectedPlan === planKey && styles.planCardSelected,
          isCurrentPlan && styles.currentPlanCard
        ]}
        onPress={() => setSelectedPlan(planKey)}
      >
        <LinearGradient
          colors={plan.color}
          style={styles.planGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.planHeader}>
            <View style={styles.planTitleContainer}>
              <Text style={styles.planName}>{plan.name}</Text>
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAIRE</Text>
                </View>
              )}
              {isCurrentPlan && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentText}>ACTUEL</Text>
                </View>
              )}
            </View>
            <Text style={styles.planPrice}>{priceText}</Text>
            {billingCycle === 'yearly' && price > 0 && (
              <Text style={styles.monthlyEquivalent}>
                {(price / 12).toFixed(2)}€/mois
              </Text>
            )}
          </View>
        </LinearGradient>

        <View style={styles.planContent}>
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>✨ Fonctionnalités incluses</Text>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {plan.limitations && (
            <View style={styles.limitationsSection}>
              <Text style={styles.limitationsTitle}>⚠️ Limitations</Text>
              {plan.limitations.map((limitation, index) => (
                <View key={index} style={styles.limitationItem}>
                  <Ionicons name="close-circle" size={16} color="#ef4444" />
                  <Text style={styles.limitationText}>{limitation}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.upgradeButton,
              isCurrentPlan && styles.currentPlanButton
            ]}
            onPress={() => handleUpgrade(planKey)}
          >
            <Text style={[
              styles.upgradeButtonText,
              isCurrentPlan && styles.currentPlanButtonText
            ]}>
              {isCurrentPlan ? 'Plan actuel' : 
               planKey === 'free' ? 'Rétrograder' : 
               `Passer à ${plan.name}`}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeatureComparison = () => (
    <View style={styles.comparisonSection}>
      <Text style={styles.comparisonTitle}>🔍 Comparaison détaillée</Text>
      <View style={styles.comparisonTable}>
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonHeaderText}>Fonctionnalité</Text>
          <Text style={styles.comparisonHeaderText}>Gratuit</Text>
          <Text style={styles.comparisonHeaderText}>Premium</Text>
          <Text style={styles.comparisonHeaderText}>Famille</Text>
        </View>
        
        {[
          { feature: 'Contacts', free: '10', premium: '∞', family: '∞' },
          { feature: 'Événements/mois', free: '3', premium: '∞', family: '∞' },
          { feature: 'Comptes familiaux', free: '1', premium: '1', family: '6' },
          { feature: 'Sauvegarde cloud', free: '❌', premium: '✅', family: '✅' },
          { feature: 'Thèmes premium', free: '❌', premium: '✅', family: '✅' },
          { feature: 'Support prioritaire', free: '❌', premium: '✅', family: '✅' },
        ].map((row, index) => (
          <View key={index} style={styles.comparisonRow}>
            <Text style={styles.comparisonFeature}>{row.feature}</Text>
            <Text style={styles.comparisonValue}>{row.free}</Text>
            <Text style={styles.comparisonValue}>{row.premium}</Text>
            <Text style={styles.comparisonValue}>{row.family}</Text>
          </View>
        ))}
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
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Choisissez votre plan</Text>
          <Text style={styles.introSubtitle}>
            Débloquez toutes les fonctionnalités de CelebConnect pour ne jamais manquer un moment important
          </Text>
        </View>

        {renderBillingToggle()}

        <View style={styles.plansContainer}>
          {Object.entries(plans).map(([key, plan]) => renderPlanCard(key, plan))}
        </View>

        {renderFeatureComparison()}

        <View style={styles.guaranteeSection}>
          <View style={styles.guaranteeIcon}>
            <Ionicons name="shield-checkmark" size={24} color="#16a34a" />
          </View>
          <Text style={styles.guaranteeTitle}>Garantie satisfait ou remboursé</Text>
          <Text style={styles.guaranteeText}>
            Essayez CelebConnect Premium sans risque. Annulation possible à tout moment dans les 7 premiers jours.
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
  manageButton: {
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
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  billingToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  billingOptionActive: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  billingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  billingTextActive: {
    color: '#667eea',
  },
  saveBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  saveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  planGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  planHeader: {
    alignItems: 'center',
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  popularBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  currentBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  monthlyEquivalent: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  planContent: {
    padding: 20,
  },
  featuresSection: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  limitationsSection: {
    marginBottom: 16,
  },
  limitationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  limitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: '#f1f5f9',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  currentPlanButtonText: {
    color: '#64748b',
  },
  comparisonSection: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonTable: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  comparisonHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  comparisonFeature: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  comparisonValue: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  guaranteeSection: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  guaranteeIcon: {
    backgroundColor: '#dcfce7',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  guaranteeText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SubscriptionScreen;