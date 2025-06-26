import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Données de recherche simulées
const allData = {
  friends: [
    {
      id: '1',
      name: 'Marie Dubois',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
      status: 'En ligne',
      mutualFriends: 12,
      type: 'friend'
    },
    {
      id: '2',
      name: 'Pierre Martin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      status: 'Actif il y a 2h',
      mutualFriends: 8,
      type: 'friend'
    },
    {
      id: '3',
      name: 'Sophie Laurent',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
      status: 'En ligne',
      mutualFriends: 15,
      type: 'friend'
    },
    {
      id: '4',
      name: 'Thomas Petit',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      status: 'Actif il y a 1h',
      mutualFriends: 6,
      type: 'friend'
    },
    {
      id: '5',
      name: 'Julie Bernard',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
      status: 'En ligne',
      mutualFriends: 9,
      type: 'friend'
    }
  ],
  events: [
    {
      id: '1',
      title: 'Fête d\'anniversaire Julie',
      date: '28 Juin 2025',
      time: '19h00',
      location: 'Chez Marie',
      attendees: 12,
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=150&h=100&fit=crop',
      type: 'event',
      category: 'Anniversaire'
    },
    {
      id: '2',
      title: 'Soirée barbecue amis',
      date: '30 Juin 2025',
      time: '18h30',
      location: 'Parc central',
      attendees: 8,
      image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=150&h=100&fit=crop',
      type: 'event',
      category: 'Social'
    },
    {
      id: '3',
      title: 'Concert jazz downtown',
      date: '5 Juillet 2025',
      time: '20h00',
      location: 'Jazz Club',
      attendees: 25,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=100&fit=crop',
      type: 'event',
      category: 'Musique'
    }
  ],
  memories: [
    {
      id: '1',
      title: 'Vacances à la plage',
      date: '15 Mai 2025',
      photos: 24,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&h=100&fit=crop',
      type: 'memory',
      participants: ['Marie', 'Pierre', 'Sophie']
    },
    {
      id: '2',
      title: 'Anniversaire Thomas',
      date: '10 Avril 2025',
      photos: 18,
      image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=150&h=100&fit=crop',
      type: 'memory',
      participants: ['Thomas', 'Julie', 'Marie']
    },
    {
      id: '3',
      title: 'Weekend montagne',
      date: '22 Mars 2025',
      photos: 32,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop',
      type: 'memory',
      participants: ['Sophie', 'Pierre']
    }
  ],
  wishlists: [
    {
      id: '1',
      title: 'Livre "L\'art de la simplicité"',
      price: '15€',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=100&fit=crop',
      type: 'wishlist',
      category: 'Livre',
      owner: 'Marie'
    },
    {
      id: '2',
      title: 'Casque audio Sony',
      price: '89€',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&h=100&fit=crop',
      type: 'wishlist',
      category: 'Électronique',
      owner: 'Pierre'
    }
  ]
};

const recentSearches = [
  'Marie Dubois',
  'Anniversaire',
  'Concert jazz',
  'Vacances plage',
  'Weekend montagne'
];

