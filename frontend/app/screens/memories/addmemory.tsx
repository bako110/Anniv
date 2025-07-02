import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import memoryService from '../../../services/memorie'; // Assurez-vous que le chemin est correct
import { theme } from '../../../constants/theme'; // Supposons que vous ayez un fichier theme.js

const AddMemoryScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [memoryType, setMemoryType] = useState('vacation');
  const [isLoading, setIsLoading] = useState(false);
  const descriptionRef = useRef();

  const memoryTypes = [
    { id: 'vacation', name: 'Vacances', icon: 'beach', color: '#3b82f6' },
    { id: 'birthday', name: 'Anniversaire', icon: 'cake', color: '#ec4899' },
    { id: 'party', name: 'Soirée', icon: 'wine', color: '#a855f7' },
    { id: 'family', name: 'Famille', icon: 'people', color: '#f59e0b' },
    { id: 'travel', name: 'Voyage', icon: 'airplane', color: '#10b981' },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à vos photos.'
        );
      }
    })();
  }, []);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          id: Math.random().toString(36).substring(7),
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection des images.');
    }
  };

  const removeImage = (id) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Titre manquant', 'Veuillez donner un titre à votre souvenir.');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Aucune image', 'Veuillez ajouter au moins une photo à votre souvenir.');
      return;
    }

    setIsLoading(true);

    try {
      // Préparer les données du souvenir
      const memoryData = {
        title,
        description,
        date,
        selectedImages,
        memoryType
      };

      // Sauvegarder le souvenir avec le service
      const result = await memoryService.saveMemory(memoryData);

      if (result.success) {
        // Réinitialiser le formulaire après soumission réussie
        setTitle('');
        setDescription('');
        setSelectedImages([]);
        setDate(new Date());
        setMemoryType('vacation');
        
        Alert.alert('Succès', result.message, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Erreur', result.message || 'Une erreur est survenue lors de l\'enregistrement.');
      }
    } catch (error) {
      console.error('Error saving memory:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue lors de l\'enregistrement de votre souvenir.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Nouveau souvenir</Text>
      <TouchableOpacity 
        onPress={handleSubmit}
        disabled={isLoading}
        style={styles.submitButton}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Enregistrer</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderImagePicker = () => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.sectionTitle}>Photos</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagesScrollContainer}
      >
        {selectedImages.map((image) => (
          <View key={image.id} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.selectedImage} />
            <TouchableOpacity 
              onPress={() => removeImage(image.id)}
              style={styles.removeImageButton}
            >
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity onPress={pickImages} style={styles.addImageButton}>
          <LinearGradient
            colors={['#f3f4f6', '#e5e7eb']}
            style={styles.addImageGradient}
          >
            <Ionicons name="add" size={32} color="#6b7280" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
      
      {selectedImages.length === 0 && (
        <Text style={styles.imageHintText}>
          Ajoutez des photos pour immortaliser ce moment
        </Text>
      )}
    </View>
  );

  const renderMemoryTypeSelector = () => (
    <View style={styles.typeSelectorContainer}>
      <Text style={styles.sectionTitle}>Type de souvenir</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeScrollContainer}
      >
        {memoryTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            onPress={() => setMemoryType(type.id)}
            style={[
              styles.typeButton,
              memoryType === type.id && { 
                backgroundColor: type.color + '20',
                borderColor: type.color,
              }
            ]}
          >
            <Ionicons 
              name={type.icon} 
              size={24} 
              color={memoryType === type.id ? type.color : '#9ca3af'} 
            />
            <Text 
              style={[
                styles.typeButtonText,
                memoryType === type.id && { color: type.color }
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDatePicker = () => (
    <View style={styles.dateContainer}>
      <Text style={styles.sectionTitle}>Date</Text>
      <TouchableOpacity 
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Ionicons name="calendar" size={20} color="#6b7280" />
        <Text style={styles.dateText}>{formatDate(date)}</Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          locale="fr-FR"
        />
      )}
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.titleInput}
        placeholder="Titre du souvenir"
        placeholderTextColor="#9ca3af"
        value={title}
        onChangeText={setTitle}
        maxLength={50}
        returnKeyType="next"
        onSubmitEditing={() => descriptionRef.current.focus()}
      />
      
      <TextInput
        ref={descriptionRef}
        style={styles.descriptionInput}
        placeholder="Décrivez ce moment spécial..."
        placeholderTextColor="#9ca3af"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {renderImagePicker()}
            {renderMemoryTypeSelector()}
            {renderDatePicker()}
            {renderForm()}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  imagePickerContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  imagesScrollContainer: {
    paddingRight: 20,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addImageGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHintText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 10,
    textAlign: 'center',
  },
  typeSelectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  typeScrollContainer: {
    paddingRight: 20,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    color: '#9ca3af',
  },
  dateContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginHorizontal: 10,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  titleInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 15,
  },
  descriptionInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 120,
    textAlignVertical: 'top',
  },
});

export default AddMemoryScreen;