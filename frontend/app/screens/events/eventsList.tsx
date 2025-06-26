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
  FlatList,
  Animated,
  RefreshControl,
  Share,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Données d'exemple pour les événements du feed
const eventsFeed = [
  {
    id: '1',
    title: 'Soirée d\'anniversaire de Marie 🎂',
    description: 'Venez célébrer mes 25 ans dans une ambiance conviviale ! Musique, danse et bonne humeur garanties.',
    date: '2024-07-15',
    time: '19:00',
    location: 'Chez Marie, 123 Rue de la Paix, Paris',
    organizer: {
      name: 'Marie Dubois',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
      verified: true
    },
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=250&fit=crop',
    attendees: {
      count: 24,
      going: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop&crop=face']
    },
    likes: 18,
    comments: 7,
    shares: 3,
    isGoing: false,
    isInterested: true,
    type: 'birthday',
    postedTime: '2h',
    price: 'Gratuit',
    category: 'Fête'
  },
  {
    id: '2',
    title: 'Concert Jazz au Sunset 🎷',
    description: 'Découvrez les meilleurs talents jazz de la région dans un cadre intimiste. Soirée exceptionnelle avec Antoine Quartet.',
    date: '2024-07-20',
    time: '20:30',
    location: 'Le Sunset, Montmartre, Paris',
    organizer: {
      name: 'Le Sunset Club',
      avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop&crop=face',
      verified: true
    },
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop',
    attendees: {
      count: 89,
      going: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=30&h=30&fit=crop&crop=face']
    },
    likes: 42,
    comments: 15,
    shares: 8,
    isGoing: true,
    isInterested: false,
    type: 'music',
    postedTime: '5h',
    price: '25€',
    category: 'Musique'
  },
  {
    id: '3',
    title: 'Barbecue entre amis 🔥',
    description: 'Barbecue convivial au parc avec jeux, musique et bonne bouffe ! Amenez vos spécialités à partager.',
    date: '2024-07-18',
    time: '12:00',
    location: 'Parc des Buttes-Chaumont, Paris',
    organizer: {
      name: 'Thomas Martin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      verified: false
    },
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250&fit=crop',
    attendees: {
      count: 16,
      going: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop&crop=face']
    },
    likes: 12,
    comments: 4,
    shares: 2,
    isGoing: false,
    isInterested: false,
    type: 'social',
    postedTime: '1j',
    price: 'Gratuit',
    category: 'Social'
  },
  {
    id: '4',
    title: 'Exposition Photo "Lumières Urbaines" 📸',
    description: 'Vernissage de l\'exposition photo de Sarah Chen. Découvrez Paris sous un nouveau jour à travers ses clichés uniques.',
    date: '2024-07-22',
    time: '18:00',
    location: 'Galerie Moderne, 45 Rue de Rivoli, Paris',
    organizer: {
      name: 'Galerie Moderne',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face',
      verified: true
    },
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
    attendees: {
      count: 67,
      going: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face']
    },
    likes: 28,
    comments: 9,
    shares: 12,
    isGoing: false,
    isInterested: true,
    type: 'culture',
    postedTime: '3j',
    price: 'Gratuit',
    category: 'Culture'
  },
  {
    id: '5',
    title: 'Workshop Cuisine Italienne 🍝',
    description: 'Apprenez à préparer de délicieuses pâtes fraîches avec le chef Marco. Dégustation incluse !',
    date: '2024-07-25',
    time: '14:00',
    location: 'L\'Atelier Culinaire, 78 Rue Saint-Antoine, Paris',
    organizer: {
      name: 'Chef Marco',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      verified: true
    },
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=250&fit=crop',
    attendees: {
      count: 12,
      going: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop&crop=face']
    },
    likes: 35,
    comments: 11,
    shares: 5,
    isGoing: true,
    isInterested: false,
    type: 'workshop',
    postedTime: '2j',
    price: '45€',
    category: 'Formation'
  }
];

// Catégories pour le filtre
const categories = [
  { id: 'all', name: 'Tout', icon: 'apps', color: '#667eea' },
  { id: 'birthday', name: 'Anniversaires', icon: 'gift', color: '#f56565' },
  { id: 'music', name: 'Musique', icon: 'musical-notes', color: '#ed8936' },
  { id: 'social', name: 'Social', icon: 'people', color: '#48bb78' },
  { id: 'culture', name: 'Culture', icon: 'library', color: '#9f7aea' },
  { id: 'workshop', name: 'Formations', icon: 'school', color: '#38b2ac' },
];