const trendingSearches = [
  '🎂 Anniversaires du mois',
  '🎵 Concerts été',
  '🏖️ Vacances été',
  '🎉 Soirées weekend',
  '📸 Souvenirs récents'
];

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const filters = [
    { id: 'all', title: 'Tout', icon: 'search', color: '#667eea' },
    { id: 'friends', title: 'Amis', icon: 'people', color: '#48bb78' },
    { id: 'events', title: 'Événements', icon: 'calendar', color: '#ed8936' },
    { id: 'memories', title: 'Souvenirs', icon: 'images', color: '#38b2ac' },
    { id: 'wishlists', title: 'Souhaits', icon: 'gift', color: '#9f7aea' }
  ];

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();

    // Focus automatique sur l'input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setShowSuggestions(false);
      
      // Simulation d'une recherche avec délai
      const searchTimer = setTimeout(() => {
        performSearch(searchQuery);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(searchTimer);
    } else {
      setSearchResults([]);
      setShowSuggestions(true);
      setIsSearching(false);
    }
  }, [searchQuery, activeFilter]);

  const performSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    let results = [];

    // Recherche dans toutes les catégories ou catégorie spécifique
    const categoriesToSearch = activeFilter === 'all' 
      ? Object.keys(allData) 
      : [activeFilter];

    categoriesToSearch.forEach(category => {
      const categoryData = allData[category] || [];
      const filtered = categoryData.filter(item => {
        switch (category) {
          case 'friends':
            return item.name.toLowerCase().includes(lowerQuery);
          case 'events':
            return item.title.toLowerCase().includes(lowerQuery) ||
                   item.location.toLowerCase().includes(lowerQuery) ||
                   item.category.toLowerCase().includes(lowerQuery);
          case 'memories':
            return item.title.toLowerCase().includes(lowerQuery) ||
                   item.participants.some(p => p.toLowerCase().includes(lowerQuery));
          case 'wishlists':
            return item.title.toLowerCase().includes(lowerQuery) ||
                   item.category.toLowerCase().includes(lowerQuery) ||
                   item.owner.toLowerCase().includes(lowerQuery);
          default:
            return false;
        }
      });
      results = [...results, ...filtered];
    });

    setSearchResults(results);
  };

  const handleFilterPress = (filterId) => {
    setActiveFilter(filterId);
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Ajouter aux recherches récentes (simulation)
      console.log('Recherche soumise:', searchQuery);
    }
  };

  const handleResultPress = (item) => {
    switch (item.type) {
      case 'friend':
        router.push(`/screens/profile/ProfileScreen?userId=${item.id}`);
        break;
      case 'event':
        router.push(`/screens/events/EventDetailsScreen?eventId=${item.id}`);
        break;
      case 'memory':
        router.push(`/screens/memories/MemoryDetailsScreen?memoryId=${item.id}`);
        break;
      case 'wishlist':
        router.push(`/screens/ecommerce/WishlistItemScreen?itemId=${item.id}`);
        break;
    }
  };

  const handleRecentSearchPress = (searchTerm) => {
    setSearchQuery(searchTerm);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(true);
    searchInputRef.current?.focus();
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Rechercher amis, événements, souvenirs..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearSearch}
            >
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              activeFilter === filter.id && [
                styles.activeFilterButton,
                { backgroundColor: filter.color }
              ]
            ]}
            onPress={() => handleFilterPress(filter.id)}
          >
            <Ionicons 
              name={filter.icon} 
              size={16} 
              color={activeFilter === filter.id ? 'white' : filter.color} 
            />
            <Text 
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.activeFilterText
              ]}
            >
              {filter.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderFriendResult = (item) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => handleResultPress(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStatus}>{item.status}</Text>
        <Text style={styles.mutualFriends}>{item.mutualFriends} amis en commun</Text>
      </View>
      <View style={styles.resultTypeIcon}>
        <Ionicons name="person" size={16} color="#48bb78" />
      </View>
    </TouchableOpacity>
  );

  const renderEventResult = (item) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => handleResultPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>{item.date} à {item.time}</Text>
        <Text style={styles.eventLocation}>📍 {item.location}</Text>
        <Text style={styles.eventAttendees}>{item.attendees} participants</Text>
      </View>
      <View style={styles.resultTypeIcon}>
        <Ionicons name="calendar" size={16} color="#ed8936" />
      </View>
    </TouchableOpacity>
  );

  const renderMemoryResult = (item) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => handleResultPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.memoryImage} />
      <View style={styles.memoryInfo}>
        <Text style={styles.memoryTitle}>{item.title}</Text>
        <Text style={styles.memoryDate}>{item.date}</Text>
        <Text style={styles.memoryPhotos}>{item.photos} photos</Text>
        <Text style={styles.memoryParticipants}>
          Avec {item.participants.join(', ')}
        </Text>
      </View>
      <View style={styles.resultTypeIcon}>
        <Ionicons name="images" size={16} color="#38b2ac" />
      </View>
    </TouchableOpacity>
  );

  const renderWishlistResult = (item) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => handleResultPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.wishlistImage} />
      <View style={styles.wishlistInfo}>
        <Text style={styles.wishlistTitle}>{item.title}</Text>
        <Text style={styles.wishlistPrice}>{item.price}</Text>
        <Text style={styles.wishlistCategory}>{item.category}</Text>
        <Text style={styles.wishlistOwner}>Souhaité par {item.owner}</Text>
      </View>
      <View style={styles.resultTypeIcon}>
        <Ionicons name="gift" size={16} color="#9f7aea" />
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = (item) => {
    switch (item.type) {
      case 'friend':
        return renderFriendResult(item);
      case 'event':
        return renderEventResult(item);
      case 'memory':
        return renderMemoryResult(item);
      case 'wishlist':
        return renderWishlistResult(item);
      default:
        return null;
    }
  };

  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    return (
      <Animated.View 
        style={[
          styles.suggestionsContainer,
          { opacity: fadeAnim }
        ]}
      >
        {/* Recherches récentes */}
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionSectionTitle}>🕒 Recherches récentes</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleRecentSearchPress(search)}
            >
              <Ionicons name="time" size={16} color="#94a3b8" />
              <Text style={styles.suggestionText}>{search}</Text>
              <Ionicons name="arrow-up-outline" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Tendances */}
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionSectionTitle}>🔥 Tendances</Text>
          {trendingSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleRecentSearchPress(search)}
            >
              <Ionicons name="trending-up" size={16} color="#f59e0b" />
              <Text style={styles.suggestionText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions rapides */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.suggestionSectionTitle}>⚡ Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/screens/social/friends')}
            >
              <Ionicons name="people" size={20} color="#48bb78" />
              <Text style={styles.quickActionText}>Mes amis</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/screens/events/EventsListScreen')}
            >
              <Ionicons name="calendar" size={20} color="#ed8936" />
              <Text style={styles.quickActionText}>Événements</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/screens/memories/gallery')}
            >
              <Ionicons name="images" size={20} color="#38b2ac" />
              <Text style={styles.quickActionText}>Galerie</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/screens/ecommerce/wishlist')}
            >
              <Ionicons name="gift" size={20} color="#9f7aea" />
              <Text style={styles.quickActionText}>Wishlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <Animated.View style={styles.loadingContent}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Recherche en cours...</Text>
          </Animated.View>
        </View>
      );
    }

    if (searchQuery.trim() && searchResults.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search" size={48} color="#cbd5e1" />
          <Text style={styles.noResultsTitle}>Aucun résultat trouvé</Text>
          <Text style={styles.noResultsText}>
            Essayez avec d'autres mots-clés ou vérifiez l'orthographe
          </Text>
        </View>
      );
    }

    if (searchResults.length > 0) {
      return (
        <Animated.View 
          style={[
            styles.resultsContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.resultsTitle}>
            {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} pour "{searchQuery}"
          </Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => renderSearchResult(item)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderSuggestions()}
        {renderSearchResults()}
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
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 10,
    padding: 5,
  },
  filtersContainer: {
    paddingRight: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterButton: {
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginLeft: 6,
  },
  activeFilterText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  suggestionsContainer: {
    padding: 20,
  },
  suggestionSection: {
    marginBottom: 25,
  },
  suggestionSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    marginLeft: 12,
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#e2e8f0',
    borderTopColor: '#667eea',
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles spécifiques aux amis
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 13,
    color: '#22c55e',
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#64748b',
  },
  // Styles spécifiques aux événements
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  eventAttendees: {
    fontSize: 12,
    color: '#64748b',
  },
  // Styles spécifiques aux souvenirs
  memoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  memoryInfo: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  memoryDate: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  memoryPhotos: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  memoryParticipants: {
    fontSize: 12,
    color: '#64748b',
  },
  // Styles spécifiques aux wishlists
  wishlistImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  wishlistInfo: {
    flex: 1,
  },
  wishlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  wishlistPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 2,
  },
  wishlistCategory: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  wishlistOwner: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default SearchScreen;