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
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Données d'exemple pour les conversations
const conversationsData = [
  {
    id: '1',
    participant: {
      id: 'user1',
      name: 'Marie Dubois',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
      isOnline: true,
    },
    lastMessage: {
      text: 'Salut ! Tu viens à la fête de Julie ce soir ?',
      timestamp: '14:30',
      isRead: false,
      senderId: 'user1',
    },
    unreadCount: 2,
    isPinned: true,
    type: 'direct',
  },
  {
    id: '2',
    participant: {
      id: 'user2',
      name: 'Pierre Martin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      isOnline: false,
      lastSeen: '2h',
    },
    lastMessage: {
      text: 'Merci pour l\'invitation ! 🎉',
      timestamp: '12:45',
      isRead: true,
      senderId: 'me',
    },
    unreadCount: 0,
    isPinned: false,
    type: 'direct',
  },
  {
    id: '3',
    participant: {
      id: 'group1',
      name: 'Anniversaire Julie 🎂',
      avatar: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=80&h=80&fit=crop',
      isGroup: true,
      memberCount: 8,
    },
    lastMessage: {
      text: 'Sophie: J\'apporte le gâteau !',
      timestamp: '11:20',
      isRead: false,
      senderId: 'user3',
    },
    unreadCount: 5,
    isPinned: true,
    type: 'group',
  },
  {
    id: '4',
    participant: {
      id: 'user4',
      name: 'Sophie Laurent',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
      isOnline: true,
    },
    lastMessage: {
      text: 'As-tu vu les photos de hier ?',
      timestamp: '10:15',
      isRead: true,
      senderId: 'user4',
    },
    unreadCount: 0,
    isPinned: false,
    type: 'direct',
  },
  {
    id: '5',
    participant: {
      id: 'user5',
      name: 'Thomas Petit',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      isOnline: false,
      lastSeen: '1j',
    },
    lastMessage: {
      text: 'Photo',
      timestamp: 'Hier',
      isRead: false,
      senderId: 'user5',
      type: 'image',
    },
    unreadCount: 1,
    isPinned: false,
    type: 'direct',
  },
  {
    id: '6',
    participant: {
      id: 'group2',
      name: 'Barbecue Weekend 🔥',
      avatar: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=80&h=80&fit=crop',
      isGroup: true,
      memberCount: 12,
    },
    lastMessage: {
      text: 'Alex: Qui amène les boissons ?',
      timestamp: 'Hier',
      isRead: true,
      senderId: 'me',
    },
    unreadCount: 0,
    isPinned: false,
    type: 'group',
  },
];

// Actions rapides
const quickActions = [
  {
    id: 'new-message',
    title: 'Nouveau message',
    icon: 'chatbubble-outline',
    color: '#667eea',
  },
  {
    id: 'new-group',
    title: 'Nouveau groupe',
    icon: 'people-outline',
    color: '#48bb78',
  },
  {
    id: 'broadcast',
    title: 'Diffusion',
    icon: 'megaphone-outline',
    color: '#ed8936',
  },
];

