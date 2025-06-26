import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  FlatList,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Données d'exemple pour les contacts
const contactsData = [
  {
    id: '1',
    name: 'Marie Dubois',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    isOnline: true,
    phone: '+33 6 12 34 56 78',
  },
  {
    id: '2',
    name: 'Pierre Martin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    isOnline: false,
    phone: '+33 6 23 45 67 89',
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    isOnline: true,
    phone: '+33 6 34 56 78 90',
  },
  {
    id: '4',
    name: 'Thomas Petit',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    isOnline: false,
    phone: '+33 6 45 67 89 01',
  },
  {
    id: '5',
    name: 'Julie Bernard',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face',
    isOnline: true,
    phone: '+33 6 56 78 90 12',
  },
  {
    id: '6',
    name: 'Alex Moreau',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    isOnline: false,
    phone: '+33 6 67 89 01 23',
  },
  {
    id: '7',
    name: 'Emma Rousseau',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face',
    isOnline: true,
    phone: '+33 6 78 90 12 34',
  },
  {
    id: '8',
    name: 'Lucas Durand',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face',
    isOnline: false,
    phone: '+33 6 89 01 23 45',
  },
];

const BroadcastScreen = () => {
  const [contacts, setContacts] = useState(contactsData);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Sélection contacts, 2: Composition message
  const [isSending, setIsSending] = useState(false);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const handleContactToggle = (contactId) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContacts(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(contact => contact.id)));
    }
  };

  const handleNext = () => {
    if (selectedContacts.size === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un contact.');
      return;
    }
    setCurrentStep(2);
  };

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message.');
      return;
    }

    setIsSending(true);
    
    // Simuler l'envoi du broadcast
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Message envoyé !',
        `Votre message a été envoyé à ${selectedContacts.size} contact(s).`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi.');
    } finally {
      setIsSending(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          onPress={() => currentStep === 1 ? router.back() : setCurrentStep(1)}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {currentStep === 1 ? 'Nouvelle diffusion' : 'Composer le message'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentStep === 1 
              ? `${selectedContacts.size} contact(s) sélectionné(s)`
              : `Envoyer à ${selectedContacts.size} contact(s)`
            }
          </Text>
        </View>

        {currentStep === 1 && (
          <TouchableOpacity 
            onPress={handleSelectAll}
            style={styles.selectAllButton}
          >
            <Text style={styles.selectAllText}>
              {selectedContacts.size === filteredContacts.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Barre de progression */}
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, currentStep >= 1 && styles.activeProgressStep]} />
        <View style={[styles.progressStep, currentStep >= 2 && styles.activeProgressStep]} />
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un contact..."
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
  );

  const renderContactItem = ({ item }) => {
    const isSelected = selectedContacts.has(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedContactItem]}
        onPress={() => handleContactToggle(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.contactLeft}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactPhone}>{item.phone}</Text>
          </View>
        </View>
        
        <View style={styles.contactRight}>
          <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
            {isSelected && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedContacts = () => {
    const selectedContactsList = contacts.filter(contact => 
      selectedContacts.has(contact.id)
    );
    
    return (
      <View style={styles.selectedContactsContainer}>
        <Text style={styles.selectedContactsTitle}>Destinataires :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedContactsList.map((contact) => (
            <View key={contact.id} style={styles.selectedContactChip}>
              <Image source={{ uri: contact.avatar }} style={styles.chipAvatar} />
              <Text style={styles.chipName} numberOfLines={1}>
                {contact.name.split(' ')[0]}
              </Text>
              <TouchableOpacity 
                onPress={() => handleContactToggle(contact.id)}
                style={styles.chipRemove}
              >
                <Ionicons name="close" size={12} color="#64748b" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderMessageComposer = () => (
    <View style={styles.messageComposer}>
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Tapez votre message de diffusion..."
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
          maxLength={1000}
        />
        <View style={styles.messageInputFooter}>
          <Text style={styles.characterCount}>{message.length}/1000</Text>
        </View>
      </View>
      
      <View style={styles.messageOptions}>
        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="image-outline" size={24} color="#667eea" />
          <Text style={styles.optionText}>Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="document-outline" size={24} color="#667eea" />
          <Text style={styles.optionText}>Document</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="location-outline" size={24} color="#667eea" />
          <Text style={styles.optionText}>Position</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFloatingButton = () => {
    if (currentStep === 1) {
      return (
        <TouchableOpacity 
          style={[styles.floatingButton, selectedContacts.size === 0 && styles.disabledButton]}
          onPress={handleNext}
          disabled={selectedContacts.size === 0}
        >
          <LinearGradient
            colors={selectedContacts.size === 0 ? ['#94a3b8', '#94a3b8'] : ['#667eea', '#764ba2']}
            style={styles.floatingButtonGradient}
          >
            <Text style={styles.floatingButtonText}>Suivant</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity 
          style={[styles.floatingButton, (!message.trim() || isSending) && styles.disabledButton]}
          onPress={handleSendBroadcast}
          disabled={!message.trim() || isSending}
        >
          <LinearGradient
            colors={(!message.trim() || isSending) ? ['#94a3b8', '#94a3b8'] : ['#22c55e', '#16a34a']}
            style={styles.floatingButtonGradient}
          >
            {isSending ? (
              <>
                <Text style={styles.floatingButtonText}>Envoi...</Text>
                <MaterialIcons name="hourglass-empty" size={20} color="white" />
              </>
            ) : (
              <>
                <Text style={styles.floatingButtonText}>Envoyer</Text>
                <Ionicons name="send" size={20} color="white" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderHeader()}
        
        {currentStep === 1 ? (
          <>
            {renderSearchBar()}
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              renderItem={renderContactItem}
              contentContainerStyle={styles.contactsList}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <ScrollView style={styles.messageContainer}>
            {renderSelectedContacts()}
            {renderMessageComposer()}
          </ScrollView>
        )}
        
        {renderFloatingButton()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingVertical: 30,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    marginTop: 2,
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  selectAllText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressStep: {
    flex: 1,
    height: 3,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  activeProgressStep: {
    backgroundColor: '#667eea',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
  contactsList: {
    paddingBottom: 100,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedContactItem: {
    backgroundColor: '#f0f4ff',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: 'white',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 13,
    color: '#64748b',
  },
  contactRight: {
    marginLeft: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  messageContainer: {
    flex: 1,
  },
  selectedContactsContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedContactsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
  },
  selectedContactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 100,
  },
  chipAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  chipName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
  },
  chipRemove: {
    marginLeft: 4,
    padding: 2,
  },
  messageComposer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageInputContainer: {
    padding: 20,
  },
  messageInput: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  messageInputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  characterCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  messageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  optionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    marginTop: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    left: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default BroadcastScreen;