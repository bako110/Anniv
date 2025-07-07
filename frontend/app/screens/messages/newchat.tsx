import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  SectionList,
  FlatList,
  Image,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserFriends, searchUsers } from '../../../services/contacts';
import { API_BASE_URL } from '@/constants/config';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { getUserStatus, updateUserStatus } from '@/services/status';

const { width, height } = Dimensions.get('window');

const NewChatScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [userStatus, setUserStatus] = useState({ online_status: false, last_seen: null });

  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Fonction pour calculer le temps écoulé depuis last_seen
  const calculateTimeSince = (lastSeenDate) => {
    if (!lastSeenDate) return "longtemps";
    
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
    const diffInSeconds = Math.floor((now - lastSeen) / 1000);
    
    if (diffInSeconds < 60) return "à l'instant";
    if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `il y a ${Math.floor(diffInSeconds / 86400)} j`;
    return "longtemps";
  };

  // Récupérer token et userId au montage
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUserInfo = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
        if (storedToken) setToken(storedToken);

        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          if (userInfo?.id) {
            setUserId(userInfo.id);
            // Charger le statut de l'utilisateur
            const status = await getUserStatus(userInfo.id, storedToken);
            setUserStatus(status);
          }
        }
      } catch (error) {
        console.warn('Erreur récupération token ou userInfo:', error);
      }
    };

    loadAuthData();
  }, []);

  // Mettre à jour le statut lorsque le composant est focus
  useEffect(() => {
    const updateStatus = async () => {
      if (userId && token) {
        try {
          await updateUserStatus(userId, token, true);
          const status = await getUserStatus(userId, token);
          setUserStatus(status);
        } catch (error) {
          console.warn("Erreur mise à jour statut:", error);
        }
      }
    };

    updateStatus();

    return () => {
      if (userId && token) {
        updateUserStatus(userId, token, false).catch(console.warn);
      }
    };
  }, [userId, token]);

  // Appeler filterContacts lorsque userId ou token change
  useEffect(() => {
    if (userId && token) {
      filterContacts();
    }
  }, [userId, token]);

  // Relancer filtre quand recherche ou onglet change
  useEffect(() => {
    if (userId && token) {
      filterContacts();
    }
  }, [searchQuery, activeTab]);

  // Fonction pour construire l'URL complète de l'image
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }

    return `${API_BASE_URL}/${imageUrl}`;
  };

  useEffect(() => {
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

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 400);
  }, []);

  const filterContacts = async () => {
    setIsLoading(true);

    try {
      if (!searchQuery.trim()) {
        const contactsData = await fetchUserFriends(userId);

        // Ajouter le statut pour chaque contact
        const contactsWithStatus = await Promise.all(
          contactsData.map(async (contact) => {
            try {
              const status = await getUserStatus(contact.id, token);
              return {
                ...contact,
                isOnline: status.online_status,
                lastSeen: calculateTimeSince(status.last_seen)
              };
            } catch (error) {
              console.warn(`Erreur récupération statut pour ${contact.id}:`, error);
              return {
                ...contact,
                isOnline: false,
                lastSeen: "inconnu"
              };
            }
          })
        );

        const grouped = contactsWithStatus.reduce((acc, contact) => {
          const category = contact.category || 'Autres';
          if (!acc[category]) acc[category] = [];
          acc[category].push(contact);
          return acc;
        }, {});

        const sections = Object.keys(grouped).map(category => ({
          title: category,
          data: grouped[category].sort((a, b) => {
            if (a.isOnline !== b.isOnline) return b.isOnline - a.isOnline;
            const aName = `${a.first_name || ''} ${a.last_name || ''}`.trim();
            const bName = `${b.first_name || ''} ${b.last_name || ''}`.trim();
            return aName.localeCompare(bName);
          })
        }));

        setFilteredContacts(sections);
        setShowSuggestions(true);
      } else {
        const results = await searchUsers(searchQuery);
        setFilteredContacts([{ 
          title: 'Résultats', 
          data: results.map(contact => ({
            ...contact,
            isOnline: false,
            lastSeen: "inconnu"
          }))
        }]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Erreur filtrage contacts :', error);
      Alert.alert('Erreur', "Impossible de charger les contacts.");
    }

    setIsLoading(false);
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
      const targetContactId = contactId || Array.from(selectedContacts)[0];
      router.push(`/screens/messages/chat?conversationId=${targetContactId}`);
    }
  };

  const suggestedGroups = [];

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

  const renderContactItem = ({ item, index }) => {
    const isSelected = selectedContacts.has(item.id);
    const fullName = `${item.first_name || ''} ${item.last_name || ''}`.trim();
    const imageUrl = getImageUrl(item.avatar_url);

    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedContactItem]}
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
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.contactAvatar}
                onError={(e) => {
                  console.log('Erreur de chargement d\'image:', e.nativeEvent.error);
                }}
              />
            ) : (
              <View style={[styles.contactAvatar, styles.placeholderAvatar]}>
                <Text style={styles.placeholderText}>
                  {fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase()}
                </Text>
              </View>
            )}
            {item.isOnline && <View style={styles.onlineIndicator} />}
            {isSelected && (
              <View style={styles.selectionOverlay}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>
          <View style={styles.contactInfo}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactName}>{fullName}</Text>
              {item.isOnline ? (
                <Text style={styles.onlineStatus}>En ligne</Text>
              ) : (
                <Text style={styles.lastSeen}>{item.lastSeen}</Text>
              )}
            </View>
            <Text style={styles.contactStatus} numberOfLines={1}>
              {item.status || 'Aucun statut'}
            </Text>
            <View style={styles.contactMeta}>
              <Ionicons name="people" size={12} color="#94a3b8" />
              <Text style={styles.mutualFriends}>
                {item.mutualFriends || 0} amis en commun
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

  const renderGroupItem = ({ item, index }) => {
    const imageUrl = getImageUrl(item.avatar);

    return (
      <TouchableOpacity
        style={styles.groupItem}
        onPress={() => startGroupChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.groupAvatarContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.groupAvatar} />
          ) : (
            <View style={[styles.groupAvatar, styles.placeholderAvatar]}>
              <Text style={styles.placeholderText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
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
  };

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

        {activeTab === 'groups' && suggestedGroups.length > 0 && (
          <View style={styles.suggestedGroupsContainer}>
            <Text style={styles.suggestedTitle}>Groupes suggérés</Text>
            {suggestedGroups.map((group, index) => (
              <View key={`suggested-group-${group.id || index}-${Math.random()}`}>
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
          keyExtractor={(item, index) => `contact-${item.id || index}-${Math.random()}`}
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
          keyExtractor={(item, index) => `group-${item.id || index}-${Math.random()}`}
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  moreButton: {
    padding: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
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
    marginLeft: 10,
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    padding: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#f0f4ff',
  },
  tabText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
  },
  contentAnimated: {
    flex: 1,
  },
  listContainer: {
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 10,
  },
  sectionHeader: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
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
    marginHorizontal: 20,
    marginVertical: 2,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedContactItem: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
    borderWidth: 2,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e2e8f0',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  placeholderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#10b981',
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
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 2,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  groupAvatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e2e8f0',
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
  suggestionsContainer: {
    paddingBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickAction: {
    alignItems: 'center',
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
    color: '#64748b',
    fontWeight: '500',
  },
  suggestedGroupsContainer: {
    paddingTop: 20,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 10,
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
    paddingVertical: 15,
    borderRadius: 25,
  },
  enableLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  floatingButtonGradient: {
    borderRadius: 25,
  },
  floatingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 10,
  },
});

export default NewChatScreen; 