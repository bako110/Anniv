import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const HelpScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const quickActions = [
    {
      icon: 'chatbubbles',
      title: 'Chat en direct',
      subtitle: 'Parlez à notre équipe',
      color: '#667eea',
      action: () => handleLiveChat()
    },
    {
      icon: 'mail',
      title: 'Envoyer un email',
      subtitle: 'support@celebconnect.com',
      color: '#48bb78',
      action: () => handleEmail()
    },
    {
      icon: 'call',
      title: 'Nous appeler',
      subtitle: '+33 1 23 45 67 89',
      color: '#ed8936',
      action: () => handlePhoneCall()
    },
    {
      icon: 'videocam',
      title: 'Tutoriels vidéo',
      subtitle: 'Guides visuels',
      color: '#9f7aea',
      action: () => handleVideoTutorials()
    }
  ];

  const helpCategories = [
    {
      id: 'getting-started',
      icon: 'rocket',
      title: 'Prise en main',
      color: '#667eea',
      faqs: [
        {
          question: 'Comment créer mon premier événement ?',
          answer: 'Pour créer votre premier événement :\n1. Appuyez sur le bouton "+" en bas de l\'écran\n2. Sélectionnez "Nouvel événement"\n3. Remplissez les informations (nom, date, lieu)\n4. Ajoutez des invités depuis vos contacts\n5. Personnalisez avec des photos et des notes\n6. Appuyez sur "Créer" pour finaliser'
        },
        {
          question: 'Comment ajouter des contacts ?',
          answer: 'Vous pouvez ajouter des contacts de plusieurs façons :\n• Importer depuis votre carnet d\'adresses\n• Ajouter manuellement en appuyant sur "Ajouter un contact"\n• Scanner un code QR partagé par un ami\n• Inviter par email ou SMS\n• Synchroniser avec vos réseaux sociaux'
        },
        {
          question: 'Comment configurer les rappels ?',
          answer: 'Pour configurer vos rappels :\n1. Allez dans Paramètres > Notifications\n2. Activez les types de rappels souhaités\n3. Choisissez quand être notifié (1 jour, 1 semaine avant...)\n4. Personnalisez le message de rappel\n5. Testez vos paramètres avec un rappel test'
        }
      ]
    },
    {
      id: 'events',
      icon: 'calendar',
      title: 'Gestion des événements',
      color: '#48bb78',
      faqs: [
        {
          question: 'Comment modifier un événement existant ?',
          answer: 'Pour modifier un événement :\n1. Ouvrez l\'événement depuis votre calendrier\n2. Appuyez sur "Modifier" en haut à droite\n3. Changez les informations nécessaires\n4. Appuyez sur "Sauvegarder"\n5. Les invités seront automatiquement notifiés des changements'
        },
        {
          question: 'Puis-je créer des événements récurrents ?',
          answer: 'Oui ! Lors de la création d\'un événement :\n1. Activez l\'option "Répéter"\n2. Choisissez la fréquence (chaque semaine, mois, année)\n3. Définissez une date de fin ou un nombre d\'occurrences\n4. L\'événement sera automatiquement dupliqué selon vos paramètres'
        },
        {
          question: 'Comment annuler un événement ?',
          answer: 'Pour annuler un événement :\n1. Ouvrez l\'événement\n2. Appuyez sur "Options" puis "Annuler l\'événement"\n3. Choisissez si vous voulez notifier les invités\n4. Ajoutez un message d\'explication (optionnel)\n5. Confirmez l\'annulation'
        }
      ]
    },
    {
      id: 'notifications',
      icon: 'notifications',
      title: 'Notifications et rappels',
      color: '#ed8936',
      faqs: [
        {
          question: 'Je ne reçois pas de notifications, que faire ?',
          answer: 'Vérifiez ces points :\n1. Paramètres de l\'app > Notifications activées\n2. Paramètres iOS > CelebConnect > Notifications autorisées\n3. Mode "Ne pas déranger" désactivé\n4. Redémarrez l\'application\n5. Si le problème persiste, contactez le support'
        },
        {
          question: 'Comment personnaliser mes rappels ?',
          answer: 'Dans Paramètres > Notifications :\n• Choisissez les types d\'événements à rappeler\n• Définissez les délais (1h, 1j, 1 semaine avant)\n• Personnalisez le son et les vibrations\n• Ajoutez des messages personnalisés\n• Configurez les rappels récurrents'
        },
        {
          question: 'Puis-je avoir des rappels par email aussi ?',
          answer: 'Oui, activez les rappels email dans :\n1. Paramètres > Notifications > Rappels email\n2. Vérifiez votre adresse email\n3. Choisissez quand recevoir les emails\n4. Personnalisez le contenu des emails\n5. Testez avec un événement de démonstration'
        }
      ]
    },
    {
      id: 'account',
      icon: 'person',
      title: 'Mon compte',
      color: '#9f7aea',
      faqs: [
        {
          question: 'Comment changer mon mot de passe ?',
          answer: 'Pour changer votre mot de passe :\n1. Paramètres > Sécurité > Mot de passe\n2. Saisissez votre mot de passe actuel\n3. Entrez le nouveau mot de passe (8 caractères min.)\n4. Confirmez le nouveau mot de passe\n5. Appuyez sur "Modifier"\n6. Vous serez reconnecté automatiquement'
        },
        {
          question: 'Comment synchroniser mes données ?',
          answer: 'La synchronisation se fait automatiquement si :\n• Vous êtes connecté à Internet\n• La sauvegarde automatique est activée\n• Vous avez un compte CelebConnect\n\nPour forcer une synchronisation :\n1. Paramètres > Sauvegarde\n2. Appuyez sur "Synchroniser maintenant"'
        },
        {
          question: 'Comment supprimer mon compte ?',
          answer: 'Pour supprimer définitivement votre compte :\n1. Paramètres > Compte > Supprimer le compte\n2. Lisez les avertissements attentivement\n3. Tapez "SUPPRIMER" pour confirmer\n4. Toutes vos données seront effacées\n5. Cette action est irréversible'
        }
      ]
    },
    {
      id: 'premium',
      icon: 'diamond',
      title: 'CelebConnect Premium',
      color: '#fbbf24',
      faqs: [
        {
          question: 'Quels sont les avantages du Premium ?',
          answer: 'CelebConnect Premium inclut :\n• Événements illimités (vs 10 en gratuit)\n• Invités illimités par événement\n• Thèmes et personnalisations avancées\n• Sauvegarde cloud automatique\n• Support prioritaire\n• Statistiques détaillées\n• Pas de publicités'
        },
        {
          question: 'Comment m\'abonner au Premium ?',
          answer: 'Pour vous abonner :\n1. Paramètres > Plan Premium\n2. Choisissez votre forfait (mensuel/annuel)\n3. Appuyez sur "S\'abonner"\n4. Confirmez avec Face ID/Touch ID\n5. Profitez immédiatement de tous les avantages'
        },
        {
          question: 'Puis-je annuler mon abonnement ?',
          answer: 'Oui, vous pouvez annuler à tout moment :\n1. Paramètres iPhone > Votre nom > Abonnements\n2. Sélectionnez CelebConnect\n3. Appuyez sur "Annuler l\'abonnement"\n4. Vous gardez Premium jusqu\'à la fin de la période payée'
        }
      ]
    },
    {
      id: 'technical',
      icon: 'settings',
      title: 'Problèmes techniques',
      color: '#64748b',
      faqs: [
        {
          question: 'L\'app se ferme tout le temps, que faire ?',
          answer: 'Essayez ces solutions :\n1. Fermez complètement l\'app et rouvrez-la\n2. Redémarrez votre iPhone\n3. Vérifiez les mises à jour dans l\'App Store\n4. Libérez de l\'espace de stockage\n5. Si le problème persiste, réinstallez l\'app'
        },
        {
          question: 'Mes données ont disparu !',
          answer: 'Ne paniquez pas :\n1. Vérifiez que vous êtes connecté avec le bon compte\n2. Paramètres > Sauvegarde > Restaurer\n3. Attendez la synchronisation (peut prendre quelques minutes)\n4. Redémarrez l\'app\n5. Si rien ne fonctionne, contactez immédiatement le support'
        },
        {
          question: 'L\'app est lente, comment l\'accélérer ?',
          answer: 'Pour améliorer les performances :\n• Fermez les autres apps en arrière-plan\n• Redémarrez votre appareil\n• Vérifiez votre connexion Internet\n• Libérez de l\'espace de stockage\n• Mettez à jour vers la dernière version\n• Réduisez les animations dans Paramètres > Apparence'
        }
      ]
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleLiveChat = () => {
    Alert.alert(
      'Chat en direct',
      'Le chat en direct est disponible du lundi au vendredi de 9h à 18h. Souhaitez-vous ouvrir une conversation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ouvrir le chat', onPress: () => Linking.openURL('https://chat.celebconnect.com') }
      ]
    );
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@celebconnect.com?subject=Demande d\'aide CelebConnect');
  };

  const handlePhoneCall = () => {
    Alert.alert(
      'Nous appeler',
      'Support téléphonique disponible du lundi au vendredi de 9h à 18h (heure de Paris). Des frais peuvent s\'appliquer.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => Linking.openURL('tel:+33123456789') }
      ]
    );
  };

  const handleVideoTutorials = () => {
    Linking.openURL('https://youtube.com/celebconnect-tutorials');
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setExpandedFaq(null);
  };

  const toggleFaq = (faqIndex) => {
    setExpandedFaq(expandedFaq === faqIndex ? null : faqIndex);
  };

  const filteredCategories = helpCategories.filter(category =>
    searchQuery === '' || 
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.faqs.some(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Centre d'aide</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.welcomeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="help-circle" size={48} color="white" style={styles.welcomeIcon} />
        <Text style={styles.welcomeTitle}>Comment pouvons-nous vous aider ?</Text>
        <Text style={styles.welcomeSubtitle}>
          Trouvez des réponses à vos questions ou contactez notre équipe support
        </Text>
      </LinearGradient>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans l'aide..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚀 Actions rapides</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionCard}
            onPress={action.action}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={24} color="white" />
            </View>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
            <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFAQCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📚 Questions fréquentes</Text>
      {filteredCategories.map((category) => (
        <View key={category.id} style={styles.categoryContainer}>
          <TouchableOpacity
            style={styles.categoryHeader}
            onPress={() => toggleCategory(category.id)}
          >
            <View style={styles.categoryLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon} size={20} color="white" />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>
            <Ionicons
              name={expandedCategory === category.id ? "chevron-up" : "chevron-down"}
              size={20}
              color="#94a3b8"
            />
          </TouchableOpacity>
          
          {expandedCategory === category.id && (
            <View style={styles.faqList}>
              {category.faqs.map((faq, faqIndex) => (
                <View key={faqIndex} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleFaq(`${category.id}-${faqIndex}`)}
                  >
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    <Ionicons
                      name={expandedFaq === `${category.id}-${faqIndex}` ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                  
                  {expandedFaq === `${category.id}-${faqIndex}` && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderContactSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💬 Encore besoin d'aide ?</Text>
      <View style={styles.contactCard}>
        <Text style={styles.contactTitle}>Notre équipe est là pour vous</Text>
        <Text style={styles.contactSubtitle}>
          Si vous n'avez pas trouvé la réponse à votre question, n'hésitez pas à nous contacter.
        </Text>
        
        <View style={styles.contactMethods}>
          <TouchableOpacity style={styles.contactMethod} onPress={handleEmail}>
            <Ionicons name="mail" size={24} color="#667eea" />
            <View style={styles.contactMethodText}>
              <Text style={styles.contactMethodTitle}>Email</Text>
              <Text style={styles.contactMethodSubtitle}>Réponse sous 24h</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactMethod} onPress={handleLiveChat}>
            <Ionicons name="chatbubbles" size={24} color="#48bb78" />
            <View style={styles.contactMethodText}>
              <Text style={styles.contactMethodTitle}>Chat en direct</Text>
              <Text style={styles.contactMethodSubtitle}>Lun-Ven 9h-18h</Text>
            </View>
          </TouchableOpacity>
        </View>
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
        {renderWelcomeSection()}
        {renderSearchBar()}
        {renderQuickActions()}
        {renderFAQCategories()}
        {renderContactSection()}
        
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
  welcomeSection: {
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
  welcomeGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  welcomeIcon: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    marginLeft: 8,
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
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
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  faqList: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#f8fafc',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactMethods: {
    gap: 12,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  contactMethodText: {
    marginLeft: 12,
    flex: 1,
  },
  contactMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  contactMethodSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
});

export default HelpScreen;