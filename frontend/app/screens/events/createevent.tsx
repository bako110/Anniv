import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import EventService from '../../../services/events/event';
import Createeventstyles from '../../../styles/createevent';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

// Catégories d'événements avec icônes et couleurs
const eventCategories = [
  { id: 'birthday', name: 'Anniversaire', icon: 'gift', color: '#f56565', gradient: ['#fed7d7', '#f56565'] },
  { id: 'music', name: 'Musique', icon: 'musical-notes', color: '#ed8936', gradient: ['#feebc8', '#ed8936'] },
  { id: 'social', name: 'Social', icon: 'people', color: '#48bb78', gradient: ['#c6f6d5', '#48bb78'] },
  { id: 'culture', name: 'Culture', icon: 'library', color: '#9f7aea', gradient: ['#e9d8fd', '#9f7aea'] },
  { id: 'workshop', name: 'Formation', icon: 'school', color: '#38b2ac', gradient: ['#b2f5ea', '#38b2ac'] },
  { id: 'sport', name: 'Sport', icon: 'fitness', color: '#3182ce', gradient: ['#bee3f8', '#3182ce'] },
  { id: 'food', name: 'Gastronomie', icon: 'restaurant', color: '#d53f8c', gradient: ['#fed7e2', '#d53f8c'] },
  { id: 'business', name: 'Business', icon: 'briefcase', color: '#2d3748', gradient: ['#e2e8f0', '#2d3748'] },
];

// Options de prix prédéfinies
const priceOptions = [
  { id: 'free', label: 'Gratuit', value: 'Gratuit' },
  { id: 'paid', label: 'Payant', value: 'custom' },
];

