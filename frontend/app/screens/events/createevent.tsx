import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const CreateEventScreen = () => {
  // État du formulaire
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date(),
    time: new Date(),
    maxAttendees: '',
    isPrivate: false,
    category: 'birthday',
    reminder: '1day',
    // Champs spécifiques aux anniversaires
    birthdayPerson: '',
    age: '',
    theme: '',
    giftIdeas: '',
    // Champs spécifiques aux fêtes
    dressCode: '',
    musicStyle: '',
    decorations: '',
    // Champs spécifiques aux dîners
    menuType: 'buffet',
    dietaryRestrictions: '',
    courses: '3',
    // Champs spécifiques aux réunions
    meetingType: 'casual',
    agenda: '',
    presenter: '',
    // Champs spécifiques aux célébrations
    celebrationType: 'achievement',
    honoredPerson: '',
    speechPlanned: false,
  });

  // États pour les pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Catégories d'événements
  const eventCategories = [
    { id: 'birthday', title: 'Anniversaire', icon: 'gift-outline', color: '#f56565' },
    { id: 'party', title: 'Fête', icon: 'musical-notes-outline', color: '#ed8936' },
    { id: 'dinner', title: 'Dîner', icon: 'restaurant-outline', color: '#48bb78' },
    { id: 'meeting', title: 'Réunion', icon: 'people-outline', color: '#667eea' },
    { id: 'celebration', title: 'Célébration', icon: 'trophy-outline', color: '#9f7aea' },
    { id: 'other', title: 'Autre', icon: 'calendar-outline', color: '#38b2ac' },
  ];

  // Options de rappel
  const reminderOptions = [
    { id: '1hour', title: '1 heure avant', value: '1hour' },
    { id: '1day', title: '1 jour avant', value: '1day' },
    { id: '1week', title: '1 semaine avant', value: '1week' },
    { id: 'custom', title: 'Personnalisé', value: 'custom' },
  ];

  const handleInputChange = (field, value) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('date', selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      handleInputChange('time', selectedTime);
    }
  };

  const validateForm = () => {
    if (!eventData.title.trim()) {
      Alert.alert('Erreur', 'Le titre de l\'événement est requis');
      return false;
    }
    if (!eventData.location.trim()) {
      Alert.alert('Erreur', 'Le lieu de l\'événement est requis');
      return false;
    }
    if (eventData.date < new Date()) {
      Alert.alert('Erreur', 'La date de l\'événement ne peut pas être dans le passé');
      return false;
    }

    // Validation spécifique par catégorie
    switch (eventData.category) {
      case 'birthday':
        if (!eventData.birthdayPerson.trim()) {
          Alert.alert('Erreur', 'Le nom de la personne fêtée est requis');
          return false;
        }
        break;
      case 'meeting':
        if (!eventData.presenter.trim()) {
          Alert.alert('Erreur', 'Le présentateur/organisateur est requis');
          return false;
        }
        break;
      case 'celebration':
        if (!eventData.honoredPerson.trim()) {
          Alert.alert('Erreur', 'La personne honorée est requise');
          return false;
        }
        break;
    }

    return true;
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simuler la création de l'événement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Succès',
        'Événement créé avec succès !',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de l\'événement');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Composant Header
  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Nouvel événement</Text>
          <Text style={styles.headerSubtitle}>Créez votre événement parfait</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => Alert.alert('Aide', 'Remplissez les informations pour créer votre événement. Les champs marqués d\'un * sont obligatoires.')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Formulaires spécialisés par catégorie
  const renderBirthdaySpecificFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎂 Détails de l'anniversaire</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Personne fêtée *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ex: Marie Dupont"
          value={eventData.birthdayPerson}
          onChangeText={(text) => handleInputChange('birthdayPerson', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Âge</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ex: 25"
          value={eventData.age}
          onChangeText={(text) => handleInputChange('age', text)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Thème de la fête</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ex: Années 80, Pirates, Princesse..."
          value={eventData.theme}
          onChangeText={(text) => handleInputChange('theme', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Idées de cadeaux</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaInput]}
          placeholder="Suggestions de cadeaux pour les invités..."
          value={eventData.giftIdeas}
          onChangeText={(text) => handleInputChange('giftIdeas', text)}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderPartySpecificFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎉 Détails de la fête</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Code vestimentaire</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ex: Décontracté, Élégant, Costumé..."
          value={eventData.dressCode}
          onChangeText={(text) => handleInputChange('dressCode', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Style de musique</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ex: Pop, Rock, Électro, Variété française..."
          value={eventData.musicStyle}
          onChangeText={(text) => handleInputChange('musicStyle', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Décorations prévues</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaInput]}
          placeholder="Décrivez l'ambiance et les décorations..."
          value={eventData.decorations}
          onChangeText={(text) => handleInputChange('decorations', text)}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderDinnerSpecificFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🍽️ Détails du dîner</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Type de service</Text>
        <View style={styles.radioGroup}>
          {['buffet', 'service à table', 'cocktail'].map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.radioOption}
              onPress={() => handleInputChange('menuType', type)}
            >
              <View style={[
                styles.radioButton,
                eventData.menuType === type && styles.radioButtonActive
              ]}>
                {eventData.menuType === type && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.radioText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre de services</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ex: 3 (entrée, plat, dessert)"
          value={eventData.courses}
          onChangeText={(text) => handleInputChange('courses', text)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Restrictions alimentaires</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaInput]}
          placeholder="Allergies, régimes spéciaux, préférences..."
          value={eventData.dietaryRestrictions}
          onChangeText={(text) => handleInputChange('dietaryRestrictions', text)}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderMeetingSpecificFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>👥 Détails de la réunion</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Type de réunion</Text>
        <View style={styles.radioGroup}>
          {['casual', 'professionnel', 'brainstorming'].map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.radioOption}
              onPress={() => handleInputChange('meetingType', type)}
            >
              <View style={[
                styles.radioButton,
                eventData.meetingType === type && styles.radioButtonActive
              ]}>
                {eventData.meetingType === type && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.radioText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Présentateur/Organisateur *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Nom du responsable"
          value={eventData.presenter}
          onChangeText={(text) => handleInputChange('presenter', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ordre du jour</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaInput]}
          placeholder="Points à aborder lors de la réunion..."
          value={eventData.agenda}
          onChangeText={(text) => handleInputChange('agenda', text)}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderCelebrationSpecificFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏆 Détails de la célébration</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Type de célébration</Text>
        <View style={styles.radioGroup}>
          {['achievement', 'promotion', 'retirement', 'graduation'].map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.radioOption}
              onPress={() => handleInputChange('celebrationType', type)}
            >
              <View style={[
                styles.radioButton,
                eventData.celebrationType === type && styles.radioButtonActive
              ]}>
                {eventData.celebrationType === type && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.radioText}>
                {type === 'achievement' && 'Réussite'}
                {type === 'promotion' && 'Promotion'}
                {type === 'retirement' && 'Retraite'}
                {type === 'graduation' && 'Diplôme'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Personne honorée *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Nom de la personne célébrée"
          value={eventData.honoredPerson}
          onChangeText={(text) => handleInputChange('honoredPerson', text)}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="mic-outline" size={20} color="#64748b" />
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Discours prévu</Text>
            <Text style={styles.settingDescription}>Y aura-t-il des discours ou allocutions ?</Text>
          </View>
        </View>
        <Switch
          value={eventData.speechPlanned}
          onValueChange={(value) => handleInputChange('speechPlanned', value)}
          trackColor={{ false: '#e2e8f0', true: '#667eea' }}
          thumbColor={eventData.speechPlanned ? '#ffffff' : '#f8fafc'}
        />
      </View>
    </View>
  );

  const renderCategorySpecificFields = () => {
    switch (eventData.category) {
      case 'birthday':
        return renderBirthdaySpecificFields();
      case 'party':
        return renderPartySpecificFields();
      case 'dinner':
        return renderDinnerSpecificFields();
      case 'meeting':
        return renderMeetingSpecificFields();
      case 'celebration':
        return renderCelebrationSpecificFields();
      default:
        return null;
    }
  };

  const renderCategorySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎯 Catégorie</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {eventCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              eventData.category === category.id && styles.categoryItemActive
            ]}
            onPress={() => handleInputChange('category', category.id)}
          >
            <View style={[
              styles.categoryIcon,
              { backgroundColor: category.color },
              eventData.category === category.id && styles.categoryIconActive
            ]}>
              <Ionicons name={category.icon} size={20} color="white" />
            </View>
            <Text style={[
              styles.categoryText,
              eventData.category === category.id && styles.categoryTextActive
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📝 Informations de base</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Titre de l'événement *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ex: Anniversaire de Marie"
          value={eventData.title}
          onChangeText={(text) => handleInputChange('title', text)}
          maxLength={50}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaInput]}
          placeholder="Décrivez votre événement..."
          value={eventData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          multiline
          numberOfLines={4}
          maxLength={200}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Lieu *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ex: Restaurant Le Bon Goût"
          value={eventData.location}
          onChangeText={(text) => handleInputChange('location', text)}
        />
      </View>
    </View>
  );

  const renderDateTimeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📅 Date et heure</Text>
      
      <View style={styles.dateTimeRow}>
        <TouchableOpacity 
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#667eea" />
          <View style={styles.dateTimeTextContainer}>
            <Text style={styles.dateTimeLabel}>Date</Text>
            <Text style={styles.dateTimeValue}>{formatDate(eventData.date)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dateTimeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={20} color="#667eea" />
          <View style={styles.dateTimeTextContainer}>
            <Text style={styles.dateTimeLabel}>Heure</Text>
            <Text style={styles.dateTimeValue}>{formatTime(eventData.time)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={eventData.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={eventData.time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );

  const renderEventSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚙️ Paramètres</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="people-outline" size={20} color="#64748b" />
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Nombre maximum de participants</Text>
            <Text style={styles.settingDescription}>Laissez vide pour aucune limite</Text>
          </View>
        </View>
        <TextInput
          style={styles.numberInput}
          placeholder="∞"
          value={eventData.maxAttendees}
          onChangeText={(text) => handleInputChange('maxAttendees', text)}
          keyboardType="numeric"
          maxLength={3}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Événement privé</Text>
            <Text style={styles.settingDescription}>Seuls les invités peuvent voir l'événement</Text>
          </View>
        </View>
        <Switch
          value={eventData.isPrivate}
          onValueChange={(value) => handleInputChange('isPrivate', value)}
          trackColor={{ false: '#e2e8f0', true: '#667eea' }}
          thumbColor={eventData.isPrivate ? '#ffffff' : '#f8fafc'}
        />
      </View>
    </View>
  );

  const renderReminderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔔 Rappel</Text>
      
      {reminderOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.reminderOption,
            eventData.reminder === option.value && styles.reminderOptionActive
          ]}
          onPress={() => handleInputChange('reminder', option.value)}
        >
          <View style={styles.reminderOptionLeft}>
            <View style={[
              styles.radioButton,
              eventData.reminder === option.value && styles.radioButtonActive
            ]}>
              {eventData.reminder === option.value && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
            <Text style={[
              styles.reminderOptionText,
              eventData.reminder === option.value && styles.reminderOptionTextActive
            ]}>
              {option.title}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCreateButton = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
        onPress={handleCreateEvent}
        disabled={isLoading}
      >
        <LinearGradient
          colors={isLoading ? ['#94a3b8', '#cbd5e1'] : ['#667eea', '#764ba2']}
          style={styles.createButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isLoading ? (
            <Text style={styles.createButtonText}>Création en cours...</Text>
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.createButtonText}>Créer l'événement</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderCategorySelector()}
          {renderBasicInfo()}
          {renderCategorySpecificFields()}
          {renderDateTimeSelector()}
          {renderEventSettings()}
          {renderReminderSettings()}
        </ScrollView>
        
        {renderCreateButton()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // Styles du Header
  header: {
    backgroundColor: 'white',
    paddingBottom: 10,
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  helpButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconActive: {
    transform: [{ scale: 1.1 }],
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'column',
    gap: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#667eea',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#667eea',
  },
  radioText: {
    fontSize: 16,
    color: '#374151',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 15,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 15,
  },
  dateTimeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  numberInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center',
    minWidth: 60,
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reminderOptionActive: {
    backgroundColor: '#f1f5f9',
    borderColor: '#667eea',
  },
  reminderOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  reminderOptionTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonDisabled: {
    elevation: 1,
    shadowOpacity: 0.1,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CreateEventScreen;