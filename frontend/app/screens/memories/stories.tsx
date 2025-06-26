import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Animated,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  PanGestureHandler,
  State,
  Vibration,
  Alert,
  Modal,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Données enrichies avec plus d'informations
const storiesData = [
  {
    id: '1',
    username: 'Marie Dubois',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    isVerified: true,
    location: 'Paris, France',
    bio: 'Photographe passionnée 📸 | Voyageuse | Paris ✨',
    followers: 12500,
    following: 890,
    posts: 342,
    stories: [
      {
        id: '1-1',
        image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop',
        type: 'image',
        duration: 5,
        isSeen: false,
        text: 'Magnifique coucher de soleil à Paris 🌅',
        timestamp: '2h',
        likes: 34,
        likedBy: [],
        music: 'Sunset Vibes - Chill Mix',
        viewers: 156
      },
      {
        id: '1-2',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop',
        type: 'image',
        duration: 7,
        isSeen: false,
        text: 'Coffee time ☕️',
        timestamp: '1h',
        likes: 56,
        likedBy: [],
        viewers: 203
      }
    ],
    isSeen: false,
    isCloseFriend: true,
    isLive: false,
    phone: '+33 6 12 34 56 78',
    email: 'marie.dubois@example.com',
  },
  {
    id: '2',
    username: 'Pierre Martin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    isVerified: false,
    location: 'Lyon, France',
    bio: 'Aventurier 🏔️ | Guide de montagne | Lyon',
    followers: 8900,
    following: 1200,
    posts: 234,
    stories: [
      {
        id: '2-1',
        image: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=800&h=1000&fit=crop',
        type: 'image',
        duration: 4,
        isSeen: false,
        text: 'Aventure en montagne 🏔️',
        timestamp: '3h',
        likes: 89,
        likedBy: [],
        viewers: 298
      }
    ],
    isSeen: false,
    isCloseFriend: false,
    isLive: true,
    phone: '+33 6 98 76 54 32',
    email: 'pierre.martin@example.com',
  },
  {
    id: '3',
    username: 'Sophie Laurent',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    isVerified: true,
    location: 'Nice, France',
    bio: 'Chef cuisinière 👩‍🍳 | Foodie | Nice 🌊',
    followers: 25000,
    following: 567,
    posts: 678,
    stories: [
      {
        id: '3-1',
        image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=1000&fit=crop',
        type: 'image',
        duration: 6,
        isSeen: false,
        text: 'Plage paradisiaque 🏖️',
        timestamp: '4h',
        likes: 123,
        likedBy: [],
        viewers: 445
      },
      {
        id: '3-2',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop',
        type: 'image',
        duration: 5,
        isSeen: false,
        text: 'Dîner romantique 🕯️',
        timestamp: '2h',
        likes: 78,
        likedBy: [],
        viewers: 321
      }
    ],
    isSeen: false,
    isCloseFriend: true,
    isLive: false,
    phone: '+33 6 11 22 33 44',
    email: 'sophie.laurent@example.com',
  },
];

const StoriesScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [storiesDataState, setStoriesDataState] = useState(storiesData);
  
  const progress = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const reactionAnim = useRef(new Animated.Value(0)).current;

  const currentUser = storiesDataState[currentIndex];
  const currentStory = currentUser.stories[storyIndex];

  useEffect(() => {
    // Vérifier si l'utilisateur actuel a déjà liké cette story
    const hasLiked = currentStory.likedBy.includes('currentUserId');
    setLiked(hasLiked);
    
    startProgressAnimation(currentStory.duration);
    return () => {
      progress.stopAnimation();
    };
  }, [currentIndex, storyIndex]);

  // Animation de progression améliorée
  const startProgressAnimation = (duration) => {
    if (isPaused) return;
    
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        nextStory();
      }
    });
  };

  // Passer à la story suivante avec animation
  const nextStory = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    if (storyIndex < currentUser.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else {
      nextUser();
    }
  };

  // Passer à l'utilisateur suivant
  const nextUser = () => {
    if (currentIndex < storiesDataState.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStoryIndex(0);
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.goBack();
    }
  };

  // Passer à l'utilisateur précédent
  const prevUser = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setStoryIndex(0);
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    } else if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    }
  };

  // Gestion des gestes tactiles
  const handleLongPress = () => {
    setIsPaused(true);
    progress.stopAnimation();
    Vibration.vibrate(50);
    
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPaused(false);
    startProgressAnimation(currentStory.duration);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Fonction pour liker/unliker une story
  const handleLike = () => {
    setLiked(!liked);
    Vibration.vibrate(100);
    
    // Mettre à jour les données de la story
    const updatedStoriesData = [...storiesDataState];
    const storyToUpdate = updatedStoriesData[currentIndex].stories[storyIndex];
    
    if (liked) {
      // Retirer le like
      storyToUpdate.likes = Math.max(0, storyToUpdate.likes - 1);
      storyToUpdate.likedBy = storyToUpdate.likedBy.filter(id => id !== 'currentUserId');
    } else {
      // Ajouter le like
      storyToUpdate.likes += 1;
      storyToUpdate.likedBy.push('currentUserId');
    }
    
    setStoriesDataState(updatedStoriesData);
    
    // Animation du like
    Animated.sequence([
      Animated.timing(reactionAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(reactionAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Gestion des réactions
  const handleReaction = (emoji) => {
    handleLike();
    Alert.alert('Réaction envoyée', `Vous avez réagi avec ${emoji} à la story de ${currentUser.username}`);
    setShowReactions(false);
  };

  // Envoi de message
  const handleSendMessage = () => {
    if (message.trim()) {
      Alert.alert(
        'Message envoyé',
        `Votre message "${message}" a été envoyé à ${currentUser.username}`,
        [
          {
            text: 'OK',
            onPress: () => setMessage('')
          }
        ]
      );
    }
  };

  // Afficher le profil utilisateur
  const handleShowProfile = () => {
    setShowProfileModal(true);
  };

  // Gestion du menu (trois points)
  const handleMenuPress = () => {
    setShowMenuModal(true);
  };

  // Partager la story
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Regarde cette story de ${currentUser.username}: ${currentStory.text}`,
        url: currentStory.image,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager cette story');
    }
    setShowMenuModal(false);
  };

  // Signaler la story
  const handleReport = () => {
    Alert.alert(
      'Signaler',
      'Cette story a été signalée. Merci de nous aider à maintenir un environnement sûr.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => setShowMenuModal(false) }
      ]
    );
  };

  // Masquer la story
  const handleMute = () => {
    Alert.alert(
      'Masquer les stories',
      `Vous ne verrez plus les stories de ${currentUser.username}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => setShowMenuModal(false) }
      ]
    );
  };

  // Copier le lien
  const handleCopyLink = () => {
    Alert.alert('Lien copié', 'Le lien de cette story a été copié dans le presse-papiers');
    setShowMenuModal(false);
  };

  // Appeler l'utilisateur
  const handleCall = () => {
    Alert.alert(
      'Appeler',
      `Voulez-vous appeler ${currentUser.username} au ${currentUser.phone} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => setShowProfileModal(false) }
      ]
    );
  };

  // Envoyer un email
  const handleEmail = () => {
    Alert.alert(
      'Envoyer un email',
      `Ouvrir l'application mail pour contacter ${currentUser.email} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ouvrir', onPress: () => setShowProfileModal(false) }
      ]
    );
  };

  // Suivre/Ne plus suivre
  const handleFollow = () => {
    Alert.alert(
      'Suivre',
      `Vous suivez maintenant ${currentUser.username}`,
      [{ text: 'OK', onPress: () => setShowProfileModal(false) }]
    );
  };

  // Barres de progression améliorées
  const renderProgressBars = () => {
    return (
      <View style={styles.progressBarsContainer}>
        {currentUser.stories.map((story, index) => {
          const isActive = index === storyIndex;
          const isCompleted = index < storyIndex;

          return (
            <View key={`progress-${index}`} style={styles.progressBarBackground}>
              {isActive ? (
                <Animated.View
                  style={[
                    styles.progressBarActive,
                    {
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              ) : isCompleted ? (
                <View style={[styles.progressBarActive, { width: '100%' }]} />
              ) : (
                <View style={[styles.progressBarActive, { width: '0%' }]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // En-tête amélioré avec plus d'informations
  const renderHeader = () => {
    return (
      <BlurView intensity={20} style={styles.headerBlur}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.userInfo} onPress={handleShowProfile}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: currentUser.avatar }} style={styles.userAvatar} />
              {currentUser.isLive && (
                <View style={styles.liveIndicator}>
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>
            
            <View style={styles.userDetails}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{currentUser.username}</Text>
                {currentUser.isVerified && (
                  <MaterialIcons name="verified" size={16} color="#4A90E2" />
                )}
              </View>
              <Text style={styles.location}>{currentUser.location}</Text>
              <Text style={styles.time}>{currentStory.timestamp}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setMuted(!muted)}>
              <Ionicons 
                name={muted ? "volume-mute" : "volume-high"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleMenuPress}>
              <Ionicons name="ellipsis-vertical" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    );
  };

  // Contrôles de navigation améliorés
  const renderNavigationControls = () => {
    return (
      <View style={styles.navigationControls}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={prevUser}
          onLongPress={handleLongPress}
          onPressOut={handlePressOut}
          activeOpacity={1}
        />
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={nextUser}
          onLongPress={handleLongPress}
          onPressOut={handlePressOut}
          activeOpacity={1}
        />
      </View>
    );
  };

  // Overlay de réactions
  const renderReactionOverlay = () => {
    if (!showReactions) return null;

    return (
      <Animated.View 
        style={[
          styles.reactionOverlay,
          {
            opacity: reactionAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
            transform: [{ 
              scale: reactionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }]
          }
        ]}
      >
        <View style={styles.reactionContainer}>
          {['❤️', '😂', '😮', '😢', '😡', '👍'].map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reactionButton}
              onPress={() => handleReaction(emoji)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  // Footer amélioré avec plus d'options
  const renderFooter = () => {
    return (
      <BlurView intensity={30} style={styles.footerBlur}>
        <View style={styles.footer}>
          {/* Informations de la story */}
          <View style={styles.storyInfo}>
            {currentStory.music && (
              <View style={styles.musicInfo}>
                <MaterialIcons name="music-note" size={16} color="white" />
                <Text style={styles.musicText}>{currentStory.music}</Text>
              </View>
            )}
            
            <View style={styles.likesInfo}>
              <Ionicons name="heart" size={16} color="#FF3040" />
              <Text style={styles.likesText}>{currentStory.likes} j'aime</Text>
              <Text style={styles.viewersText}> • {currentStory.viewers} vues</Text>
            </View>
          </View>

          {/* Zone d'interaction */}
          <View style={styles.interactionContainer}>
            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={() => setShowReactions(true)}
              onLongPress={handleLike}
            >
              <Ionicons 
                name={liked ? "heart" : "heart-outline"} 
                size={28} 
                color={liked ? "#FF3040" : "white"} 
              />
            </TouchableOpacity>
            
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Répondre à la story..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={message}
                onChangeText={setMessage}
                multiline
                onSubmitEditing={handleSendMessage}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={handleSendMessage}
            >
              <Ionicons name="paper-plane" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactionButton}>
              <Ionicons name="bookmark-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    );
  };

  // Modal du profil utilisateur
  const renderProfileModal = () => {
    return (
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              onPress={() => setShowProfileModal(false)}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Profil</Text>
          </View>
          
          <View style={styles.profileContent}>
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: currentUser.avatar }} style={styles.profileImage} />
              {currentUser.isVerified && (
                <MaterialIcons 
                  name="verified" 
                  size={20} 
                  color="#4A90E2" 
                  style={styles.profileVerified}
                />
              )}
            </View>
            
            <Text style={styles.profileUsername}>{currentUser.username}</Text>
            <Text style={styles.profileLocation}>{currentUser.location}</Text>
            <Text style={styles.profileBio}>{currentUser.bio}</Text>
            
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.posts}</Text>
                <Text style={styles.statLabel}>Publications</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.followers.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Abonnés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.following}</Text>
                <Text style={styles.statLabel}>Abonnements</Text>
              </View>
            </View>
            
            <View style={styles.profileActions}>
              <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
                <Text style={styles.followButtonText}>Suivre</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.messageButton} onPress={() => setShowProfileModal(false)}>
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                <Ionicons name="call" size={20} color="#4A90E2" />
                <Text style={styles.contactButtonText}>Appeler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                <Ionicons name="mail" size={20} color="#4A90E2" />
                <Text style={styles.contactButtonText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  // Modal du menu (trois points)
  const renderMenuModal = () => {
    return (
      <Modal
        visible={showMenuModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.menuHeader}>
            <TouchableOpacity 
              onPress={() => setShowMenuModal(false)}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Options</Text>
          </View>
          
          <View style={styles.menuContent}>
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Partager</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleCopyLink}>
              <Ionicons name="link-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Copier le lien</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleMute}>
              <Ionicons name="eye-off-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Masquer les stories de {currentUser.username}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, styles.dangerItem]} onPress={handleReport}>
              <Ionicons name="flag-outline" size={24} color="#FF3040" />
              <Text style={[styles.menuItemText, styles.dangerText]}>Signaler</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="black" translucent />
        
        {/* Container principal avec animation */}
        <Animated.View 
          style={[
            styles.storyContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <Image 
            source={{ uri: currentStory.image }} 
            style={styles.storyImage}
            resizeMode="cover"
          />
          
          {/* Gradient overlay pour améliorer la lisibilité */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.gradientOverlay}
          />
          
          {/* Texte de la story */}
          {currentStory.text && (
            <View style={styles.textOverlay}>
              <Text style={styles.storyText}>{currentStory.text}</Text>
            </View>
          )}
        </Animated.View>
        
        {/* Barres de progression */}
        {renderProgressBars()}
        
        {/* En-tête */}
        {renderHeader()}
        
        {/* Contrôles de navigation */}
        {renderNavigationControls()}
        
        {/* Overlay de réactions */}
        {renderReactionOverlay()}
        
        {/* Footer */}
        {renderFooter()}
        
        {/* Indicateur de pause */}
        {isPaused && (
          <View style={styles.pauseIndicator}>
            <Ionicons name="pause" size={40} color="white" />
          </View>
        )}
        
        {/* Modals */}
        {renderProfileModal()}
        {renderMenuModal()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  storyContainer: {
    flex: 1,
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  progressBarsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 12,
    paddingBottom: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  headerBlur: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 25 : 45,
    left: 0,
    right: 0,
    zIndex: 10,
    borderRadius: 20,
    marginHorizontal: 12,
        overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  closeButton: {
    padding: 5,
    marginRight: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  liveIndicator: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    backgroundColor: '#FF3040',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 10,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  location: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  time: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  navigationControls: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    zIndex: 5,
  },
  navButton: {
    flex: 1,
    height: '100%',
  },
  reactionOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  reactionContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  reactionButton: {
    paddingHorizontal: 10,
  },
  reactionEmoji: {
    fontSize: 28,
  },
  footerBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  footer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  storyInfo: {
    marginBottom: 15,
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  musicText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  likesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  viewersText: {
    color: 'white',
    opacity: 0.7,
    fontSize: 14,
  },
  interactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionButton: {
    padding: 8,
  },
  messageInputContainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 0,
  },
  messageInput: {
    color: 'white',
    fontSize: 16,
    maxHeight: 100,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 160,
    left: 20,
    right: 20,
  },
  storyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    zIndex: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 24,
  },
  profileContent: {
    padding: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  profileVerified: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  profileUsername: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  profileBio: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  profileActions: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  followButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  messageButtonText: {
    fontWeight: 'bold',
  },
  contactActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  contactButtonText: {
    marginLeft: 5,
    color: '#4A90E2',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuContent: {
    padding: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
  dangerItem: {
    marginTop: 20,
  },
  dangerText: {
    color: '#FF3040',
  },
});

export default StoriesScreen;