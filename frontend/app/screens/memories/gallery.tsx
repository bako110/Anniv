import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Animated,
  RefreshControl,
  Modal,
  TextInput,
  Platform,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');

const galleryData = [
  {
    id: '1',
    uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=600&fit=crop',
    title: 'Anniversaire Sophie',
    date: '15 Juin 2023',
    likes: 42,
    comments: 8,
    isFavorite: true,
    type: 'birthday',
  },
  {
    id: '2',
    uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop',
    title: 'Soirée été',
    date: '22 Juillet 2023',
    likes: 35,
    comments: 5,
    isFavorite: false,
    type: 'party',
  },
  {
    id: '3',
    uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=600&fit=crop',
    title: 'Vacances à la mer',
    date: '5 Août 2023',
    likes: 28,
    comments: 3,
    isFavorite: true,
    type: 'vacation',
  },
];

const filterCategories = [
  { id: 'all', name: 'Tout voir' },
  { id: 'birthday', name: 'Anniversaires' },
  { id: 'party', name: 'Soirées' },
  { id: 'vacation', name: 'Vacances' },
];

const GalleryScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);

  const filteredData = galleryData.filter(item => {
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleImagePress = (item) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const toggleFavorite = (id) => {
    console.log(`Toggle favorite for image ${id}`);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#667eea" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Ma Galerie</Text>
      <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
        <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={24} color="#667eea" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
      <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
      <TextInput
        ref={searchInputRef}
        style={styles.searchInput}
        placeholder="Rechercher des souvenirs..."
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
          <Ionicons name="close-circle" size={20} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFilterBar = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScrollContainer}
    >
      {filterCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.filterButton,
            selectedFilter === category.id && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter(category.id)}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === category.id && styles.filterButtonTextActive
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderGridItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleImagePress(item)} 
      activeOpacity={0.8}
      style={styles.gridItem}
    >
      <Image source={{ uri: item.uri }} style={styles.gridImage} />
      <LinearGradient 
        colors={['transparent', 'rgba(0,0,0,0.7)']} 
        style={styles.gridImageOverlay}
      />
      <View style={styles.gridImageInfo}>
        <Text style={styles.gridImageTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.gridImageDate}>{item.date}</Text>
      </View>
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite(item.id);
        }}
        style={styles.favoriteButton}
      >
        <Ionicons 
          name={item.isFavorite ? 'heart' : 'heart-outline'} 
          size={20} 
          color={item.isFavorite ? '#ef4444' : 'white'} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleImagePress(item)} 
      activeOpacity={0.8}
      style={styles.listItem}
    >
      <Image source={{ uri: item.uri }} style={styles.listImage} />
      <View style={styles.listContent}>
        <Text style={styles.listTitle}>{item.title}</Text>
        <Text style={styles.listDate}>{item.date}</Text>
        <View style={styles.listStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color="#ef4444" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#64748b" />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite(item.id);
        }}
        style={styles.listFavoriteButton}
      >
        <Ionicons 
          name={item.isFavorite ? 'heart' : 'heart-outline'} 
          size={20} 
          color={item.isFavorite ? '#ef4444' : '#64748b'} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderImageModal = () => (
    <Modal visible={!!selectedImage} transparent={false} animationType="slide" onRequestClose={closeModal}>
      {/* ...modal content identique, pas besoin de le répéter ici... */}
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images" size={60} color="#e2e8f0" />
      <Text style={styles.emptyTitle}>Aucun souvenir trouvé</Text>
      <Text style={styles.emptyText}>Essayez de modifier vos filtres ou d'ajouter de nouveaux souvenirs</Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => {
          setSelectedFilter('all');
          setSearchQuery('');
          searchInputRef.current?.focus();
        }}
      >
        <Text style={styles.emptyButtonText}>Tout afficher</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <Animated.FlatList
        data={filteredData}
        key={viewMode}
        keyExtractor={(item) => item.id}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        numColumns={viewMode === 'grid' ? 2 : 1}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {renderSearchBar()}
            {renderFilterBar()}
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          filteredData.length === 0 && styles.emptyListContent
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => router.push('/screens/memories/addmemory')}
      >
        <LinearGradient 
          colors={['#667eea', '#764ba2']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 0 }}
          style={styles.floatingButtonGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {renderImageModal()}
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 100,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  listHeader: {
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 15,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    paddingBottom: 30,
  },
  emptyListContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchContainerFocused: {
    borderColor: '#667eea',
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
  clearSearchButton: {
    marginLeft: 10,
  },
  filterScrollContainer: {
    paddingHorizontal: 15,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  gridItem: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  gridImageInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  gridImageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  gridImageDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listContent: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  listDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  listStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 5,
  },
  listFavoriteButton: {
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    paddingBottom: 50,
  },
  modalImage: {
    width: '100%',
    height: height * 0.6,
  },
  modalInfoContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  modalDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
  },
  modalStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  modalStatText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  modalActionText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  commentUserAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 0,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GalleryScreen;