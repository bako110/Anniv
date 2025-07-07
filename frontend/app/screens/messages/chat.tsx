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
  Animated,
  Modal,
  ActionSheetIOS,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from '@/services/chat';

const { width, height } = Dimensions.get('window');

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'userToken',
  USER_INFO: 'userInfo',
  LOGIN_METHOD: 'loginMethod',
  USER_PROFILE: 'userProfile',
  USER_IDENTIFIER: 'userIdentifier',
  USER_EMAIL: 'userEmail',
  USER_PHONE: 'userPhone',
  PENDING_EVENTS: '@pending_events',
  CACHED_EVENTS: '@cached_events',
  USER_ID: 'userId',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

const ChatScreen = () => {
  const { conversationId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [participant, setParticipant] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const recordingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserDataAndConnect = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);

        if (token && userId) {
          // Connexion au service WebSocket
          chatService.connect(token, userId);

          // Charger les messages et les informations du participant
          const loadConversation = async () => {
            try {
              const loadedMessages = await chatService.fetchMessages(conversationId, token);
              const loadedParticipant = await chatService.fetchUser(userId, token);

              setMessages(loadedMessages);
              setParticipant(loadedParticipant);
            } catch (error) {
              console.error("Erreur lors du chargement de la conversation:", error);
            }
          };

          loadConversation();

          // Écouter les nouveaux messages
          chatService.onMessage((message) => {
            setMessages(prev => [...prev, message]);
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
      }
    };

    fetchUserDataAndConnect();

    return () => {
      // Déconnexion du service WebSocket
      chatService.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      return () => {
        clearInterval(interval);
        recordingAnimation.stopAnimation();
      };
    }
  }, [isRecording]);

  const sendMessage = async () => {
    if (inputText.trim()) {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const newMessage = {
        id: `m${Date.now()}`,
        text: inputText.trim(),
        senderId: 'me',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        type: 'text',
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      // Envoyer le message via le service
      chatService.sendMessage(conversationId, inputText.trim());

      // Défiler vers le bas
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCall = (type) => {
    Alert.alert(
      type === 'voice' ? 'Appel vocal' : 'Appel vidéo',
      `Appeler ${participant?.name || 'le contact'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appeler',
          onPress: () => {
            // Logique d'appel à implémenter
          }
        }
      ]
    );
  };

  const handleAttachment = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', 'Photo', 'Caméra', 'Document', 'Localisation'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex !== 0) {
            handleAttachmentType(['', 'photo', 'camera', 'document', 'location'][buttonIndex]);
          }
        }
      );
    } else {
      setShowAttachmentModal(true);
    }
  };

  const handleAttachmentType = (type) => {
    setShowAttachmentModal(false);

    switch (type) {
      case 'photo':
        // Logique pour sélectionner une photo
        break;
      case 'camera':
        // Logique pour prendre une photo
        break;
      case 'document':
        // Logique pour sélectionner un document
        break;
      case 'location':
        sendLocationMessage();
        break;
    }
  };

  const sendLocationMessage = () => {
    const locationMessage = {
      id: `m${Date.now()}`,
      text: '📍 Ma position actuelle',
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'location',
      location: {
        latitude: 0,
        longitude: 0,
        address: 'Position actuelle'
      }
    };

    setMessages(prev => [...prev, locationMessage]);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);

    const voiceMessage = {
      id: `m${Date.now()}`,
      text: '🎵 Message vocal',
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'voice',
      duration: recordingTime,
    };

    setMessages(prev => [...prev, voiceMessage]);
  };

  const handleMessageLongPress = (messageId) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedMessages(new Set([messageId]));
    }
  };

  const toggleMessageSelection = (messageId) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);

    if (newSelection.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.participantInfo}
          onPress={() => participant && router.push(`/screens/messages/profile?userId=${participant.id}`)}
        >
          {participant?.avatar && (
            <Image source={{ uri: participant.avatar }} style={styles.headerAvatar} />
          )}
          <View style={styles.participantDetails}>
            <Text style={styles.participantName}>{participant?.name || 'Chargement...'}</Text>
            <Text style={styles.participantStatus}>
              {isTyping ? 'En train d\'écrire...' :
               participant?.isOnline ? 'En ligne' :
               participant?.lastSeen ? `Vu il y a ${participant.lastSeen}` : ''}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => handleCall('voice')}
          >
            <Ionicons name="call" size={22} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => handleCall('video')}
          >
            <Ionicons name="videocam" size={22} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => router.push(`/screens/messages/chat-settings?conversationId=${conversationId}`)}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>

      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionCount}>{selectedMessages.size} message(s) sélectionné(s)</Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity style={styles.selectionAction}>
              <Ionicons name="arrow-redo" size={20} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectionAction}>
              <Ionicons name="copy" size={20} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectionAction}>
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectionAction}
              onPress={() => {
                setIsSelectionMode(false);
                setSelectedMessages(new Set());
              }}
            >
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === 'me';
    const isSelected = selectedMessages.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.theirMessageContainer,
          isSelected && styles.selectedMessageContainer
        ]}
        onPress={() => isSelectionMode && toggleMessageSelection(item.id)}
        onLongPress={() => handleMessageLongPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.messageWrapper, isMe && styles.myMessageWrapper]}>
          {!isMe && participant?.avatar && (
            <Image source={{ uri: participant.avatar }} style={styles.messageAvatar} />
          )}

          <View style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.theirMessageBubble,
            isSelected && styles.selectedMessageBubble
          ]}>
            {item.type === 'text' && (
              <Text style={[
                styles.messageText,
                isMe ? styles.myMessageText : styles.theirMessageText
              ]}>
                {item.text}
              </Text>
            )}

            {item.type === 'voice' && (
              <View style={styles.voiceMessage}>
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={16} color={isMe ? "white" : "#667eea"} />
                </TouchableOpacity>
                <View style={styles.voiceWaveform}>
                  {[...Array(8)].map((_, i) => (
                    <View key={i} style={styles.waveformBar} />
                  ))}
                </View>
                <Text style={[
                  styles.voiceDuration,
                  isMe ? styles.myMessageText : styles.theirMessageText
                ]}>
                  {formatTime(item.duration)}
                </Text>
              </View>
            )}

            {item.type === 'location' && (
              <View style={styles.locationMessage}>
                <Ionicons name="location" size={20} color={isMe ? "white" : "#667eea"} />
                <Text style={[
                  styles.locationText,
                  isMe ? styles.myMessageText : styles.theirMessageText
                ]}>
                  {item.location.address}
                </Text>
              </View>
            )}

            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isMe ? styles.myMessageTime : styles.theirMessageTime
              ]}>
                {item.timestamp}
              </Text>
              {isMe && (
                <Ionicons
                  name={item.isRead ? "checkmark-done" : "checkmark"}
                  size={14}
                  color={item.isRead ? "#22c55e" : "rgba(255,255,255,0.7)"}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping || !participant) return null;

    return (
      <View style={styles.typingContainer}>
        <Image source={{ uri: participant.avatar }} style={styles.messageAvatar} />
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.typingDot,
                  {
                    opacity: recordingAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderInput = () => {
    if (isRecording) {
      return (
        <View style={styles.recordingContainer}>
          <TouchableOpacity
            style={styles.cancelRecording}
            onPress={() => {
              setIsRecording(false);
              setRecordingTime(0);
            }}
          >
            <Ionicons name="close" size={24} color="#ef4444" />
          </TouchableOpacity>

          <View style={styles.recordingInfo}>
            <Animated.View style={[
              styles.recordingDot,
              {
                opacity: recordingAnimation,
              }
            ]} />
            <Text style={styles.recordingText}>Enregistrement...</Text>
            <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
          </View>

          <TouchableOpacity
            style={styles.sendRecording}
            onPress={stopRecording}
          >
            <Ionicons name="send" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={handleAttachment}
        >
          <Ionicons name="add" size={24} color="#667eea" />
        </TouchableOpacity>

        <View style={styles.textInputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Tapez votre message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => {
              setInputText(prev => prev + '😊');
            }}
          >
            <Ionicons name="happy-outline" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>

        {inputText.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.voiceButton}
            onPressIn={startRecording}
          >
            <Ionicons name="mic" size={24} color="#667eea" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAttachmentModal = () => (
    <Modal
      visible={showAttachmentModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAttachmentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.attachmentModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Joindre un fichier</Text>
            <TouchableOpacity onPress={() => setShowAttachmentModal(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.attachmentOptions}>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachmentType('photo')}
            >
              <View style={[styles.attachmentIcon, { backgroundColor: '#8b5cf6' }]}>
                <Ionicons name="image" size={24} color="white" />
              </View>
              <Text style={styles.attachmentOptionText}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachmentType('camera')}
            >
              <View style={[styles.attachmentIcon, { backgroundColor: '#06b6d4' }]}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
              <Text style={styles.attachmentOptionText}>Caméra</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachmentType('document')}
            >
              <View style={[styles.attachmentIcon, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="document" size={24} color="white" />
              </View>
              <Text style={styles.attachmentOptionText}>Document</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachmentType('location')}
            >
              <View style={[styles.attachmentIcon, { backgroundColor: '#10b981' }]}>
                <Ionicons name="location" size={24} color="white" />
              </View>
              <Text style={styles.attachmentOptionText}>Position</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {renderTypingIndicator()}
        {renderInput()}
      </KeyboardAvoidingView>

      {renderAttachmentModal()}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 10,
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  participantStatus: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    marginLeft: 15,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionAction: {
    marginLeft: 15,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 2,
  },
  selectedMessageContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 8,
    marginHorizontal: -5,
    paddingHorizontal: 5,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarSpacer: {
    width: 40,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 2,
  },
  myMessageBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 8,
  },
  theirMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedMessageBubble: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  theirMessageText: {
    color: '#1e293b',
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  voiceWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  waveformBar: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginRight: 2,
    borderRadius: 1,
  },
  voiceDuration: {
    fontSize: 12,
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  messageTime: {
    fontSize: 11,
    marginRight: 5,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirMessageTime: {
    color: '#94a3b8',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  typingBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94a3b8',
    marginRight: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    maxHeight: 80,
  },
  emojiButton: {
    marginLeft: 10,
    paddingVertical: 5,
  },
  sendButton: {
    marginLeft: 10,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelRecording: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 10,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginRight: 10,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  sendRecording: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  attachmentModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  attachmentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  attachmentOption: {
    alignItems: 'center',
  },
  attachmentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  attachmentOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
});

export default ChatScreen;