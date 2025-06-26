import React, { useState } from 'react';
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
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = (width - 40) / 2;

// Données de démonstration enrichies pour anniversaire
const wishlistItems = [
  {
    id: '1',
    title: 'Casque Audio Premium',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    category: 'Électronique',
    savedFor: 'Anniversaire',
    date: '25 Juin 2024',
    priority: 'high',
    isReserved: false,
    link: 'https://example.com/product1',
    brand: 'Sony'
  },
  {
    id: '2',
    title: 'Montre Connectée Pro',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    category: 'Électronique',
    savedFor: 'Anniversaire',
    date: '25 Juin 2024',
    priority: 'medium',
    isReserved: true,
    reservedBy: 'Marie',
    link: 'https://example.com/product2',
    brand: 'Apple'
  },
  {
    id: '3',
    title: 'Ensemble Sportswear',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=300&h=300&fit=crop',
    category: 'Mode',
    savedFor: 'Anniversaire',
    date: '25 Juin 2024',
    priority: 'low',
    isReserved: false,
    link: 'https://example.com/product3',
    brand: 'Nike'
  },
  {
    id: '4',
    title: 'Chaussures de Luxe',
    price: 459.99,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop',
    category: 'Mode',
    savedFor: 'Anniversaire',
    date: '25 Juin 2024',
    priority: 'high',
    isReserved: false,
    link: 'https://example.com/product4',
    brand: 'Gucci'
  },
  {
    id: '5',
    title: 'Smartphone Flagship',
    price: 999.99,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop',
    category: 'Électronique',
    savedFor: 'Anniversaire',
    date: '25 Juin 2024',
    priority: 'high',
    isReserved: false,
    link: 'https://example.com/product5',
    brand: 'Samsung'
  },
  {
    id: '6',
    title: 'Parfum de Luxe',
    price: 599.99,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop',
    category: 'Beauté',
    savedFor: 'Anniversaire',
    date: '25 Juin 2024',
    priority: 'medium',
    isReserved: false,
    link: 'https://example.com/product6',
    brand: 'Chanel'
  },
];

const categories = [
  { id: 'all', name: 'Tous', icon: 'grid' },
  { id: 'electronics', name: 'Électronique', icon: 'phone-portrait' },
  { id: 'fashion', name: 'Mode', icon: 'shirt' },
  { id: 'beauty', name: 'Beauté', icon: 'flower' },
  { id: 'books', name: 'Livres', icon: 'book' },
  { id: 'other', name: 'Autre', icon: 'ellipsis-horizontal' },
];

const WishlistScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filteredItems = wishlistItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
      item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.gradientHeader}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>🎂 Ma Wishlist</Text>
          <Text style={styles.headerSubtitle}>Liste d'anniversaire</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'list' : 'grid-outline'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => router.push('/screens/ecommerce/addwishlistitem')}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un cadeau d'anniversaire..."
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </LinearGradient>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoriesWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon} 
              size={18} 
              color={selectedCategory === category.id ? 'white' : '#667eea'} 
              style={styles.categoryIcon}
            />
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

  const renderPriorityBadge = (priority) => {
    const priorityData = {
      high: { color: '#ff4757', icon: 'star', text: 'Urgent' },
      medium: { color: '#ffa502', icon: 'time', text: 'Bientôt' },
      low: { color: '#26de81', icon: 'checkmark-circle', text: 'Plus tard' }
    };

    return (
      <View style={[styles.priorityBadge, { backgroundColor: priorityData[priority].color }]}>
        <Ionicons name={priorityData[priority].icon} size={10} color="white" />
        <Text style={styles.priorityText}>{priorityData[priority].text}</Text>
      </View>
    );
  };

  const renderReservedBadge = (item) => {
    if (!item.isReserved) return null;
    
    return (
      <View style={styles.reservedOverlay}>
        <View style={styles.reservedBadge}>
          <Ionicons name="gift" size={14} color="white" />
          <Text style={styles.reservedText}>Réservé par {item.reservedBy}</Text>
        </View>
      </View>
    );
  };

  const renderBrandTag = (brand) => (
    <View style={styles.brandTag}>
      <Text style={styles.brandText}>{brand}</Text>
    </View>
  );

  const renderGridItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.gridItem, { width: ITEM_WIDTH }]}
      onPress={() => router.push(`/screens/ecommerce/WishlistItemDetails?id=${item.id}`)}
    >
      <View style={styles.gridImageContainer}>
        <Image source={{ uri: item.image }} style={styles.gridImage} />
        <View style={styles.badgesContainer}>
          {renderPriorityBadge(item.priority)}
        </View>
        {item.brand && renderBrandTag(item.brand)}
        {renderReservedBadge(item)}
      </View>
      
      <View style={styles.gridDetails}>
        <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gridPrice}>{item.price.toFixed(2)} €</Text>
        
        <View style={styles.gridMetaContainer}>
          <View style={styles.gridCategoryContainer}>
            <Ionicons 
              name={categories.find(c => c.name.toLowerCase() === item.category.toLowerCase())?.icon || 'pricetag'} 
              size={12} 
              color="#64748b" 
            />
            <Text style={styles.gridCategory}>{item.category}</Text>
          </View>
          
          <View style={styles.gridDateContainer}>
            <Ionicons name="calendar" size={12} color="#667eea" />
            <Text style={styles.gridDate}>25 Juin</Text>
          </View>
        </View>
        
        <View style={styles.gridFooter}>
          <View style={styles.birthdayTag}>
            <Text style={styles.birthdayText}>🎁 Anniversaire</Text>
          </View>
          <TouchableOpacity style={styles.gridHeartButton}>
            <Ionicons name="heart" size={16} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => router.push(`/screens/ecommerce/WishlistItemDetails?id=${item.id}`)}
    >
      <View style={styles.listImageContainer}>
        <Image source={{ uri: item.image }} style={styles.listImage} />
        <View style={styles.listPriorityContainer}>
          {renderPriorityBadge(item.priority)}
        </View>
        {item.brand && (
          <View style={styles.listBrandContainer}>
            {renderBrandTag(item.brand)}
          </View>
        )}
      </View>
      
      <View style={styles.listDetails}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.listPrice}>{item.price.toFixed(2)} €</Text>
        </View>
        
        <View style={styles.listMeta}>
          <View style={styles.listMetaItem}>
            <Ionicons name="calendar-outline" size={14} color="#667eea" />
            <Text style={styles.listMetaText}>Anniversaire - 25 Juin</Text>
          </View>
          <View style={styles.listMetaItem}>
            <Ionicons name="pricetag-outline" size={14} color="#64748b" />
            <Text style={styles.listMetaText}>{item.category}</Text>
          </View>
        </View>
        
        <View style={styles.listFooter}>
          <View style={styles.listBirthdayTag}>
            <Ionicons name="gift-outline" size={14} color="#667eea" />
            <Text style={styles.listBirthdayText}>Cadeau d'anniversaire</Text>
          </View>
          {item.isReserved ? (
            <View style={styles.listReserved}>
              <Ionicons name="checkmark-done" size={14} color="#26de81" />
              <Text style={styles.listReservedText}>Réservé</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.listReserveButton}>
              <Text style={styles.listReserveButtonText}>Réserver</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.emptyIllustration}
      >
        <Text style={styles.emptyIcon}>🎂</Text>
      </LinearGradient>
      <Text style={styles.emptyTitle}>Votre liste d'anniversaire est vide</Text>
      <Text style={styles.emptyText}>
        Ajoutez des cadeaux que vous aimeriez recevoir pour votre anniversaire !
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.push('/screens/ecommerce/addwishlistitem')}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>Ajouter un cadeau</Text>
          <Ionicons name="gift" size={20} color="white" style={{ marginLeft: 8 }} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderCategoryFilter()}
      
      {filteredItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredItems}
          key={`${viewMode}-${selectedCategory}`}
          keyExtractor={(item) => item.id}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#667eea', '#764ba2']}
            />
          }
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                🎁 {filteredItems.length} {filteredItems.length > 1 ? 'cadeaux' : 'cadeau'} pour votre anniversaire
              </Text>
              <Text style={styles.sectionSubtitle}>25 Juin 2024</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7ff',
  },
  gradientHeader: {
    paddingBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 2,
  },
  categoriesWrapper: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f3ff',
    borderWidth: 2,
    borderColor: '#d4deff',
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: 'white',
  },
  sectionHeader: {
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  gridItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 6,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e8edff',
  },
  gridImageContainer: {
    position: 'relative',
    height: 140,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 3,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 3,
  },
  brandTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 2,
  },
  brandText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  reservedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(38, 222, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  reservedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#26de81',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reservedText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  gridDetails: {
    padding: 14,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 20,
  },
  gridPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  gridMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,

  },
  gridCategory: {
    fontSize: 9,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  gridDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridDate: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
    fontWeight: '600',
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  birthdayTag: {
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d4deff',
  },
  birthdayText: {
    fontSize: 11,
    color: '#667eea',
    fontWeight: '600',
  },
  gridHeartButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f0f3ff',
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 8,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e8edff',
  },
  listImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  listPriorityContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 2,
  },
  listBrandContainer: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    zIndex: 2,
  },
  listDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  listPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  listMeta: {
    marginBottom: 12,
    gap: 8,
  },
  listMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listMetaText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listBirthdayTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4deff',
  },
  listBirthdayText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
    fontWeight: '600',
  },
  listReserved: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fff4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9ae6b4',
  },
  listReservedText: {
    fontSize: 12,
    color: '#26de81',
    marginLeft: 4,
    fontWeight: '600',
  },
  listReserveButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  listReserveButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -50,
  },
  emptyIllustration: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  emptyButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WishlistScreen;