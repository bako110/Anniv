import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CommentService from '../../../../services/events/comment';
import { API_BASE_URL } from '../../../../constants/config';

const CommentsOverlay = ({ eventId, onClose, onNewComment }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: SCREEN_HEIGHT * 0.7,
      duration: 350,
      useNativeDriver: false,
    }).start();
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await CommentService.getComments(eventId);
      if (response.success) {
        console.log('Comments loaded:', response.data);
        setComments(response.data);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les commentaires');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau ou serveur');
    } finally {
      setLoading(false);
    }
  };

  const sendComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Erreur', 'Le commentaire ne peut pas être vide');
      return;
    }
    try {
      const response = await CommentService.postComment(eventId, {
        content: commentText.trim(),
      });
      if (response.success) {
        setCommentText('');
        await loadComments();
        if (onNewComment) {
          onNewComment(eventId);  // Informe le parent qu'un nouveau commentaire a été ajouté
        }
      } else {
        Alert.alert('Erreur', "Impossible d'envoyer le commentaire");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau ou serveur');
    }
  };

  // ... le reste de ton code inchangé ...

  const deleteComment = async (commentId) => {
    try {
      const response = await CommentService.deleteComment(commentId);
      if (response.success) {
        loadComments();
      } else {
        Alert.alert('Erreur', "Impossible de supprimer le commentaire");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau ou serveur');
    }
  };

  const startEditingComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditCommentText(content);
  };

  const saveEditedComment = async (commentId) => {
    try {
      const response = await CommentService.editComment(commentId, {
        content: editCommentText.trim(),
      });
      if (response.success) {
        setEditingCommentId(null);
        loadComments();
      } else {
        Alert.alert('Erreur', "Impossible de modifier le commentaire");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau ou serveur');
    }
  };

  const closeOverlay = () => {
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      onClose();
    });
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.avatarWrapper}>
          {item.avatar_url ? (
            <Image
              source={{ uri: `${API_BASE_URL}${item.avatar_url}` }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-circle" size={32} color="#cbd5e1" />
            </View>
          )}
        </View>
        <View style={styles.commentMeta}>
          <Text style={styles.commentAuthor}>{item.full_name || 'Anonyme'}</Text>
          <Text style={styles.commentDate}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </View>

      {editingCommentId === item.id ? (
        <TextInput
          style={styles.commentInput}
          value={editCommentText}
          onChangeText={setEditCommentText}
          multiline
        />
      ) : (
        <Text style={styles.commentContent}>{item.content}</Text>
      )}

      <View style={styles.commentActions}>
        {editingCommentId === item.id ? (
          <TouchableOpacity onPress={() => saveEditedComment(item.id)}>
            <Ionicons name="checkmark" size={20} color="#3b82f6" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => startEditingComment(item.id, item.content)}>
            <Ionicons name="create" size={20} color="#3b82f6" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => deleteComment(item.id)}>
          <Ionicons name="trash" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.commentsOverlay, { height: animatedHeight }]}>
      <View style={{ flex: 1 }}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Commentaires</Text>
          <TouchableOpacity onPress={closeOverlay}>
            <Ionicons name="close" size={28} color="#64748b" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="sync" size={40} color="#3b82f6" />
            <Text>Chargement...</Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderComment}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Écrire un commentaire..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={300}
          />
          <TouchableOpacity onPress={sendComment} style={styles.commentSendButton}>
            <Ionicons name="send" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};


const styles = {
  commentsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f2f5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#050505',
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  commentItem: {
    paddingVertical: 16,
    borderRadius: 8,
    marginVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderColor: '#e4e6eb',
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrapper: {
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: '#050505',
    fontSize: 16,
  },
  commentDate: {
    fontSize: 12,
    color: '#65676B',
  },
  commentContent: {
    color: '#050505',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f2f5',
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 120,
    backgroundColor: '#ffffff',
    fontSize: 15,
    color: '#050505',
    textAlignVertical: 'center',
  },
  commentSendButton: {
    marginLeft: 12,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#1877f2',
  },
};

export default CommentsOverlay;