const EventListScreen = () => {
  const [events, setEvents] = useState(eventsFeed);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.type === selectedCategory);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleLike = (eventId) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, likes: event.likes + 1 }
          : event
      )
    );
  };

  const handleInterested = (eventId) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, isInterested: !event.isInterested }
          : event
      )
    );
  };

  const handleGoing = (eventId) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              isGoing: !event.isGoing,
              attendees: {
                ...event.attendees,
                count: event.isGoing ? event.attendees.count - 1 : event.attendees.count + 1
              }
            }
          : event
      )
    );
  };

  const handleShare = async (event) => {
    try {
      await Share.share({
        message: `Découvrez cet événement: ${event.title} le ${event.date} à ${event.time}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Événements</Text>
      <TouchableOpacity onPress={() => router.push('/screens/events/createevent')}>
        <Ionicons name="add" size={28} color="#667eea" />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.categoryItemActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View style={[
              styles.categoryIcon,
              { backgroundColor: selectedCategory === category.id ? category.color : '#f1f5f9' }
            ]}>
              <Ionicons 
                name={category.icon} 
                size={18} 
                color={selectedCategory === category.id ? 'white' : '#64748b'} 
              />
            </View>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEventCard = ({ item }) => (
    <Animated.View style={[styles.eventCard, { opacity: fadeAnim }]}>
      {/* En-tête de l'événement */}
      <View style={styles.eventHeader}>
        <View style={styles.organizerInfo}>
          <Image source={{ uri: item.organizer.avatar }} style={styles.organizerAvatar} />
          <View style={styles.organizerDetails}>
            <View style={styles.organizerNameContainer}>
              <Text style={styles.organizerName}>{item.organizer.name}</Text>
              {item.organizer.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
              )}
            </View>
            <Text style={styles.postedTime}>Il y a {item.postedTime}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Contenu de l'événement */}
      <TouchableOpacity 
        style={styles.eventContent}
        onPress={() => router.push(`/screens/events/EventDetailsScreen?eventId=${item.id}`)}
      >
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={3}>{item.description}</Text>
        
        {/* Image de l'événement */}
        <Image source={{ uri: item.image }} style={styles.eventImage} />
        
        {/* Informations de l'événement */}
        <View style={styles.eventInfoContainer}>
          <View style={styles.eventInfoRow}>
            <View style={styles.eventInfoItem}>
              <Ionicons name="calendar-outline" size={16} color="#667eea" />
              <Text style={styles.eventInfoText}>{item.date} à {item.time}</Text>
            </View>
            <View style={styles.eventPriceContainer}>
              <Text style={[styles.eventPrice, { color: item.price === 'Gratuit' ? '#22c55e' : '#f59e0b' }]}>
                {item.price}
              </Text>
            </View>
          </View>
          
          <View style={styles.eventInfoItem}>
            <Ionicons name="location-outline" size={16} color="#667eea" />
            <Text style={styles.eventInfoText} numberOfLines={1}>{item.location}</Text>
          </View>
          
          <View style={styles.eventInfoItem}>
            <Ionicons name="people-outline" size={16} color="#667eea" />
            <Text style={styles.eventInfoText}>{item.attendees.count} participants</Text>
          </View>
        </View>

        {/* Participants */}
        <View style={styles.participantsContainer}>
          <View style={styles.participantAvatars}>
            {item.attendees.going.map((avatar, index) => (
              <Image 
                key={index}
                source={{ uri: avatar }} 
                style={[styles.participantAvatar, { marginLeft: index > 0 ? -8 : 0 }]} 
              />
            ))}
            {item.attendees.count > 3 && (
              <View style={styles.moreParticipants}>
                <Text style={styles.moreParticipantsText}>+{item.attendees.count - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Statistiques d'engagement */}
      <View style={styles.engagementStats}>
        <View style={styles.statsLeft}>
          <View style={styles.likesContainer}>
            <View style={styles.likeIcon}>
              <Ionicons name="heart" size={12} color="white" />
            </View>
            <Text style={styles.statsText}>{item.likes}</Text>
          </View>
          <Text style={styles.statsText}>{item.comments} commentaires</Text>
          <Text style={styles.statsText}>{item.shares} partages</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.mainActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons name="heart-outline" size={20} color="#64748b" />
            <Text style={styles.actionText}>J'aime</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/screens/events/EventDetailsScreen?eventId=${item.id}`)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
            <Text style={styles.actionText}>Commenter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-outline" size={20} color="#64748b" />
            <Text style={styles.actionText}>Partager</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.eventActions}>
          <TouchableOpacity
            style={[
              styles.eventActionButton,
              item.isInterested && styles.eventActionButtonActive
            ]}
            onPress={() => handleInterested(item.id)}
          >
            <Ionicons 
              name={item.isInterested ? "star" : "star-outline"} 
              size={16} 
              color={item.isInterested ? "#f59e0b" : "#64748b"} 
            />
            <Text style={[
              styles.eventActionText,
              item.isInterested && styles.eventActionTextActive
            ]}>
              Intéressé
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.eventActionButton,
              item.isGoing && styles.eventActionButtonGoing
            ]}
            onPress={() => handleGoing(item.id)}
          >
            <Ionicons 
              name={item.isGoing ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={16} 
              color={item.isGoing ? "white" : "#64748b"} 
            />
            <Text style={[
              styles.eventActionText,
              item.isGoing && styles.eventActionTextGoing
            ]}>
              {item.isGoing ? "Participe" : "Participer"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderCategoryFilter()}
      
      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        style={styles.eventsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.eventsListContent}
      />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryScroll: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryItemActive: {
    backgroundColor: '#f1f5f9',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 10,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  organizerDetails: {
    flex: 1,
  },
  organizerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 4,
  },
  postedTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  eventContent: {
    paddingHorizontal: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  eventInfoContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  eventInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flex: 1,
  },
  eventInfoText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 6,
    flex: 1,
  },
  eventPriceContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  participantsContainer: {
    marginBottom: 15,
  },
  participantAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  moreParticipants: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreParticipantsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  likeIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 16,
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  eventActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    flex: 0.45,
    justifyContent: 'center',
  },
  eventActionButtonActive: {
    backgroundColor: '#fef3c7',
  },
  eventActionButtonGoing: {
    backgroundColor: '#667eea',
  },
  eventActionText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '600',
  },
  eventActionTextActive: {
    color: '#f59e0b',
  },
  eventActionTextGoing: {
    color: 'white',
  },
});

export default EventListScreen;