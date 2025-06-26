import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Données d'exemple pour les contacts
const contactsData = [
  {
    id: '1',
    name: 'Marie Dubois',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    isOnline: true,
    phone: '+33 6 12 34 56 78',
    lastSeen: 'En ligne',
  },
  {
    id: '2',
    name: 'Pierre Martin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    isOnline: false,
    phone: '+33 6 98 76 54 32',
    lastSeen: 'Il y a 2h',
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    isOnline: true,
    phone: '+33 6 11 22 33 44',
    lastSeen: 'En ligne',
  },
  {
    id: '4',
    name: 'Thomas Petit',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    isOnline: false,
    phone: '+33 6 55 66 77 88',
    lastSeen: 'Il y a 1j',
  },
  {
    id: '5',
    name: 'Emma Rousseau',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
    isOnline: true,
    phone: '+33 6 99 88 77 66',
    lastSeen: 'En ligne',
  },
  {
    id: '6',
    name: 'Lucas Moreau',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    isOnline: false,
    phone: '+33 6 44 33 22 11',
    lastSeen: 'Il y a 5min',
  },
  {
    id: '7',
    name: 'Camille Dubois',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    isOnline: true,
    phone: '+33 6 77 88 99 00',
    lastSeen: 'En ligne',
  },
  {
    id: '8',
    name: 'Antoine Bernard',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
    isOnline: false,
    phone: '+33 6 12 98 76 54',
    lastSeen: 'Il y a 3h',
  },
];

