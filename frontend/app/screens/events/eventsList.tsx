import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView, RefreshControl, Alert, TouchableOpacity, Image, ScrollView, Animated, Share, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import EventService from '../../../services/events/event';
import CommentsOverlay from './comment/CommentInput';
import { Dimensions } from 'react-native';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.11.120:8000';

const categories = [
  { id: 'all', name: 'Tout', icon: 'apps', color: '#667eea' },
  { id: 'birthday', name: 'Anniversaires', icon: 'gift', color: '#f56565' },
  { id: 'music', name: 'Musique', icon: 'musical-notes', color: '#ed8936' },
  { id: 'social', name: 'Social', icon: 'people', color: '#48bb78' },
  { id: 'culture', name: 'Culture', icon: 'library', color: '#9f7aea' },
  { id: 'workshop', name: 'Formations', icon: 'school', color: '#38b2ac' },
];

const EventListScreen = () => {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [commentingEventId, setCommentingEventId] = useState(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    fetchEvents(page);
  }, [page]);

  const fetchEvents = async (pageNumber = 1) => {
    setRefreshing(true);
    const response = await EventService.getEvents(pageNumber, 20);
    if (response.success) {
      const enhancedEvents = response.data.events.map(event => ({
        ...event,
        organizer_full_name:
          event.organizer?.first_name && event.organizer?.last_name
            ? `${event.organizer.first_name} ${event.organizer.last_name}`
            : event.organizer_name || 'Organisateur',
      }));
      setEvents(enhancedEvents);
      setTotalPages(response.data.pages);
    } else {
      Alert.alert('Erreur', 'Impossible de charger les événements');
    }
    setRefreshing(false);
  };

  const onRefresh = useCallback(() => {
    setPage(1);
    fetchEvents(1);
  }, []);

  const filteredEvents =
    selectedCategory === 'all'
      ? events
      : events.filter(event => event.category === selectedCategory);

  const handleLike = eventId => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, likes: (event.likes || 0) + 1 } : event
      )
    );
  };

  const handleInterested = eventId => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, isInterested: !event.isInterested } : event
      )
    );
  };

  const handleGoing = eventId => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? {
              ...event,
              isGoing: !event.isGoing,
              attendees_count: event.isGoing
                ? (event.attendees_count || 0) - 1
                : (event.attendees_count || 0) + 1,
            }
          : event
      )
    );
  };

  const handleShare = async event => {
    try {
      await Share.share({
        message: `Découvrez cet événement: ${event.title} le ${event.date} à ${event.time}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const openCommentInput = eventId => {
    setCommentingEventId(eventId);
  };

  const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryItem, selectedCategory === category.id && styles.categoryItemActive]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: selectedCategory === category.id ? category.color : '#f1f5f9' },
              ]}
            >
              <Ionicons
                name={category.icon}
                size={18}
                color={selectedCategory === category.id ? 'white' : '#64748b'}
              />
            </View>
            <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEventCard = ({ item }) => (
    <Animated.View style={[styles.eventCard, { opacity: fadeAnim }]}>
      <View style={styles.eventHeader}>
        <View style={styles.organizerInfo}>
          <Image
            source={{
              uri: formatImageUrl(item.organizer?.avatar_url) || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
            }}
            style={styles.organizerAvatar}
            onError={() => console.log('Failed to load organizer avatar')}
          />
          <View style={styles.organizerDetails}>
            <View style={styles.organizerNameContainer}>
              <Text style={styles.organizerName}>
                {item.organizer_full_name || item.organizer_name || item.organizer?.full_name}
              </Text>
              {item.organizer?.verified && <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />}
            </View>
            <Text style={styles.postedTime}>{new Date(item.date).toLocaleString()}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.eventContent}
        onPress={() => router.push(`/screens/events/EventDetailsScreen?eventId=${item.id}`)}
      >
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>
        {item.image && <Image source={{ uri: formatImageUrl(item.image) }} style={styles.eventImage} resizeMode="cover" onError={() => console.log('Failed to load event image')}/>}
        <View style={styles.eventInfoContainer}>
          <View style={styles.eventInfoRow}>
            <View style={styles.eventInfoItem}>
              <Ionicons name="calendar-outline" size={16} color="#667eea" />
              <Text style={styles.eventInfoText}>
                {item.date} à {item.time || '--:--'}
              </Text>
            </View>
            <View style={styles.eventPriceContainer}>
              <Text style={[styles.eventPrice, { color: item.price === 'Gratuit' ? '#22c55e' : '#f59e0b' }]}>
                {item.price || '--'}
              </Text>
            </View>
          </View>
          <View style={styles.eventInfoItem}>
            <Ionicons name="location-outline" size={16} color="#667eea" />
            <Text style={styles.eventInfoText} numberOfLines={1}>
              {item.location || 'Lieu non spécifié'}
            </Text>
          </View>
          <View style={styles.eventInfoItem}>
            <Ionicons name="people-outline" size={16} color="#667eea" />
            <Text style={styles.eventInfoText}>{item.attendees_count || 0} participants</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.engagementStats}>
        <View style={styles.statsLeft}>
          <View style={styles.likesContainer}>
            <View style={styles.likeIcon}>
              <Ionicons name="heart" size={12} color="white" />
            </View>
            <Text style={styles.statsText}>{item.likes || 0}</Text>
          </View>
          <Text style={styles.statsText}>{item.comments_count || 0} commentaires</Text>
          <Text style={styles.statsText}>{item.shares || 0} partages</Text>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <View style={styles.mainActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
            <Ionicons name="heart-outline" size={20} color="#64748b" />
            <Text style={styles.actionText}>J'aime</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => openCommentInput(item.id)}>
            <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
            <Text style={styles.actionText}>Commenter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
            <Ionicons name="share-outline" size={20} color="#64748b" />
            <Text style={styles.actionText}>Partager</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventActions}>
          <TouchableOpacity
            style={[styles.eventActionButton, item.isInterested && styles.eventActionButtonActive]}
            onPress={() => handleInterested(item.id)}
          >
            <Ionicons
              name={item.isInterested ? 'star' : 'star-outline'}
              size={16}
              color={item.isInterested ? '#f59e0b' : '#64748b'}
            />
            <Text style={[styles.eventActionText, item.isInterested && styles.eventActionTextActive]}>Intéressé</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.eventActionButton, item.isGoing && styles.eventActionButtonGoing]}
            onPress={() => handleGoing(item.id)}
          >
            <Ionicons
              name={item.isGoing ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={16}
              color={item.isGoing ? 'white' : '#64748b'}
            />
            <Text style={[styles.eventActionText, item.isGoing && styles.eventActionTextGoing]}>
              {item.isGoing ? 'Participe' : 'Participer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderCategoryFilter()}
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={item => item.id.toString()}
          style={styles.eventsList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: commentingEventId ? SCREEN_HEIGHT * 0.5 : 20 }}
        />
        {commentingEventId && (
          <CommentsOverlay
            eventId={commentingEventId}
            onClose={() => setCommentingEventId(null)}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 50, android: 20 }),
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    zIndex: 9,
  },
  categoryScroll: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  categoryItemActive: {
    backgroundColor: '#f1f5f9',
  },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
    paddingBottom: Platform.select({ ios: 0, android: 10 }),
  },
  eventCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
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
    marginRight: 6,
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
    paddingHorizontal: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 24,
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
    marginBottom: 8,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  eventInfoText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
    flexShrink: 1,
  },
  eventPriceContainer: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#fef3c7',
  },
  eventPrice: {
    fontWeight: '700',
    fontSize: 14,
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  likeIcon: {
    backgroundColor: '#ef4444',
    padding: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  statsText: {
    fontSize: 13,
    color: '#64748b',
    marginRight: 12,
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  eventActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    flex: 1,
    justifyContent: 'center',
  },
  eventActionButtonActive: {
    borderColor: '#fbbf24',
    backgroundColor: '#fef3c7',
  },
  eventActionButtonGoing: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  eventActionText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
  eventActionTextActive: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  eventActionTextGoing: {
    color: 'white',
    fontWeight: '600',
  },
};

export default EventListScreen;