const CreateEventScreen = () => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: new Date(),
    location: '',
    category: '',
    price: 'Gratuit',
    customPrice: '',
    image: null,
    video: null,
    isPublic: true,
    allowComments: true,
    allowSharing: true,
    maxAttendees: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedPriceOption, setSelectedPriceOption] = useState('free');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');

  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setEventData(prev => ({ ...prev, image: result.assets[0].uri, video: null }));
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos vidéos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setEventData(prev => ({ ...prev, video: result.assets[0].uri, image: null }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à votre caméra.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setEventData(prev => ({ ...prev, image: result.assets[0].uri, video: null }));
    }
  };

  const showMediaOptions = () => {
    Alert.alert(
      'Ajouter un média',
      'Choisissez une option',
      [
        { text: 'Galerie (Image)', onPress: pickImage },
        { text: 'Galerie (Vidéo)', onPress: pickVideo },
        { text: 'Caméra', onPress: takePhoto },
        { text: 'Annuler', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setEventData(prev => ({ ...prev, time: selectedTime }));
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

  const validateForm = () => {
    if (!eventData.title.trim()) {
      Alert.alert('Erreur', 'Le titre de l\'événement est requis.');
      return false;
    }
    if (!eventData.description.trim()) {
      Alert.alert('Erreur', 'La description de l\'événement est requise.');
      return false;
    }
    if (!eventData.location.trim()) {
      Alert.alert('Erreur', 'Le lieu de l\'événement est requis.');
      return false;
    }
    if (!eventData.category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie.');
      return false;
    }
    if (selectedPriceOption === 'paid' && !eventData.customPrice.trim()) {
      Alert.alert('Erreur', 'Veuillez préciser le prix de l\'événement.');
      return false;
    }
    return true;
  };

  const prepareEventData = () => {
    const eventDate = new Date(eventData.date);
    const eventTime = new Date(eventData.time);

    eventDate.setHours(eventTime.getHours());
    eventDate.setMinutes(eventTime.getMinutes());

    const formattedData = {
      title: eventData.title.trim(),
      description: eventData.description.trim(),
      date: eventDate.toISOString(),
      location: eventData.location.trim(),
      category: eventData.category,
      price: selectedPriceOption === 'free' ? 'Gratuit' : `${eventData.customPrice}€`,
      image: eventData.image || null,
      video: eventData.video || null,
      is_public: eventData.isPublic,
      allow_comments: eventData.allowComments,
      allow_sharing: eventData.allowSharing,
      max_attendees: eventData.maxAttendees ? parseInt(eventData.maxAttendees) : null,
    };

    console.log('Données formatées avant envoi:', formattedData);
    return formattedData;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitProgress('Préparation des données...');

    try {
      const formattedEventData = prepareEventData();

      setSubmitProgress('Création de l\'événement...');

      const result = await EventService.createEvent(formattedEventData);

      if (result.success) {
        setSubmitProgress('Événement créé avec succès!');

        Alert.alert(
          'Succès! 🎉',
          'Votre événement a été créé avec succès!',
          [
            {
              text: 'Voir l\'événement',
              onPress: () => {
                router.back();
              }
            }
          ]
        );
      } else if (result.offline) {
        Alert.alert(
          'Mode hors ligne 📱',
          result.message || 'Votre événement a été sauvegardé et sera publié dès que la connexion sera rétablie.',
          [
            {
              text: 'Compris',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur création événement:', error);

      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue lors de la création de l\'événement. Veuillez réessayer.',
        [
          { text: 'Réessayer', onPress: () => handleSubmit() },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    } finally {
      setIsSubmitting(false);
      setSubmitProgress('');
    }
  };

  const renderHeader = () => (
    <View style={Createeventstyles.header}>
      <TouchableOpacity onPress={() => router.back()} style={Createeventstyles.headerButton}>
        <Ionicons name="close" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={Createeventstyles.headerTitle}>Créer un événement</Text>
      <TouchableOpacity
        onPress={handleSubmit}
        style={[Createeventstyles.headerButton, Createeventstyles.saveButton, isSubmitting && Createeventstyles.saveButtonDisabled]}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#667eea" />
        ) : (
          <Text style={Createeventstyles.saveButtonText}>Publier</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSubmitProgress = () => {
    if (!isSubmitting || !submitProgress) return null;

    return (
      <View style={Createeventstyles.progressContainer}>
        <ActivityIndicator size="small" color="#667eea" />
        <Text style={Createeventstyles.progressText}>{submitProgress}</Text>
      </View>
    );
  };

  const renderMediaSection = () => (
    <View style={Createeventstyles.section}>
      <Text style={Createeventstyles.sectionTitle}>Média de couverture</Text>
      <TouchableOpacity style={Createeventstyles.imageContainer} onPress={showMediaOptions}>
        {eventData.image ? (
          <View>
            <Image source={{ uri: eventData.image }} style={Createeventstyles.eventImage} />
            <View style={Createeventstyles.imageOverlay}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={Createeventstyles.imageOverlayText}>Changer le média</Text>
            </View>
          </View>
        ) : eventData.video ? (
          <View>
            <Video
              source={{ uri: eventData.video }}
              style={Createeventstyles.eventVideo}
              resizeMode="cover"
            />
            <View style={Createeventstyles.imageOverlay}>
              <Ionicons name="videocam" size={24} color="white" />
              <Text style={Createeventstyles.imageOverlayText}>Changer le média</Text>
            </View>
          </View>
        ) : (
          <View style={Createeventstyles.imagePlaceholder}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={Createeventstyles.imagePlaceholderGradient}
            >
              <Ionicons name="camera" size={32} color="white" />
              <Text style={Createeventstyles.imagePlaceholderText}>Ajouter un média</Text>
              <Text style={Createeventstyles.imagePlaceholderSubtext}>Image ou Vidéo</Text>
            </LinearGradient>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderBasicInfo = () => (
    <View style={Createeventstyles.section}>
      <Text style={Createeventstyles.sectionTitle}>Informations de base</Text>

      <View style={Createeventstyles.inputContainer}>
        <Text style={Createeventstyles.inputLabel}>Titre de l'événement *</Text>
        <TextInput
          style={Createeventstyles.textInput}
          placeholder="Ex: Soirée d'anniversaire, Concert de jazz..."
          value={eventData.title}
          onChangeText={(text) => setEventData(prev => ({ ...prev, title: text }))}
          maxLength={100}
        />
        <Text style={Createeventstyles.characterCount}>{eventData.title.length}/100</Text>
      </View>

      <View style={Createeventstyles.inputContainer}>
        <Text style={Createeventstyles.inputLabel}>Description *</Text>
        <TextInput
          style={[Createeventstyles.textInput, Createeventstyles.textAreaInput]}
          placeholder="Décrivez votre événement en détail..."
          value={eventData.description}
          onChangeText={(text) => setEventData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={Createeventstyles.characterCount}>{eventData.description.length}/500</Text>
      </View>
    </View>
  );

  const renderCategorySelection = () => (
    <View style={Createeventstyles.section}>
      <Text style={Createeventstyles.sectionTitle}>Catégorie *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={Createeventstyles.categoriesContainer}
      >
        {eventCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              Createeventstyles.categoryCard,
              eventData.category === category.id && Createeventstyles.categoryCardSelected
            ]}
            onPress={() => setEventData(prev => ({ ...prev, category: category.id }))}
          >
            <LinearGradient
              colors={eventData.category === category.id ? category.gradient : ['#f8fafc', '#f1f5f9']}
              style={Createeventstyles.categoryCardGradient}
            >
              <View style={[
                Createeventstyles.categoryIconContainer,
                { backgroundColor: eventData.category === category.id ? 'rgba(255,255,255,0.2)' : 'white' }
              ]}>
                <Ionicons
                  name={category.icon}
                  size={20}
                  color={eventData.category === category.id ? category.color : '#64748b'}
                />
              </View>
              <Text style={[
                Createeventstyles.categoryCardText,
                eventData.category === category.id && { color: category.color, fontWeight: '600' }
              ]}>
                {category.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDateTimeSection = () => (
    <View style={Createeventstyles.section}>
      <Text style={Createeventstyles.sectionTitle}>Date et heure</Text>

      <View style={Createeventstyles.dateTimeContainer}>
        <TouchableOpacity
          style={Createeventstyles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={Createeventstyles.dateTimeIcon}>
            <Ionicons name="calendar" size={20} color="#667eea" />
          </View>
          <View style={Createeventstyles.dateTimeInfo}>
            <Text style={Createeventstyles.dateTimeLabel}>Date</Text>
            <Text style={Createeventstyles.dateTimeValue}>{formatDate(eventData.date)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={Createeventstyles.dateTimeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <View style={Createeventstyles.dateTimeIcon}>
            <Ionicons name="time" size={20} color="#667eea" />
          </View>
          <View style={Createeventstyles.dateTimeInfo}>
            <Text style={Createeventstyles.dateTimeLabel}>Heure</Text>
            <Text style={Createeventstyles.dateTimeValue}>{formatTime(eventData.time)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={eventData.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={eventData.time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );

  const renderLocationSection = () => (
    <View style={Createeventstyles.section}>
      <Text style={Createeventstyles.sectionTitle}>Lieu *</Text>
      <View style={Createeventstyles.inputContainer}>
        <View style={Createeventstyles.locationInputContainer}>
          <Ionicons name="location" size={20} color="#667eea" style={Createeventstyles.locationIcon} />
          <TextInput
            style={[Createeventstyles.textInput, Createeventstyles.locationInput]}
            placeholder="Adresse complète du lieu"
            value={eventData.location}
            onChangeText={(text) => setEventData(prev => ({ ...prev, location: text }))}
          />
        </View>
      </View>
    </View>
  );

  const renderPriceSection = () => (
    <View style={Createeventstyles.section}>
      <Text style={Createeventstyles.sectionTitle}>Prix</Text>

      <View style={Createeventstyles.priceOptionsContainer}>
        {priceOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              Createeventstyles.priceOption,
              selectedPriceOption === option.id && Createeventstyles.priceOptionSelected
            ]}
            onPress={() => setSelectedPriceOption(option.id)}
          >
            <View style={Createeventstyles.priceOptionContent}>
              <View style={[
                Createeventstyles.radioButton,
                selectedPriceOption === option.id && Createeventstyles.radioButtonSelected
              ]}>
                {selectedPriceOption === option.id && (
                  <View style={Createeventstyles.radioButtonInner} />
                )}
              </View>
              <Text style={[
                Createeventstyles.priceOptionText,
                selectedPriceOption === option.id && Createeventstyles.priceOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {selectedPriceOption === 'paid' && (
        <View style={Createeventstyles.inputContainer}>
          <View style={Createeventstyles.priceInputContainer}>
            <TextInput
              style={[Createeventstyles.textInput, Createeventstyles.priceInput]}
              placeholder="0"
              value={eventData.customPrice}
              onChangeText={(text) => setEventData(prev => ({ ...prev, customPrice: text }))}
              keyboardType="numeric"
            />
            <Text style={Createeventstyles.priceInputSuffix}>€</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderSettingsSection = () => (
    <View style={Createeventstyles.section}>
      <Text style={Createeventstyles.sectionTitle}>Paramètres de publication</Text>

      <View style={Createeventstyles.settingsContainer}>
        <View style={Createeventstyles.settingItem}>
          <View style={Createeventstyles.settingInfo}>
            <Text style={Createeventstyles.settingTitle}>Événement public</Text>
            <Text style={Createeventstyles.settingDescription}>Visible par tous les utilisateurs</Text>
          </View>
          <TouchableOpacity
            style={[Createeventstyles.toggle, eventData.isPublic && Createeventstyles.toggleActive]}
            onPress={() => setEventData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
          >
            <View style={[Createeventstyles.toggleThumb, eventData.isPublic && Createeventstyles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={Createeventstyles.settingItem}>
          <View style={Createeventstyles.settingInfo}>
            <Text style={Createeventstyles.settingTitle}>Autoriser les commentaires</Text>
            <Text style={Createeventstyles.settingDescription}>Les utilisateurs peuvent commenter</Text>
          </View>
          <TouchableOpacity
            style={[Createeventstyles.toggle, eventData.allowComments && Createeventstyles.toggleActive]}
            onPress={() => setEventData(prev => ({ ...prev, allowComments: !prev.allowComments }))}
          >
            <View style={[Createeventstyles.toggleThumb, eventData.allowComments && Createeventstyles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={Createeventstyles.settingItem}>
          <View style={Createeventstyles.settingInfo}>
            <Text style={Createeventstyles.settingTitle}>Autoriser le partage</Text>
            <Text style={Createeventstyles.settingDescription}>Les utilisateurs peuvent partager l'événement</Text>
          </View>
          <TouchableOpacity
            style={[Createeventstyles.toggle, eventData.allowSharing && Createeventstyles.toggleActive]}
            onPress={() => setEventData(prev => ({ ...prev, allowSharing: !prev.allowSharing }))}
          >
            <View style={[Createeventstyles.toggleThumb, eventData.allowSharing && Createeventstyles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={Createeventstyles.inputContainer}>
        <Text style={Createeventstyles.inputLabel}>Nombre maximum de participants (optionnel)</Text>
        <TextInput
          style={Createeventstyles.textInput}
          placeholder="Illimité"
          value={eventData.maxAttendees}
          onChangeText={(text) => setEventData(prev => ({ ...prev, maxAttendees: text }))}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={Createeventstyles.container}>
      {renderHeader()}
      {renderSubmitProgress()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={Createeventstyles.keyboardContainer}
      >
        <Animated.ScrollView
          ref={scrollViewRef}
          style={[Createeventstyles.scrollView, { opacity: fadeAnim }]}
          contentContainerStyle={Createeventstyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderMediaSection()}
          {renderBasicInfo()}
          {renderCategorySelection()}
          {renderDateTimeSection()}
          {renderLocationSection()}
          {renderPriceSection()}
          {renderSettingsSection()}

          <View style={Createeventstyles.bottomSpacer} />
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateEventScreen;