const InboxScreen = () => {
  const [conversations, setConversations] = useState(conversationsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all'); // all, unread, groups
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      selectedTab === 'all' || 
      (selectedTab === 'unread' && conv.unreadCount > 0) ||
      (selectedTab === 'groups' && conv.type === 'group');
    
    return matchesSearch && matchesTab;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    // Conversations épinglées en premier
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Puis par timestamp (plus récent en premier)
    return new Date(`2024-01-01 ${b.lastMessage.timestamp}`) - new Date(`2024-01-01 ${a.lastMessage.timestamp}`);
  });

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simuler le rechargement des données
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleConversationPress = (conversation) => {
    if (isSelectionMode) {
      toggleConversationSelection(conversation.id);
    } else {
      // Marquer comme lu
      if (conversation.unreadCount > 0) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversation.id 
              ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
              : conv
          )
        );
      }
      // Naviguer vers la conversation
      router.push(`/screens/messages/chat?conversationId=${conversation.id}`);
    }
  };

  const handleConversationLongPress = (conversationId) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedConversations(new Set([conversationId]));
    }
  };

  const toggleConversationSelection = (conversationId) => {
    const newSelection = new Set(selectedConversations);
    if (newSelection.has(conversationId)) {
      newSelection.delete(conversationId);
    } else {
      newSelection.add(conversationId);
    }
    setSelectedConversations(newSelection);
    
    if (newSelection.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const handleBulkAction = (action) => {
    const selectedIds = Array.from(selectedConversations);
    
    switch (action) {
      case 'delete':
        Alert.alert(
          'Supprimer les conversations',
          `Êtes-vous sûr de vouloir supprimer ${selectedIds.length} conversation(s) ?`,
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Supprimer', 
              style: 'destructive',
              onPress: () => {
                setConversations(prev => prev.filter(conv => !selectedIds.includes(conv.id)));
                setIsSelectionMode(false);
                setSelectedConversations(new Set());
              }
            }
          ]
        );
        break;
      case 'pin':
        setConversations(prev => 
          prev.map(conv => 
            selectedIds.includes(conv.id) 
              ? { ...conv, isPinned: !conv.isPinned }
              : conv
          )
        );
        setIsSelectionMode(false);
        setSelectedConversations(new Set());
        break;
      case 'markRead':
        setConversations(prev => 
          prev.map(conv => 
            selectedIds.includes(conv.id) 
              ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
              : conv
          )
        );
        setIsSelectionMode(false);
        setSelectedConversations(new Set());
        break;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
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

      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionCount}>{selectedConversations.size} sélectionné(s)</Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={() => handleBulkAction('pin')}
            >
              <Ionicons name="pin" size={20} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={() => handleBulkAction('markRead')}
            >
              <Ionicons name="checkmark-done" size={20} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={() => handleBulkAction('delete')}
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={() => {
                setIsSelectionMode(false);
                setSelectedConversations(new Set());
              }}
            >
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
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

  const renderConversationItem = ({ item }) => {
    const isSelected = selectedConversations.has(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          isSelected && styles.selectedConversationItem,
          item.unreadCount > 0 && styles.unreadConversationItem
        ]}
        onPress={() => handleConversationPress(item)}
        onLongPress={() => handleConversationLongPress(item.id)}
        activeOpacity={0.7}
      >
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            <Ionicons 
              name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={isSelected ? "#667eea" : "#94a3b8"} 
            />
          </View>
        )}

        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.participant.avatar }} style={styles.avatar} />
          
          {item.isPinned && (
            <View style={styles.pinnedIndicator}>
              <Ionicons name="pin" size={12} color="#667eea" />
            </View>
          )}
          
          {item.type === 'direct' && (
            <>
              {item.participant.isOnline && (
                <View style={styles.onlineIndicator} />
              )}
            </>
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
                item.unreadCount > 0 && styles.unreadLastMessage
              ]} 
              numberOfLines={1}
            >
              {item.lastMessage.type === 'image' ? '📷 ' : ''}
              {item.lastMessage.text}
            </Text>
            
            <View style={styles.messageStatus}>
              {item.lastMessage.senderId === 'me' && (
                <Ionicons 
                  name={item.lastMessage.isRead ? "checkmark-done" : "checkmark"} 
                  size={14} 
                  color={item.lastMessage.isRead ? "#667eea" : "#94a3b8"} 
                />
              )}
            </View>
          </View>
          
          {item.type === 'group' && (
            <Text style={styles.groupInfo}>
              {item.participant.memberCount} membres
            </Text>
          )}
          
          {item.type === 'direct' && !item.participant.isOnline && item.participant.lastSeen && (
            <Text style={styles.lastSeen}>
              Vu il y a {item.participant.lastSeen}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={80} color="#cbd5e1" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'Aucun résultat' : 'Aucune conversation'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? `Aucune conversation trouvée pour "${searchQuery}"`
          : 'Commencez une nouvelle conversation avec vos amis'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity 
          style={styles.emptyStateButton}
          onPress={() => router.push('/screens/messages/newchat')}
        >
          <Text style={styles.emptyStateButtonText}>Nouveau message</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {!isSelectionMode && renderTabs()}
      {!isSelectionMode && renderQuickActions()}
      
      <FlatList
        data={sortedConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={[
          styles.conversationsList,
          sortedConversations.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {!isSelectionMode && (
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
      )}
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
    paddingVertical: 30,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1e293b',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionAction: {
    marginLeft: 20,
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  quickActionItem: {
    alignItems: 'center',
    marginLeft: 20,
    width: 70,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },
  conversationsList: {
    paddingVertical: 5,
  },
  emptyListContainer: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedConversationItem: {
    backgroundColor: '#f0f4ff',
  },
  unreadConversationItem: {
    backgroundColor: '#fefefe',
  },
  selectionIndicator: {
    marginRight: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  pinnedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  groupIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#667eea',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
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
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCount: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
    marginRight: 10,
  },
  unreadLastMessage: {
    fontWeight: '600',
    color: '#1e293b',
  },
  messageStatus: {
    marginLeft: 5,
  },
  groupInfo: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  lastSeen: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
 emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  emptyStateButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InboxScreen;