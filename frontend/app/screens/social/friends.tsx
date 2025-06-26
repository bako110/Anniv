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
  TextInput,
  Animated,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Données d'exemple pour les amis
const friendsData = [
  {
    id: '1',
    name: 'Marie Dubois',
    mutualFriends: 12,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    status: 'online',
    lastSeen: 'En ligne',
    isCloseFriend: true
  },
  {
    id: '2',
    name: 'Pierre Martin',
    mutualFriends: 8,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    status: 'offline',
    lastSeen: 'Hier, 18:30',
    isCloseFriend: false
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    mutualFriends: 15,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    status: 'online',
    lastSeen: 'En ligne',
    isCloseFriend: true
  },
  {
    id: '4',
    name: 'Thomas Legrand',
    mutualFriends: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    status: 'recent',
    lastSeen: 'Il y a 30 min',
    isCloseFriend: false
  },
  {
    id: '5',
    name: 'Julie Bernard',
    mutualFriends: 3,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
    status: 'offline',
    lastSeen: 'Il y a 2 jours',
    isCloseFriend: false
  },
  {
    id: '6',
    name: 'Alexandre Petit',
    mutualFriends: 7,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    status: 'online',
    lastSeen: 'En ligne',
    isCloseFriend: true
  },
];

// Suggestions d'amis
const friendSuggestions = [
  {
    id: '1',
    name: 'Camille Durand',
    mutualFriends: 5,
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=60&h=60&fit=crop&crop=face',
    connectionType: 'Amis en commun'
  },
  {
    id: '2',
    name: 'Nicolas Moreau',
    mutualFriends: 3,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=face',
    connectionType: 'Contacts téléphone'
  },
  {
    id: '3',
    name: 'Elodie Lambert',
    mutualFriends: 2,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=face',
    connectionType: 'Même ville'
  }
];

const FriendsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const filteredFriends = friendsData.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeFriends = filteredFriends.filter(friend => friend.isCloseFriend);
  const onlineFriends = filteredFriends.filter(friend => friend.status === 'online');

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendItem}
      onPress={() => router.push(`/screens/profile/profilescreenid?userId=${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
        {item.status === 'online' && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStatus}>
          {item.status === 'online' ? 'En ligne' : `Vu ${item.lastSeen}`}
        </Text>
        {item.mutualFriends > 0 && (
          <Text style={styles.mutualFriends}>
            {item.mutualFriends} amis en commun
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons 
          name={item.isCloseFriend ? 'heart' : 'heart-outline'} 
          size={24} 
          color={item.isCloseFriend ? '#ef4444' : '#94a3b8'} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSuggestionItem = ({ item }) => (
    <View style={styles.suggestionCard}>
      <Image source={{ uri: item.avatar }} style={styles.suggestionAvatar} />
      <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.suggestionConnection}>{item.mutualFriends} amis en commun</Text>
      <View style={styles.suggestionActions}>
        <TouchableOpacity style={styles.addFriendButton}>
          <Text style={styles.addFriendText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#334155" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Amis</Text>
      <TouchableOpacity style={styles.headerIcon}>
        <Ionicons name="person-add" size={24} color="#334155" />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
        onPress={() => setActiveTab('all')}
      >
        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tous</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'close' && styles.activeTab]}
        onPress={() => setActiveTab('close')}
      >
        <Text style={[styles.tabText, activeTab === 'close' && styles.activeTabText]}>Proches</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'online' && styles.activeTab]}
        onPress={() => setActiveTab('online')}
      >
        <Text style={[styles.tabText, activeTab === 'online' && styles.activeTabText]}>En ligne</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher des amis..."
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity 
          style={styles.clearSearchButton}
          onPress={() => setSearchQuery('')}
        >
          <Ionicons name="close-circle" size={20} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  );

  const getFriendsToDisplay = () => {
    switch (activeTab) {
      case 'close':
        return closeFriends;
      case 'online':
        return onlineFriends;
      default:
        return filteredFriends;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <Animated.View style={{ opacity: fadeAnim }}>
        {renderSearchBar()}
        {renderTabs()}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Liste d'amis */}
        <FlatList
          data={getFriendsToDisplay()}
          renderItem={renderFriendItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.friendsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={50} color="#cbd5e1" />
              <Text style={styles.emptyText}>Aucun ami trouvé</Text>
            </View>
          }
        />

        {/* Suggestions d'amis */}
        {activeTab === 'all' && searchQuery.length === 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>Suggestions d'amis</Text>
            <FlatList
              horizontal
              data={friendSuggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}
            />
          </View>
        )}

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{friendsData.length}</Text>
            <Text style={styles.statLabel}>Amis</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{onlineFriends.length}</Text>
            <Text style={styles.statLabel}>En ligne</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{closeFriends.length}</Text>
            <Text style={styles.statLabel}>Proches</Text>
          </View>
        </View>
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
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerIcon: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
  },
  clearSearchButton: {
    marginLeft: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#e0e7ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#4f46e5',
  },
  scrollView: {
    flex: 1,
  },
  friendsList: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: 'white',
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
    color: '#64748b',
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 10,
  },
  suggestionsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  suggestionsList: {
    paddingBottom: 10,
  },
  suggestionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    width: 150,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestionAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  suggestionConnection: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  addFriendButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  addFriendText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default FriendsScreen;