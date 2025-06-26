import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Image,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SectionList,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Données d'exemple pour les contacts
const contactsData = [
  {
    id: 'user1',
    name: 'Marie Dubois',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    phone: '+33 6 12 34 56 78',
    isOnline: true,
    lastSeen: null,
    status: 'Développeuse passionnée',
    mutualFriends: 12,
    category: 'Favoris'
  },
  {
    id: 'user2',
    name: 'Pierre Martin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    phone: '+33 6 98 76 54 32',
    isOnline: false,
    lastSeen: '2h',
    status: 'Designer UI/UX',
    mutualFriends: 8,
    category: 'Favoris'
  },
  {
    id: 'user3',
    name: 'Sophie Laurent',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    phone: '+33 6 45 67 89 01',
    isOnline: true,
    lastSeen: null,
    status: 'Chef de projet',
    mutualFriends: 15,
    category: 'Collègues'
  },
  {
    id: 'user4',
    name: 'Lucas Bernard',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    phone: '+33 6 23 45 67 89',
    isOnline: false,
    lastSeen: '1j',
    status: 'Étudiant en informatique',
    mutualFriends: 3,
    category: 'Amis'
  },
  {
    id: 'user5',
    name: 'Emma Rousseau',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=80&h=80&fit=crop&crop=face',
    phone: '+33 6 78 90 12 34',
    isOnline: true,
    lastSeen: null,
    status: 'Marketing digital',
    mutualFriends: 7,
    category: 'Collègues'
  },
  {
    id: 'user6',
    name: 'Thomas Petit',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    phone: '+33 6 56 78 90 12',
    isOnline: false,
    lastSeen: '3h',
    status: 'Photographe',
    mutualFriends: 5,
    category: 'Amis'
  },
  {
    id: 'user7',
    name: 'Julie Moreau',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face',
    phone: '+33 6 34 56 78 90',
    isOnline: true,
    lastSeen: null,
    status: 'Architecte',
    mutualFriends: 10,
    category: 'Amis'
  },
  {
    id: 'user8',
    name: 'Antoine Leroy',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=80&h=80&fit=crop&crop=face',
    phone: '+33 6 12 90 78 56',
    isOnline: false,
    lastSeen: '5h',
    status: 'Ingénieur logiciel',
    mutualFriends: 6,
    category: 'Collègues'
  }
];

// Groupes suggérés
const suggestedGroups = [
  {
    id: 'group1',
    name: 'Équipe Design',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=80&h=80&fit=crop',
    members: ['Marie Dubois', 'Pierre Martin', 'Sophie Laurent'],
    memberCount: 8,
    type: 'work'
  },
  {
    id: 'group2',
    name: 'Amis Lycée',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=80&h=80&fit=crop',
    members: ['Lucas Bernard', 'Emma Rousseau', 'Thomas Petit'],
    memberCount: 12,
    type: 'friends'
  },
  {
    id: 'group3',
    name: 'Projet Mobile',
    avatar: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=80&h=80&fit=crop',
    members: ['Julie Moreau', 'Antoine Leroy', 'Sophie Laurent'],
    memberCount: 5,
    type: 'work'
  }
];

const NewChatScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts'); // contacts, groups, nearby
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Focus automatique sur la recherche
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 400);
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, activeTab]);

  const filterContacts = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (!searchQuery.trim()) {
        // Grouper les contacts par catégorie
        const grouped = contactsData.reduce((acc, contact) => {
          const category = contact.category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(contact);
          return acc;
        }, {});

        const sections = Object.keys(grouped).map(category => ({
          title: category,
          data: grouped[category].sort((a, b) => {
            // Trier par statut en ligne puis par nom
            if (a.isOnline !== b.isOnline) {
              return b.isOnline - a.isOnline;
            }
            return a.name.localeCompare(b.name);
          })
        }));

        setFilteredContacts(sections);
        setShowSuggestions(true);
      } else {
        // Recherche dans tous les contacts
        const filtered = contactsData.filter(contact =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phone.includes(searchQuery) ||
          contact.status.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setFilteredContacts([{ title: 'Résultats', data: filtered }]);
        setShowSuggestions(false);
      }
      setIsLoading(false);
    }, 200);
  };

  const toggleContactSelection = (contactId) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContacts(newSelection);
  };

  const startChat = (contactId) => {
    if (selectedContacts.size > 1) {
      // Créer un groupe
      Alert.alert(
        'Créer un groupe',
        `Créer un groupe avec ${selectedContacts.size} personnes ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Créer', 
            onPress: () => {
              router.push(`/screens/messages/group-creation?contacts=${Array.from(selectedContacts).join(',')}`);
            }
          }
        ]
      );
    } else {
      // Chat individuel
      const targetContactId = contactId || Array.from(selectedContacts)[0];
      router.push(`/screens/messages/chat?conversationId=${targetContactId}`);
    }
  };

  const startGroupChat = (group) => {
    router.push(`/screens/messages/chat?conversationId=group_${group.id}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Nouveau chat</Text>
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              'Options',
              'Choisissez une action',
              [
                { text: 'Inviter des amis', onPress: () => {} },
                { text: 'Scanner QR Code', onPress: () => {} },
                { text: 'Annuler', style: 'cancel' }
              ]
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Rechercher des contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery ? (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'contacts' ? '#667eea' : '#94a3b8'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'contacts' && styles.activeTabText
          ]}>
            Contacts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Ionicons 
            name="people-circle" 
            size={20} 
            color={activeTab === 'groups' ? '#667eea' : '#94a3b8'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'groups' && styles.activeTabText
          ]}>
            Groupes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'nearby' && styles.activeTab]}
          onPress={() => setActiveTab('nearby')}
        >
          <Ionicons 
            name="location" 
            size={20} 
            color={activeTab === 'nearby' ? '#667eea' : '#94a3b8'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'nearby' && styles.activeTabText
          ]}>
            À proximité
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContactItem = ({ item }) => {
    const isSelected = selectedContacts.has(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          isSelected && styles.selectedContactItem
        ]}
        onPress={() => {
          if (selectedContacts.size > 0) {
            toggleContactSelection(item.id);
          } else {
            startChat(item.id);
          }
        }}
        onLongPress={() => toggleContactSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.contactContent}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
            {item.isOnline && <View style={styles.onlineIndicator} />}
            {isSelected && (
              <View style={styles.selectionOverlay}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactName}>{item.name}</Text>
              {item.isOnline ? (
                <Text style={styles.onlineStatus}>En ligne</Text>
              ) : (
                <Text style={styles.lastSeen}>Il y a {item.lastSeen}</Text>
              )}
            </View>
            <Text style={styles.contactStatus} numberOfLines={1}>
              {item.status}
            </Text>
            <View style={styles.contactMeta}>
              <Ionicons name="people" size={12} color="#94a3b8" />
              <Text style={styles.mutualFriends}>
                {item.mutualFriends} amis en commun
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => router.push(`/screens/messages/profile?userId=${item.id}`)}
          >
            <Ionicons name="information-circle-outline" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => startGroupChat(item)}
      activeOpacity={0.7}
    >
      <View style={styles.groupAvatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.groupAvatar} />
        <View style={[
          styles.groupTypeIndicator,
          { backgroundColor: item.type === 'work' ? '#667eea' : '#10b981' }
        ]}>
          <Ionicons 
            name={item.type === 'work' ? 'briefcase' : 'heart'} 
            size={12} 
            color="white" 
          />
        </View>
      </View>
      
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupMembers} numberOfLines={1}>
          {item.members.join(', ')}
        </Text>
        <Text style={styles.groupMemberCount}>
          {item.memberCount} membres
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderSuggestions = () => {
    if (!showSuggestions || searchQuery) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => {
              Alert.alert('Nouveau groupe', 'Créer un nouveau groupe de discussion');
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#667eea' }]}>
              <Ionicons name="people" size={20} color="white" />
            </View>
            <Text style={styles.quickActionText}>Nouveau groupe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => {
              Alert.alert('Contact', 'Ajouter un nouveau contact');
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#10b981' }]}>
              <Ionicons name="person-add" size={20} color="white" />
            </View>
            <Text style={styles.quickActionText}>Ajouter contact</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => {
              Alert.alert('Invitation', 'Inviter des amis à rejoindre l\'app');
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="share" size={20} color="white" />
            </View>
            <Text style={styles.quickActionText}>Inviter amis</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'groups' && (
          <View style={styles.suggestedGroupsContainer}>
            <Text style={styles.suggestedTitle}>Groupes suggérés</Text>
            {suggestedGroups.map((group) => (
              <View key={group.id}>
                {renderGroupItem({ item: group })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderFloatingButton = () => {
    if (selectedContacts.size === 0) return null;

    return (
      <Animated.View 
        style={[
          styles.floatingButton,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => startChat()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.floatingButtonGradient}
          >
            <View style={styles.floatingButtonContent}>
              <Ionicons 
                name={selectedContacts.size > 1 ? "people" : "chatbubble"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.floatingButtonText}>
                {selectedContacts.size > 1 
                  ? `Créer groupe (${selectedContacts.size})`
                  : 'Démarrer chat'
                }
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      );
    }

    if (activeTab === 'contacts') {
      return (
        <SectionList
          sections={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderSuggestions}
          stickySectionHeadersEnabled={false}
        />
      );
    }

    if (activeTab === 'groups') {
      return (
        <FlatList
          data={suggestedGroups}
          keyExtractor={(item) => item.id}
          renderItem={renderGroupItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderSuggestions}
        />
      );
    }

    if (activeTab === 'nearby') {
      return (
        <View style={styles.nearbyContainer}>
          <View style={styles.nearbyIcon}>
            <Ionicons name="location" size={48} color="#94a3b8" />
          </View>
          <Text style={styles.nearbyTitle}>Personnes à proximité</Text>
          <Text style={styles.nearbyDescription}>
            Activez votre localisation pour découvrir les personnes près de vous
          </Text>
          <TouchableOpacity style={styles.enableLocationButton}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.enableLocationGradient}
            >
              <Text style={styles.enableLocationText}>Activer la localisation</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[
            styles.contentAnimated,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {renderContent()}
        </Animated.View>
      </KeyboardAvoidingView>
      
      {renderFloatingButton()}
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
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  moreButton: {
    padding: 5,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 10,
  },
  clearButton: {
    marginLeft: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentAnimated: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 100,
  },
  suggestionsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  suggestedGroupsContainer: {
    marginTop: 10,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  sectionHeader: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  contactItem: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 2,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedContactItem: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: 'white',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    backgroundColor: 'rgba(102, 126, 234, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  onlineStatus: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  lastSeen: {
    fontSize: 12,
    color: '#94a3b8',
  },
  contactStatus: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutualFriends: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
  },
  infoButton: {
    padding: 5,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 2,
    padding: 15,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupTypeIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  groupMemberCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  nearbyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  nearbyIcon: {
    marginBottom: 20,
  },
  nearbyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  nearbyDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  enableLocationButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  enableLocationGradient: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  enableLocationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    borderRadius: 25,
  },
  floatingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NewChatScreen;