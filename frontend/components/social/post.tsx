// src/components/social/Post.tsx
import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface User {
  avatar: ImageSourcePropType;
  name: string;
  verified?: boolean;
  isBirthday?: boolean;
  age?: number;
}

interface PostType {
  user: User;
  timeAgo: string;
  content: string;
  image?: ImageSourcePropType;
  likes: number;
  comments: number;
  shares: number;
  type?: 'birthday' | 'celebration' | 'normal';
}

interface PostProps {
  post: PostType;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSendGift?: () => void;
}

const Post: React.FC<PostProps> = ({ post, onLike, onComment, onShare, onSendGift }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike?.();
  };

  const getBirthdayMessage = () => {
    if (post.user.isBirthday) {
      return `🎉 C'est l'anniversaire de ${post.user.name} ! ${post.user.age ? `${post.user.age} ans` : ''} 🎂`;
    }
    return null;
  };

  const getPostTypeStyle = () => {
    switch (post.type) {
      case 'birthday':
        return styles.birthdayPost;
      case 'celebration':
        return styles.celebrationPost;
      default:
        return {};
    }
  };

  const getPostTypeIcon = () => {
    switch (post.type) {
      case 'birthday':
        return '🎂';
      case 'celebration':
        return '🎉';
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, getPostTypeStyle()]}>
      {/* Bannière d'anniversaire */}
      {post.user.isBirthday && (
        <View style={styles.birthdayBanner}>
          <Text style={styles.birthdayBannerText}>{getBirthdayMessage()}</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image source={post.user.avatar} style={styles.avatar} />
            {post.user.isBirthday && (
              <View style={styles.birthdayBadge}>
                <Text style={styles.birthdayBadgeText}>🎂</Text>
              </View>
            )}
          </View>
          <View style={styles.userText}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>
                {post.user.name}
                {post.user.verified && (
                  <MaterialIcons name="verified" size={16} color="#6B46C1" style={styles.verified} />
                )}
              </Text>
              {getPostTypeIcon() && (
                <Text style={styles.postTypeIcon}>{getPostTypeIcon()}</Text>
              )}
            </View>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.image && (
        <View style={styles.imageContainer}>
          <Image source={post.image} style={styles.postImage} resizeMode="cover" />
          {post.type === 'birthday' && (
            <View style={styles.imageOverlay}>
              <Text style={styles.overlayText}>🎉</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.stats}>
        <View style={styles.statsLeft}>
          <View style={styles.likesContainer}>
            <AntDesign name="heart" size={12} color="#E879F9" />
            <Text style={styles.statText}>{likes.toLocaleString()}</Text>
          </View>
          <Text style={styles.statText}>{post.comments.toLocaleString()} commentaires</Text>
          <Text style={styles.statText}>{post.shares.toLocaleString()} partages</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <AntDesign 
            name={isLiked ? "heart" : "hearto"} 
            size={20} 
            color={isLiked ? "#E879F9" : "#6B7280"} 
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {isLiked ? "Aimé" : "Aimer"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => onComment?.()}>
          <Feather name="message-circle" size={20} color="#6B7280" />
          <Text style={styles.actionText}>Commenter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => onShare?.()}>
          <Feather name="share-2" size={20} color="#6B7280" />
          <Text style={styles.actionText}>Partager</Text>
        </TouchableOpacity>

        {/* Bouton cadeau spécial pour les anniversaires */}
        {post.user.isBirthday && (
          <TouchableOpacity style={styles.giftButton} onPress={() => onSendGift?.()}>
            <MaterialIcons name="card-giftcard" size={20} color="white" />
            <Text style={styles.giftButtonText}>Cadeau</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  birthdayPost: {
    borderWidth: 2,
    borderColor: '#E879F9',
    backgroundColor: '#FEF7FF',
  },
  celebrationPost: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  birthdayBanner: {
    backgroundColor: 'linear-gradient(90deg, #E879F9, #C084FC)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  birthdayBannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  birthdayBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  birthdayBadgeText: {
    fontSize: 10,
  },
  userText: {
    flex: 1,
    justifyContent: 'center',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1F2937',
  },
  verified: {
    marginLeft: 4,
  },
  postTypeIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  timeAgo: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
  },
  imageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    color: '#6B7280',
    fontSize: 13,
    marginLeft: 4,
    marginRight: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  actionText: {
    marginLeft: 6,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  likedText: {
    color: '#E879F9',
  },
  giftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
  },
  giftButtonText: {
    marginLeft: 6,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Post;