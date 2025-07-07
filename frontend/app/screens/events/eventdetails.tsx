import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Image, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EventService from '../../../services/events/event';
import CommentsOverlay from './comment/CommentInput';

const styles = {
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  description: { fontSize: 16, color: '#475569', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  commentContainer: { marginBottom: 16, padding: 8, backgroundColor: '#f1f5f9', borderRadius: 8 },
  commentHeader: { flexDirection: 'row', gap: 8 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20 },
  commentAuthor: { fontWeight: 'bold' },
  commentContent: { color: '#475569' },
  repliesContainer: { marginTop: 8, paddingLeft: 20, borderLeftWidth: 2, borderLeftColor: '#e2e8f0' },
  replyItem: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  replyAvatar: { width: 32, height: 32, borderRadius: 16 },
  replyAuthor: { fontWeight: '600' },
  replyContent: { color: '#64748b' },
  addCommentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    padding: 10,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'flex-start'
  },
  addCommentText: { color: '#fff', marginLeft: 6 }
};

const EventDetailsScreen = () => {
  const { eventId } = useLocalSearchParams();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentInput, setShowCommentInput] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchComments();
  }, []);

  const fetchEventDetails = async () => {
    try {
      const response = await EventService.getEventDetails(eventId);
      if (response.success) {
        setEvent(response.data);
      } else {
        Alert.alert('Erreur', 'Impossible de charger l\'événement');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await EventService.getEventComments(eventId);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = () => {
    setShowCommentInput(false);
    fetchComments();
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/40' }} style={styles.commentAvatar} />
        <View>
          <Text style={styles.commentAuthor}>{item.full_name}</Text>
          <Text style={styles.commentContent}>{item.content}</Text>
        </View>
      </View>
      {item.replies?.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map(reply => (
            <View key={reply.id} style={styles.replyItem}>
              <Image source={{ uri: reply.avatar_url || 'https://via.placeholder.com/32' }} style={styles.replyAvatar} />
              <View>
                <Text style={styles.replyAuthor}>{reply.full_name}</Text>
                <Text style={styles.replyContent}>{reply.content}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading || !event) return <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 50 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Image source={{ uri: event.image }} style={styles.image} />
      <Text style={styles.description}>{event.description}</Text>
      <Text style={styles.sectionTitle}>Commentaires</Text>
      <TouchableOpacity onPress={() => setShowCommentInput(true)} style={styles.addCommentBtn}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
        <Text style={styles.addCommentText}>Ajouter un commentaire</Text>
      </TouchableOpacity>
      {comments.length === 0 ? (
        <Text style={{ marginTop: 10, color: '#94a3b8' }}>Aucun commentaire pour l’instant.</Text>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      {showCommentInput && (
        <CommentsOverlay eventId={eventId} onClose={() => setShowCommentInput(false)} onCommentAdded={handleCommentAdded} />
      )}
    </ScrollView>
  );
};

export default EventDetailsScreen;
