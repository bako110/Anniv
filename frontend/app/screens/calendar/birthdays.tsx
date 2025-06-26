import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  StyleSheet,
  TouchableOpacity, 
  ScrollView,
  FlatList,
  Alert,
  Linking
} from 'react-native';
import { 
  Calendar, 
  Users, 
  Gift, 
  Bell, 
  Search, 
  Filter, 
  Plus,
  ChevronLeft,
  Heart,
  Cake,
  Star,
  MessageCircle,
  Phone,
  ArrowRight,
  MoreVertical
} from 'lucide-react-native';

const BirthdaysScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [birthdays, setBirthdays] = useState([
    {
      id: '1',
      name: 'Marie Dubois',
      date: '2024-06-25',
      age: 25,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      isToday: true,
      daysLeft: 0,
      relationship: 'Meilleure amie',
      wishlist: 12,
      lastGift: 'Parfum Chanel',
      phone: '+33123456789',
      hasNotification: true,
      zodiacSign: '♋ Cancer',
      interests: ['Mode', 'Voyage', 'Cuisine']
    },
    {
      id: '2',
      name: 'Jean Martin',
      date: '2024-06-27',
      age: 32,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      isToday: false,
      daysLeft: 2,
      relationship: 'Collègue',
      wishlist: 5,
      lastGift: 'Livre',
      phone: '+33123456788',
      hasNotification: false,
      zodiacSign: '♋ Cancer',
      interests: ['Lecture', 'Sport', 'Musique']
    },
    {
      id: '3',
      name: 'Sophie Laurent',
      date: '2024-07-01',
      age: 28,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      isToday: false,
      daysLeft: 6,
      relationship: 'Famille',
      wishlist: 8,
      lastGift: 'Bijoux',
      phone: '+33123456787',
      hasNotification: true,
      zodiacSign: '♋ Cancer',
      interests: ['Art', 'Photographie', 'Yoga']
    },
    {
      id: '4',
      name: 'Pierre Durand',
      date: '2024-07-15',
      age: 45,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      isToday: false,
      daysLeft: 20,
      relationship: 'Ami',
      wishlist: 3,
      lastGift: 'Vin',
      phone: '+33123456786',
      hasNotification: false,
      zodiacSign: '♌ Lion',
      interests: ['Cuisine', 'Vin', 'Golf']
    }
  ]);

  const filters = [
    { id: 'all', label: 'Tous', icon: Users },
    { id: 'today', label: 'Aujourd\'hui', icon: Cake },
    { id: 'week', label: 'Cette semaine', icon: Calendar },
    { id: 'family', label: 'Famille', icon: Heart },
    { id: 'friends', label: 'Amis', icon: Users }
  ];

  // Fonctions pour gérer les actions
  const handleAddBirthday = () => {
    Alert.alert(
      'Ajouter un anniversaire',
      'Fonctionnalité pour ajouter un nouvel anniversaire',
      [{ text: 'OK' }]
    );
  };

  const handleBackPress = () => {
    Alert.alert('Retour', 'Navigation vers l\'écran précédent');
  };

  const handleWishBirthday = (person) => {
    Alert.alert(
      'Souhaiter l\'anniversaire',
      `Envoyer un message d'anniversaire à ${person.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Envoyer', 
          onPress: () => Alert.alert('Message envoyé !', `Votre message d'anniversaire a été envoyé à ${person.name}`) 
        }
      ]
    );
  };

  const handlePrepareGift = (person) => {
    Alert.alert(
      'Préparer un cadeau',
      `Ouvrir la liste de souhaits de ${person.name} pour choisir un cadeau ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Voir la liste', 
          onPress: () => Alert.alert('Liste de souhaits', `${person.name} a ${person.wishlist} articles dans sa liste de souhaits`) 
        }
      ]
    );
  };

  const handleSendMessage = (person) => {
    Alert.alert(
      'Envoyer un message',
      `Ouvrir l'application de messagerie pour contacter ${person.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ouvrir', onPress: () => Alert.alert('Messagerie', 'Ouverture de l\'application de messagerie...') }
      ]
    );
  };

  const handleCall = (person) => {
    Alert.alert(
      'Appeler',
      `Appeler ${person.name} au ${person.phone} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: () => {
            Linking.openURL(`tel:${person.phone}`).catch(() => 
              Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone')
            );
          }
        }
      ]
    );
  };

  const handleMoreOptions = (person) => {
    Alert.alert(
      'Options',
      `Plus d'options pour ${person.name}`,
      [
        { text: 'Modifier', onPress: () => Alert.alert('Modifier', 'Ouvrir l\'écran de modification') },
        { text: 'Partager', onPress: () => Alert.alert('Partager', 'Partager les informations d\'anniversaire') },
        { text: 'Supprimer', style: 'destructive', onPress: () => handleDeleteBirthday(person.id) },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const handleDeleteBirthday = (id) => {
    Alert.alert(
      'Supprimer l\'anniversaire',
      'Êtes-vous sûr de vouloir supprimer cet anniversaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setBirthdays(birthdays.filter(b => b.id !== id));
            Alert.alert('Supprimé', 'L\'anniversaire a été supprimé');
          }
        }
      ]
    );
  };

  const getFilteredBirthdays = () => {
    let filtered = birthdays;

    if (searchQuery) {
      filtered = filtered.filter(birthday =>
        birthday.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter(b => b.isToday);
        break;
      case 'week':
        filtered = filtered.filter(b => b.daysLeft <= 7);
        break;
      case 'family':
        filtered = filtered.filter(b => b.relationship === 'Famille');
        break;
      case 'friends':
        filtered = filtered.filter(b => 
          b.relationship === 'Ami' || 
          b.relationship === 'Amie' || 
          b.relationship === 'Meilleure amie' ||
          b.relationship === 'Meilleur ami'
        );
        break;
    }

    return filtered.sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const getDaysLeftText = (daysLeft, isToday) => {
    if (isToday) return "C'est aujourd'hui ! 🎉";
    if (daysLeft === 1) return "Demain";
    if (daysLeft <= 7) return `Dans ${daysLeft} jours`;
    if (daysLeft <= 30) return `Dans ${daysLeft} jours`;
    return `Dans ${daysLeft} jours`;
  };

  const BirthdayCard = ({ birthday }) => (
    <View style={[
      styles.birthdayCard,
      {
        borderLeftColor: birthday.isToday ? '#8b5cf6' : birthday.daysLeft <= 7 ? '#f97316' : '#3b82f6'
      }
    ]}>
      {/* Header avec avatar et actions */}
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: birthday.avatar }}
              style={styles.avatar}
            />
            {birthday.isToday && (
              <View style={styles.todayBadge}>
                <Text style={{ color: 'white' }}>🎉</Text>
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.userName}>{birthday.name}</Text>
              <Text style={styles.userAge}>{birthday.age}</Text>
            </View>
            <Text style={styles.zodiacSign}>{birthday.zodiacSign}</Text>
            <View style={[
              styles.relationshipBadge,
              {
                backgroundColor: birthday.relationship === 'Famille' ? '#fee2e2' : 
                  birthday.relationship.includes('ami') ? '#dbeafe' : '#f3f4f6'
              }
            ]}>
              <Text style={[
                styles.relationshipText,
                {
                  color: birthday.relationship === 'Famille' ? '#b91c1c' : 
                    birthday.relationship.includes('ami') ? '#1d4ed8' : '#374151'
                }
              ]}>
                {birthday.relationship}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => handleMoreOptions(birthday)}>
          <MoreVertical color="#9ca3af" size={16} />
        </TouchableOpacity>
      </View>

      {/* Informations sur le timing */}
      <View style={[
        styles.dateInfo,
        birthday.isToday ? styles.dateInfoToday : 
        birthday.daysLeft <= 7 ? styles.dateInfoWeek : styles.dateInfoNormal
      ]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar 
              color={birthday.isToday ? '#7c3aed' : birthday.daysLeft <= 7 ? '#ea580c' : '#2563eb'} 
              size={20} 
            />
            <Text style={[styles.dateText, { marginLeft: 8 }]}>
              {getDaysLeftText(birthday.daysLeft, birthday.isToday)}
            </Text>
          </View>
          <Text style={styles.dateValue}>
            {new Date(birthday.date).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>
      </View>

      {/* Intérêts */}
      <View style={styles.interestsContainer}>
        {birthday.interests.map((interest, index) => (
          <View key={index} style={styles.interestBadge}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, styles.wishlistStat]}>
          <Gift size={16} color="#10b981" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.statText}>Liste de souhaits</Text>
            <Text style={[styles.statValue, styles.wishlistValue]}>{birthday.wishlist} articles</Text>
          </View>
        </View>
        
        <View style={[styles.statItem, styles.lastGiftStat]}>
          <Star size={16} color="#8b5cf6" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.statText}>Dernier cadeau</Text>
            <Text style={[styles.statValue, styles.lastGiftValue]}>{birthday.lastGift}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[
            styles.mainAction,
            birthday.isToday ? styles.mainActionToday : styles.mainActionNormal
          ]}
          onPress={() => birthday.isToday ? handleWishBirthday(birthday) : handlePrepareGift(birthday)}
        >
          {birthday.isToday ? <Cake size={16} color="white" /> : <Gift size={16} color="white" />}
          <Text style={styles.actionText}>
            {birthday.isToday ? 'Souhaiter' : 'Préparer'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryAction}
          onPress={() => handleSendMessage(birthday)}
        >
          <MessageCircle size={16} color="#4b5563" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryAction}
          onPress={() => handleCall(birthday)}
        >
          <Phone size={16} color="#4b5563" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const StatsCard = () => {
    const todayCount = birthdays.filter(b => b.isToday).length;
    const thisWeekCount = birthdays.filter(b => b.daysLeft <= 7).length;
    const thisMonthCount = birthdays.filter(b => b.daysLeft <= 30).length;

    return (
      <View style={styles.statsCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Cake size={24} color="white" />
          <Text style={styles.statsTitle}>
            Aperçu des anniversaires
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => setSelectedFilter('today')}
          >
            <Text style={styles.statsValue}>{todayCount}</Text>
            <Text style={styles.statsLabel}>Aujourd'hui</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => setSelectedFilter('week')}
          >
            <Text style={styles.statsValue}>{thisWeekCount}</Text>
            <Text style={styles.statsLabel}>Cette semaine</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={styles.statsValue}>{thisMonthCount}</Text>
            <Text style={styles.statsLabel}>Ce mois</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity style={{ padding: 8 }} onPress={handleBackPress}>
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.headerTitle}>🎂 Anniversaires</Text>
              <Text style={styles.headerSubtitle}>Gérez et suivez tous les anniversaires</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddBirthday}>
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Search style={styles.searchIcon} color="#9ca3af" size={20} />
          <TextInput
            placeholder="Rechercher un anniversaire..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Filtres */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                style={[
                  styles.filterButton,
                  isActive ? styles.filterButtonActive : styles.filterButtonInactive
                ]}
              >
                <Icon size={16} color={isActive ? 'white' : '#374151'} />
                <Text style={[
                  styles.filterText,
                  isActive ? styles.filterTextActive : styles.filterTextInactive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Contenu principal */}
      <ScrollView style={{ padding: 16 }}>
        <StatsCard />

        {/* Liste des anniversaires */}
        {getFilteredBirthdays().length === 0 ? (
          <View style={styles.emptyState}>
            <Cake size={64} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>
              Aucun anniversaire trouvé
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Essayez de modifier votre recherche'
                : 'Ajoutez des anniversaires pour commencer'
              }
            </Text>
            <TouchableOpacity 
              style={[styles.addButton, { marginTop: 16 }]}
              onPress={handleAddBirthday}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={getFilteredBirthdays()}
            renderItem={({ item }) => <BirthdayCard birthday={item} />}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles globaux
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  // Header
  headerContainer: {
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    color: '#6b7280',
  },
  addButton: {
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Search bar
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
  },
  searchInput: {
    width: '100%',
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: 'white',
  },

  // Filters
  filterScroll: {
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  filterButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
  filterText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  filterTextInactive: {
    color: '#374151',
  },

  // Stats Card
  statsCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statsLabel: {
    color: 'white',
    opacity: 0.9,
  },

  // Birthday Card
  birthdayCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  todayBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userAge: {
    fontSize: 20,
    marginLeft: 8,
  },
  zodiacSign: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 4,
  },
  relationshipBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  relationshipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Date Info
  dateInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateInfoToday: {
    backgroundColor: '#f3e8ff',
  },
  dateInfoWeek: {
    backgroundColor: '#ffedd5',
  },
  dateInfoNormal: {
    backgroundColor: '#dbeafe',
  },
  dateText: {
    fontWeight: '600',
    color: '#1f2937',
  },
  dateValue: {
    fontSize: 14,
    color: '#4b5563',
  },

  // Interests
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  interestBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#374151',
    fontSize: 12,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flex: 1,
  },
  wishlistStat: {
    backgroundColor: '#ecfdf5',
  },
  lastGiftStat: {
    backgroundColor: '#f5f3ff',
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statValue: {
    fontWeight: '600',
    fontSize: 14,
  },
  wishlistValue: {
    color: '#065f46',
  },
  lastGiftValue: {
    color: '#5b21b6',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  mainAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mainActionToday: {
    backgroundColor: '#8b5cf6',
  },
  mainActionNormal: {
    backgroundColor: '#3b82f6',
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  },
  secondaryAction: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    color: '#d1d5db',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyText: {
    color: '#9ca3af',
    marginTop: 8,
  },
});

export default BirthdaysScreen;