const CreateGroupScreen = () => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('👥');
  const [currentStep, setCurrentStep] = useState(1); // 1: Group Info, 2: Add Members
  const [animatedValue] = useState(new Animated.Value(0));

  const emojis = ['👥', '🎉', '💬', '🔥', '⭐', '🎯', '🏆', '💡', '🎨', '🎵', '⚽', '🍕', '🎮', '📚', '💼', '🌟'];

  const filteredContacts = contactsData.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContactToggle = (contactId) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContacts(newSelection);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour le groupe');
      return;
    }

    if (selectedContacts.size === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un membre');
      return;
    }

    setIsLoading(true);

    // Simulation de la création du groupe
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Groupe créé !',
        `Le groupe "${groupName}" a été créé avec ${selectedContacts.size} membre(s).`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 2000);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep >= 1 && styles.activeStepCircle]}>
          <Text style={[styles.stepNumber, currentStep >= 1 && styles.activeStepNumber]}>1</Text>
        </View>
        <Text style={[styles.stepLabel, currentStep === 1 && styles.activeStepLabel]}>
          Infos du groupe
        </Text>
      </View>
      
      <View style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]} />
      
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep >= 2 && styles.activeStepCircle]}>
          <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepNumber]}>2</Text>
        </View>
        <Text style={[styles.stepLabel, currentStep === 2 && styles.activeStepLabel]}>
          Ajouter des membres
        </Text>
      </View>
    </View>
  );

  const renderGroupInfoStep = () => (
    <Animated.View 
      style={[
        styles.stepContent,
        {
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      {/* Sélection d'emoji */}
      <View style={styles.emojiSection}>
        <Text style={styles.sectionTitle}>Icône du groupe</Text>
        <TouchableOpacity
          style={styles.emojiSelector}
          onPress={() => setShowEmojiPicker(true)}
        >
          <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
          <Ionicons name="chevron-down" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Nom du groupe */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Nom du groupe *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ex: Soirée entre amis"
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
        />
        <Text style={styles.characterCount}>{groupName.length}/50</Text>
      </View>

      {/* Description du groupe */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Description (optionnel)</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          placeholder="Décrivez brièvement le groupe..."
          value={groupDescription}
          onChangeText={setGroupDescription}
          multiline
          numberOfLines={3}
          maxLength={200}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>{groupDescription.length}/200</Text>
      </View>

      {/* Bouton suivant */}
      <TouchableOpacity
        style={[styles.nextButton, !groupName.trim() && styles.disabledButton]}
        onPress={() => {
          if (groupName.trim()) {
            setCurrentStep(2);
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              Animated.timing(animatedValue, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
            });
          }
        }}
        disabled={!groupName.trim()}
      >
        <LinearGradient
          colors={!groupName.trim() ? ['#cbd5e1', '#cbd5e1'] : ['#667eea', '#764ba2']}
          style={styles.nextButtonGradient}
        >
          <Text style={styles.nextButtonText}>Suivant</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAddMembersStep = () => (
    <Animated.View 
      style={[
        styles.stepContent,
        {
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Membres sélectionnés */}
      {selectedContacts.size > 0 && (
        <View style={styles.selectedMembersSection}>
          <Text style={styles.selectedMembersTitle}>
            {selectedContacts.size} membre(s) sélectionné(s)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedMembersList}>
              {Array.from(selectedContacts).map(contactId => {
                const contact = contactsData.find(c => c.id === contactId);
                return (
                  <View key={contactId} style={styles.selectedMemberItem}>
                    <Image source={{ uri: contact.avatar }} style={styles.selectedMemberAvatar} />
                    <TouchableOpacity
                      style={styles.removeMemberButton}
                      onPress={() => handleContactToggle(contactId)}
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Liste des contacts */}
      <View style={styles.contactsSection}>
        <Text style={styles.sectionTitle}>Contacts</Text>
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          showsVerticalScrollIndicator={false}
          style={styles.contactsList}
        />
      </View>
    </Animated.View>
  );

  const renderContactItem = ({ item }) => {
    const isSelected = selectedContacts.has(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedContactItem]}
        onPress={() => handleContactToggle(item.id)}
      >
        <View style={styles.contactInfo}>
          <View style={styles.contactAvatarContainer}>
            <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactStatus}>{item.lastSeen}</Text>
          </View>
        </View>
        
        <View style={styles.selectionIndicator}>
          <Ionicons
            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={isSelected ? "#667eea" : "#cbd5e1"}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmojiPicker = () => (
    <Modal
      visible={showEmojiPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEmojiPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.emojiPickerContainer}>
          <View style={styles.emojiPickerHeader}>
            <Text style={styles.emojiPickerTitle}>Choisir une icône</Text>
            <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.emojiGrid}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emojiItem,
                  selectedEmoji === emoji && styles.selectedEmojiItem
                ]}
                onPress={() => {
                  setSelectedEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (currentStep > 1) {
              setCurrentStep(1);
            } else {
              router.back();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Créer un groupe</Text>
        
        {currentStep === 2 && (
          <TouchableOpacity
            onPress={handleCreateGroup}
            disabled={isLoading || selectedContacts.size === 0}
            style={[
              styles.createButton,
              (isLoading || selectedContacts.size === 0) && styles.disabledCreateButton
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.createButtonText}>Créer</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 ? renderGroupInfoStep() : renderAddMembersStep()}
      </ScrollView>

      {/* Emoji Picker Modal */}
      {renderEmojiPicker()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  createButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledCreateButton: {
    backgroundColor: '#cbd5e1',
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: '#667eea',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeStepNumber: {
    color: 'white',
  },
  stepLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  activeStepLabel: {
    color: '#667eea',
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 20,
  },
  activeStepLine: {
    backgroundColor: '#667eea',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  emojiSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  emojiSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedEmoji: {
    fontSize: 24,
  },
  inputSection: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
  },
  multilineInput: {
    height: 80,
    paddingTop: 15,
  },
  characterCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 5,
  },
  nextButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1e293b',
  },
  selectedMembersSection: {
    marginBottom: 20,
  },
  selectedMembersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 12,
  },
  selectedMembersList: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  selectedMemberItem: {
    position: 'relative',
    marginRight: 15,
  },
  selectedMemberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  removeMemberButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsSection: {
    flex: 1,
  },
  contactsList: {
    maxHeight: 400,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedContactItem: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  contactAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: 'white',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 12,
    color: '#94a3b8',
  },
  selectionIndicator: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiPickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 10,
  },
  selectedEmojiItem: {
    backgroundColor: '#f0f4ff',
  },
  emojiText: {
    fontSize: 24,
  },
});

export default CreateGroupScreen;