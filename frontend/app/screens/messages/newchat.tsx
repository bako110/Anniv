import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [userStatus, setUserStatus] = useState({
    online_status: false,
    last_seen: null,
    computed_at: null,
    is_realtime: false
  });
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const statusUpdateInterval = useRef(null);
  const timeUpdateInterval = useRef(null);

  const calculateTimeSince = useCallback((lastSeenDate) => {
    if (!lastSeenDate) return "longtemps";
    try {
      const now = new Date();
      const lastSeen = new Date(lastSeenDate);
      const diffInSeconds = Math.floor((now - lastSeen) / 1000);
      if (diffInSeconds < 30) return "à l'instant";
      if (diffInSeconds < 60) return "il y a moins d'1 min";
      if (diffInSeconds < 120) return "il y a 1 min";
      if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
      if (diffInSeconds < 7200) return "il y a 1 h";
      if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
      if (diffInSeconds < 172800) return "il y a 1 jour";
      if (diffInSeconds < 2592000) return `il y a ${Math.floor(diffInSeconds / 86400)} jours`;
      if (diffInSeconds < 5184000) return "il y a 1 mois";
      if (diffInSeconds < 31536000) return `il y a ${Math.floor(diffInSeconds / 2592000)} mois`;
      return "il y a longtemps";
    } catch (error) {
      console.warn('Erreur calcul temps écoulé:', error);
      return "inconnu";
    }
  }, []);

  const getConnectionStatus = useCallback((lastSeenDate, isOnline) => {
    if (isOnline) {
      return { status: 'online', text: 'En ligne', color: '#10b981' };
    }
    if (!lastSeenDate) {
      return { status: 'unknown', text: 'Inconnu', color: '#94a3b8' };
    }
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
    const diffInSeconds = Math.floor((now - lastSeen) / 1000);
    if (diffInSeconds < 300) {
      return { status: 'recently_online', text: 'Récemment en ligne', color: '#f59e0b' };
    } else if (diffInSeconds < 3600) {
      return { status: 'recently_active', text: 'Actif récemment', color: '#6b7280' };
    } else {
      return { status: 'offline', text: calculateTimeSince(lastSeenDate), color: '#94a3b8' };
    }
  }, [calculateTimeSince]);

  const fetchUserStatusWithRetry = async (userId, maxRetries = 3) => {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const status = await getUserStatus(userId, token);
        console.log(`[NewChatScreen] Statut récupéré pour ${userId}:`, status);
        return status;
      } catch (error) {
        console.warn(`[NewChatScreen] Tentative ${retries + 1} échouée pour ${userId}:`, error);
        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }
    return null;
  };

  const updateContactsStatus = useCallback(async () => {
    if (!userId || !token || filteredContacts.length === 0) return;
    try {
      console.log('[NewChatScreen] Mise à jour des statuts des contacts...');
      const updatedSections = await Promise.all(
        filteredContacts.map(async (section) => {
          const updatedContacts = await Promise.allSettled(
            section.data.map(async (contact) => {
              try {
                const status = await fetchUserStatusWithRetry(contact.user_id);
                if (status) {
                  const connectionStatus = getConnectionStatus(status.last_seen, status.online_status);
                  return {
                    ...contact,
                    isOnline: status.online_status || false,
                    lastSeen: connectionStatus.text,
                    connectionStatus: connectionStatus,
                    statusData: status,
                    lastUpdated: new Date().toISOString()
                  };
                }
                return contact;
              } catch (error) {
                console.warn(`[NewChatScreen] Erreur mise à jour statut ${contact.user_id}:`, error);
                return contact;
              }
            })
          );
          return {
            ...section,
            data: updatedContacts
              .filter(result => result.status === 'fulfilled')
              .map(result => result.value)
              .sort((a, b) => {
                const statusOrder = { 'online': 0, 'recently_online': 1, 'recently_active': 2, 'offline': 3, 'unknown': 4 };
                const aOrder = statusOrder[a.connectionStatus?.status] || 4;
                const bOrder = statusOrder[b.connectionStatus?.status] || 4;
                if (aOrder !== bOrder) return aOrder - bOrder;
                const aName = `${a.first_name || ''} ${a.last_name || ''}`.trim();
                const bName = `${b.first_name || ''} ${b.last_name || ''}`.trim();
                return aName.localeCompare(bName);
              })
          };
        })
      );
      setFilteredContacts(updatedSections);
      console.log('[NewChatScreen] Statuts des contacts mis à jour');
    } catch (error) {
      console.error('[NewChatScreen] Erreur mise à jour statuts:', error);
    }
  }, [userId, token, filteredContacts, getConnectionStatus]);

  const updateDisplayedTimes = useCallback(() => {
    setFilteredContacts(currentSections =>
      currentSections.map(section => ({
        ...section,
        data: section.data.map(contact => {
          if (contact.statusData?.last_seen && !contact.isOnline) {
            const connectionStatus = getConnectionStatus(contact.statusData.last_seen, false);
            return {
              ...contact,
              lastSeen: connectionStatus.text,
              connectionStatus: connectionStatus
            };
          }
          return contact;
        })
      }))
    );
  }, [getConnectionStatus]);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUserInfo = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
        if (storedToken) {
          setToken(storedToken);
          console.log('[NewChatScreen] Token chargé avec succès');
        }
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          if (userInfo?.id) {
            setUserId(userInfo.id);
            console.log('[NewChatScreen] UserId chargé:', userInfo.id);
            try {
              const status = await getUserStatus(userInfo.id, storedToken);
              console.log('[NewChatScreen] Statut utilisateur chargé:', status);
              setUserStatus(status);
            } catch (error) {
              console.warn('[NewChatScreen] Erreur chargement statut utilisateur:', error);
            }
          }
        }
      } catch (error) {
        console.warn('[NewChatScreen] Erreur récupération données auth:', error);
      }
    };
    loadAuthData();
  }, []);

  useEffect(() => {
    const updateStatus = async () => {
      if (userId && token) {
        try {
          console.log('[NewChatScreen] Mise à jour statut en ligne...');
          await updateUserStatus(userId, token, true);
          const status = await getUserStatus(userId, token);
          console.log('[NewChatScreen] Statut mis à jour:', status);
          setUserStatus(status);
        } catch (error) {
          console.warn("[NewChatScreen] Erreur mise à jour statut:", error);
        }
      }
    };
    updateStatus();
    return () => {
      if (userId && token) {
        console.log('[NewChatScreen] Mise à jour statut hors ligne...');
        updateUserStatus(userId, token, false).catch(console.warn);
      }
    };
  }, [userId, token]);

  useEffect(() => {
    if (userId && token) {
      statusUpdateInterval.current = setInterval(updateContactsStatus, 30000);
      timeUpdateInterval.current = setInterval(updateDisplayedTimes, 10000);
      return () => {
        if (statusUpdateInterval.current) {
          clearInterval(statusUpdateInterval.current);
        }
        if (timeUpdateInterval.current) {
          clearInterval(timeUpdateInterval.current);
        }
      };
    }
  }, [userId, token, updateContactsStatus, updateDisplayedTimes]);

  useEffect(() => {
    if (userId && token) {
      filterContacts();
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId && token) {
      filterContacts();
    }
  }, [searchQuery, activeTab]);

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
    console.log('[NewChatScreen] Filtrage des contacts...');
    try {
      if (!searchQuery.trim()) {
        const contactsData = await fetchUserFriends(userId);
        console.log('[NewChatScreen] Contacts récupérés:', contactsData?.length);
        const contactsWithStatus = await Promise.allSettled(
          contactsData.map(async (contact) => {
            try {
              console.log(`[NewChatScreen] Récupération statut pour contact ${contact.user_id}`);
              const status = await fetchUserStatusWithRetry(contact.user_id);
              if (status) {
                const connectionStatus = getConnectionStatus(status.last_seen, status.online_status);
                return {
                  ...contact,
                  isOnline: status.online_status || false,
                  lastSeen: connectionStatus.text,
                  connectionStatus: connectionStatus,
                  statusData: status,
                  lastUpdated: new Date().toISOString()
                };
              } else {
                return {
                  ...contact,
                  isOnline: false,
                  lastSeen: "inconnu",
                  connectionStatus: { status: 'unknown', text: 'Inconnu', color: '#94a3b8' },
                  statusData: null,
                  lastUpdated: new Date().toISOString()
                };
              }
            } catch (error) {
              console.warn(`[NewChatScreen] Erreur récupération statut pour ${contact.user_id}:`, error);
              return {
                ...contact,
                isOnline: false,
                lastSeen: "inconnu",
                connectionStatus: { status: 'unknown', text: 'Inconnu', color: '#94a3b8' },
                statusData: null,
                lastUpdated: new Date().toISOString()
              };
            }
          })
        );
        const successfulContacts = contactsWithStatus
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);
        const grouped = successfulContacts.reduce((acc, contact) => {
          const category = contact.category || 'Autres';
          if (!acc[category]) acc[category] = [];
          acc[category].push(contact);
          return acc;
        }, {});
        const sections = Object.keys(grouped).map(category => ({
          title: category,
          data: grouped[category].sort((a, b) => {
            const statusOrder = { 'online': 0, 'recently_online': 1, 'recently_active': 2, 'offline': 3, 'unknown': 4 };
            const aOrder = statusOrder[a.connectionStatus?.status] || 4;
            const bOrder = statusOrder[b.connectionStatus?.status] || 4;
            if (aOrder !== bOrder) return aOrder - bOrder;
            const aName = `${a.first_name || ''} ${a.last_name || ''}`.trim();
            const bName = `${b.first_name || ''} ${b.last_name || ''}`.trim();
            return aName.localeCompare(bName);
          })
        }));
        console.log('[NewChatScreen] Sections créées:', sections.length);
        setFilteredContacts(sections);
        setShowSuggestions(true);
      } else {
        console.log('[NewChatScreen] Recherche d\'utilisateurs:', searchQuery);
        const results = await searchUsers(searchQuery);
        setFilteredContacts([{
          title: 'Résultats',
          data: results.map(contact => ({
            ...contact,
            isOnline: false,
            lastSeen: "inconnu",
            connectionStatus: { status: 'unknown', text: 'Inconnu', color: '#94a3b8' },
            statusData: null,
            lastUpdated: new Date().toISOString()
          }))
        }]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('[NewChatScreen] Erreur filtrage contacts:', error);
      Alert.alert('Erreur', "Impossible de charger les contacts.");
    }
    setIsLoading(false);
  };

  const refreshContacts = async () => {
    setIsRefreshing(true);
    await updateContactsStatus();
    setIsRefreshing(false);
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
              router.push({
                pathname: `/screens/messages/group-creation`,
                params: { contacts: Array.from(selectedContacts).join(',') }
              });
            }
          }
        ]
      );
    } else {
      const targetContactId = contactId || Array.from(selectedContacts)[0];
      router.push({
        pathname: `/screens/messages/chat`,
        params: { conversationId: targetContactId }
      });
    }
  };

  const suggestedGroups = [];

  const startGroupChat = (group) => {
    router.push({
      pathname: `/screens/messages/chat`,
      params: { conversationId: `group_${group.id}` }
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Nouveau chat</Text>
          {userStatus.is_realtime && (
            <View style={styles.realtimeIndicator}>
              <View style={styles.realtimeDot} />
              <Text style={styles.realtimeText}>Temps réel</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshContacts}
          disabled={isRefreshing}
        >
          <Ionicons
            name="refresh"
            size={24}
            color={isRefreshing ? "#94a3b8" : "#667eea"}
          />
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
    const isSelected = selectedContacts.has(item.user_id);
    const fullName = `${item.first_name || ''} ${item.last_name || ''}`.trim();
    const imageUrl = getImageUrl(item.avatar_url);
    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedContactItem]}
        onPress={() => {
          if (selectedContacts.size > 0) {
            toggleContactSelection(item.user_id);
          } else {
            startChat(item.user_id);
          }
        }}
        onLongPress={() => toggleContactSelection(item.user_id)}
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
            {item.connectionStatus && (
              <View style={[
                styles.statusIndicator,
                { backgroundColor: item.connectionStatus.color }
              ]}>
                {item.connectionStatus.status === 'online' && (
                  <View style={styles.onlinePulse} />
                )}
              </View>
            )}
            {isSelected && (
              <View style={styles.selectionOverlay}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>
          <View style={styles.contactInfo}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactName}>{fullName}</Text>
              <Text style={[
                styles.connectionStatus,
                { color: item.connectionStatus?.color || '#94a3b8' }
              ]}>
                {item.connectionStatus?.text || 'Inconnu'}
              </Text>
            </View>
            <Text style={styles.contactStatus} numberOfLines={1}>
              {item.status || 'Aucun statut'}
            </Text>
            <View style={styles.contactMeta}>
              <Ionicons name="people" size={12} color="#94a3b8" />
              <Text style={styles.mutualFriends}>
                {item.mutualFriends || 0} amis en commun
              </Text>
              {item.statusData?.is_realtime && (
                <View style={styles.realtimeIndicatorSmall}>
                  <View style={styles.realtimeDotSmall} />
                  <Text style={styles.realtimeTextSmall}>TR</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => router.push(`/screens/messages/profile?userId=${item.user_id}`)}
          >
            <Ionicons name="information-circle-outline" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupItem = ({ item }) => {
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
            {item.memberCount} membres • {item.lastMessage}
          </Text>
          <View style={styles.groupMeta}>
            <Ionicons name="time" size={12} color="#94a3b8" />
            <Text style={styles.groupTime}>{item.lastMessageTime}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => router.push(`/screens/messages/group-info?groupId=${item.id}`)}
        >
          <Ionicons name="information-circle-outline" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderNearbyItem = ({ item }) => {
    if (!item || !item.user_id) {
      console.warn('[NewChatScreen] Item nearby sans ID détecté:', item);
      return null;
    }
    const fullName = `${item.first_name || ''} ${item.last_name || ''}`.trim();
    const imageUrl = getImageUrl(item.avatar_url);
    return (
      <TouchableOpacity
        style={styles.nearbyItem}
        onPress={() => startChat(item.user_id)}
        activeOpacity={0.7}
      >
        <View style={styles.nearbyContent}>
          <View style={styles.avatarContainer}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.contactAvatar} />
            ) : (
              <View style={[styles.contactAvatar, styles.placeholderAvatar]}>
                <Text style={styles.placeholderText}>
                  {fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.distanceIndicator}>
              <Text style={styles.distanceText}>{item.distance}m</Text>
            </View>
          </View>
          <View style={styles.nearbyInfo}>
            <Text style={styles.nearbyName}>{fullName}</Text>
            <Text style={styles.nearbyStatus} numberOfLines={1}>
              {item.status || 'Aucun statut'}
            </Text>
            <View style={styles.nearbyMeta}>
              <Ionicons name="location" size={12} color="#667eea" />
              <Text style={styles.nearbyDistance}>À {item.distance}m</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }) => {
    if (!showSuggestions) return null;
    const onlineCount = section.data.filter(contact => contact.isOnline).length;
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {section.title} {onlineCount > 0 && `(${onlineCount} en ligne)`}
        </Text>
        <Text style={styles.sectionCount}>
          {section.data.length} {section.data.length > 1 ? 'contacts' : 'contact'}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#cbd5e1" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'Aucun résultat' : 'Aucun contact'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery
          ? 'Essayez d\'autres mots-clés'
          : 'Ajoutez des contacts pour commencer à discuter'}
      </Text>
    </View>
  );

  const renderFloatingActionButton = () => {
    if (selectedContacts.size === 0) return null;
    return (
      <TouchableOpacity
        style={styles.floatingActionButton}
        onPress={() => startChat()}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="chatbubble" size={24} color="white" />
          <Text style={styles.fabText}>{selectedContacts.size}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Chargement des contacts...</Text>
        </View>
      );
    }
    if (activeTab === 'contacts') {
      return (
        <SectionList
          sections={filteredContacts}
          keyExtractor={(item) => item.user_id?.toString() || Math.random().toString()}
          renderItem={renderContactItem}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={renderEmptyState}
          style={styles.contactsList}
          contentContainerStyle={styles.contactsListContent}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={refreshContacts}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      );
    }
    if (activeTab === 'groups') {
      return (
        <FlatList
          data={suggestedGroups}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderGroupItem}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="people-circle-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>Aucun groupe</Text>
              <Text style={styles.emptyStateSubtitle}>
                Créez un groupe pour discuter avec plusieurs personnes
              </Text>
            </View>
          )}
          style={styles.contactsList}
          contentContainerStyle={styles.contactsListContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      );
    }
    if (activeTab === 'nearby') {
      return (
        <FlatList
          data={[]}
          keyExtractor={(item) => item.user_id?.toString() || Math.random().toString()}
          renderItem={renderNearbyItem}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>Aucune personne à proximité</Text>
              <Text style={styles.emptyStateSubtitle}>
                Activez la localisation pour découvrir des personnes près de vous
              </Text>
            </View>
          )}
          style={styles.contactsList}
          contentContainerStyle={styles.contactsListContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {renderHeader()}
            {renderContent()}
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
      {renderFloatingActionButton()}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    top:20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  realtimeDot: {
    width: 6,
    top: 10,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  realtimeText: {
    top: 10,
    fontSize: 10,
    color: '#10b981',
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  contactsList: {
    flex: 1,
  },
  contactsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionCount: {
    fontSize: 14,
    color: '#94a3b8',
  },
  contactItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedContactItem: {
    backgroundColor: '#f0f4ff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  contactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
  },
  placeholderAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
  },
  placeholderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlinePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    opacity: 0.8,
  },
  selectionOverlay: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  connectionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  contactStatus: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
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
  realtimeIndicatorSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  realtimeDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
    marginRight: 2,
  },
  realtimeTextSmall: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '500',
  },
  infoButton: {
    padding: 8,
  },
  groupItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
  },
  groupTypeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
  },
  nearbyItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nearbyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: 'white',
  },
  distanceText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  nearbyInfo: {
    flex: 1,
  },
  nearbyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  nearbyStatus: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  nearbyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyDistance: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
    fontWeight: '500',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fabText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default NewChatScreen;
