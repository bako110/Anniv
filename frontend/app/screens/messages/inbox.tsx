import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';

const { width } = Dimensions.get('window');

// Remplace par l'URL de ton serveur Socket.IO
const SOCKET_SERVER_URL = 'http://tonserveur.com';

const InboxScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all'); // all, unread, groups
  const [refreshing, setRefreshing] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    // Connexion Socket.IO
    socketRef.current = io(SOCKET_SERVER_URL, { transports: ['websocket'] });

    socketRef.current.on('connect', () => {
      console.log('Connecté au serveur socket');
      // On peut demander les conversations initiales
      socketRef.current.emit('getInitialConversations');
    });

    // Réception de la liste initiale des conversations
    socketRef.current.on('initialConversations', (data) => {
      setConversations(data);
    });

    // Réception des mises à jour des conversations en temps réel
    socketRef.current.on('conversationUpdate', (updatedConversation) => {
      setConversations((prev) => {
        const idx = prev.findIndex(c => c.id === updatedConversation.id);
        if (idx !== -1) {
          const newConvs = [...prev];
          newConvs[idx] = updatedConversation;
          return newConvs;
        } else {
          return [updatedConversation, ...prev];
        }
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Déconnecté du serveur socket');
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      selectedTab === 'all' ||
      (selectedTab === 'unread' && conv.unreadCount > 0) ||
      (selectedTab === 'groups' && conv.type === 'group');

    return matchesSearch && matchesTab;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Trier par timestamp (les plus récents en premier)
    return new Date(`2024-01-01 ${b.lastMessage.timestamp}`) - new Date(`2024-01-01 ${a.lastMessage.timestamp}`);
  });

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Tu peux ici déclencher un refresh manuel côté serveur si tu veux
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleConversationPress = (conversation) => {
    // Ici tu peux ajouter la navigation vers l'écran de chat
    router.push(`/screens/messages/chat?conversationId=${conversation.id}`);
  };

  // Actions rapides (juste la navigation, à adapter selon ton app)
  const quickActions = [
    { id: 'new-message', title: 'Nouveau message', icon: 'chatbubble-outline', color: '#667eea' },
    { id: 'new-group', title: 'Nouveau groupe', icon: 'people-outline', color: '#48bb78' },
    { id: 'broadcast', title: 'Diffusion', icon: 'megaphone-outline', color: '#ed8936' },
  ];

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'new-message':
        router.push('/screens/messages/newchat');
        break;
      case 'new-group':
        router.push('/screens/messages/create-group');
        break;
      case 'broadcast':
        router.push('/screens/messages/broadcast');
        break;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            {totalUnreadCount > 0 && (
              <Text style={styles.headerSubtitle}>{totalUnreadCount} non lu(s)</Text>
            )}
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => setIsSearchActive(!isSearchActive)}
          >
            <Ionicons name="search" size={24} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push('/screens/messages/settings')}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>

      {isSearchActive && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher dans les messages..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            Tous
          </Text>
          {totalUnreadCount > 0 && selectedTab === 'all' && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{totalUnreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'unread' && styles.activeTab]}
          onPress={() => setSelectedTab('unread')}
        >
          <Text style={[styles.tabText, selectedTab === 'unread' && styles.activeTabText]}>
            Non lus
          </Text>
          {totalUnreadCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{totalUnreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'groups' && styles.activeTab]}
          onPress={() => setSelectedTab('groups')}
        >
          <Text style={[styles.tabText, selectedTab === 'groups' && styles.activeTabText]}>
            Groupes
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionItem}
            onPress={() => handleQuickAction(action.id)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={20} color="white" />
            </View>
            <Text style={styles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderConversationItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          item.unreadCount > 0 && styles.unreadConversationItem,
        ]}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.participant.avatar }} style={styles.avatar} />
          {item.isPinned && (
            <View style={styles.pinnedIndicator}>
              <Ionicons name="pin" size={12} color="#667eea" />
            </View>
          )}
          {item.type === 'direct' && item.participant.isOnline && (
            <View style={styles.onlineIndicator} />
          )}
          {item.type === 'group' && (
            <View style={styles.groupIndicator}>
              <Ionicons name="people" size={12} color="white" />
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName} numberOfLines={1}>
              {item.participant.name}
            </Text>
            <View style={styles.conversationMeta}>
              <Text style={styles.timestamp}>{item.lastMessage.timestamp}</Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.lastMessageContainer}>
            <Text
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadLastMessage,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.type === 'image' ? '📷 ' : ''}
              {item.lastMessage.text}
            </Text>

            <View style={styles.messageStatus}>
              {item.lastMessage.senderId === 'me' && (
                <Ionicons
                  name={item.lastMessage.isRead ? 'checkmark-done' : 'checkmark'}
                  size={14}
                  color={item.lastMessage.isRead ? '#667eea' : '#94a3b8'}
                />
              )}
            </View>
          </View>

          {item.type === 'group' && (
            <Text style={styles.groupInfo}>{item.participant.memberCount} membres</Text>
          )}

          {item.type === 'direct' &&
            !item.participant.isOnline &&
            item.participant.lastSeen && (
              <Text style={styles.lastSeen}>Vu il y a {item.participant.lastSeen}</Text>
            )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={80} color="#cbd5e1" />
      <Text style={styles.emptyStateTitle}>Aucune conversation</Text>
      <Text style={styles.emptyStateText}>Commence une nouvelle conversation.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {!isSearchActive && renderTabs()}
      {!isSearchActive && renderQuickActions()}
      <FlatList
        data={sortedConversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConversationItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={sortedConversations.length === 0 && { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
      />

      {/* Bouton flottant en bas à droite */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/screens/messages/newchat')}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.floatingButtonGradient}
        >
          <Ionicons name="chatbubble" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#667eea',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 20,
  },
  searchContainer: {
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    marginRight: 20,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  tabBadge: {
    marginLeft: 6,
    backgroundColor: '#e53e3e',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    paddingVertical: 10,
    paddingLeft: 15,
    backgroundColor: '#fff',
  },
  quickActionItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  quickActionIcon: {
    padding: 12,
    borderRadius: 24,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: '#1e293b',
  },
  conversationItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    backgroundColor: 'white',
  },
  unreadConversationItem: {
    backgroundColor: '#f0f5ff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  pinnedIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    padding: 2,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#48bb78',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    backgroundColor: '#667eea',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    maxWidth: width * 0.55,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748b',
    maxWidth: width * 0.75,
  },
  unreadLastMessage: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  messageStatus: {
    marginLeft: 8,
  },
  groupInfo: {
    marginTop: 2,
    fontSize: 12,
    color: '#94a3b8',
  },
  lastSeen: {
    marginTop: 2,
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    color: '#64748b',
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  floatingButtonGradient: {
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InboxScreen;
