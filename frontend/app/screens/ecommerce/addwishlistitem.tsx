import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'electronics', name: 'Électronique', icon: 'phone-portrait', color: '#667eea' },
  { id: 'fashion', name: 'Mode', icon: 'shirt', color: '#764ba2' },
  { id: 'beauty', name: 'Beauté', icon: 'flower', color: '#ff6b9d' },
  { id: 'books', name: 'Livres', icon: 'book', color: '#4ecdc4' },
  { id: 'sports', name: 'Sport', icon: 'basketball', color: '#45b7d1' },
  { id: 'home', name: 'Maison', icon: 'home', color: '#96ceb4' },
  { id: 'tech', name: 'Tech', icon: 'laptop', color: '#667eea' },
  { id: 'other', name: 'Autre', icon: 'ellipsis-horizontal', color: '#a8a8a8' },
];

const priorities = [
  { id: 'high', name: 'Urgent', icon: 'star', color: '#ff4757', description: 'Je le veux vraiment !' },
  { id: 'medium', name: 'Bientôt', icon: 'time', color: '#ffa502', description: 'Ce serait sympa' },
  { id: 'low', name: 'Plus tard', icon: 'checkmark-circle', color: '#26de81', description: 'Pas pressé' },
];

const occasions = [
  { id: 'birthday', name: 'Anniversaire', icon: 'gift', emoji: '🎂' },
  { id: 'christmas', name: 'Noël', icon: 'snow', emoji: '🎄' },
  { id: 'graduation', name: 'Diplôme', icon: 'school', emoji: '🎓' },
  { id: 'wedding', name: 'Mariage', icon: 'heart', emoji: '💒' },
  { id: 'other', name: 'Autre', icon: 'calendar', emoji: '📅' },
];

const AddWishlistItemScreen = () => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    link: '',
    imageUrl: '',
    category: 'electronics',
    priority: 'medium',
    occasion: 'birthday',
    brand: '',
    description: '',
    size: '',
    color: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-load image preview
    if (field === 'imageUrl' && value) {
      setImagePreview(value);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulation d'une sauvegarde
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Succès !', 
        `"${formData.title}" a été ajouté à votre wishlist d'anniversaire 🎉`,
        [
          {
            text: 'Voir ma liste',
            onPress: () => router.back()
          },
          {
            text: 'Ajouter autre chose',
            onPress: () => {
              setFormData({
                title: '',
                price: '',
                link: '',
                imageUrl: '',
                category: 'electronics',
                priority: 'medium',
                occasion: 'birthday',
                brand: '',
                description: '',
                size: '',
                color: '',
              });
              setImagePreview(null);
            }
          }
        ]
      );
    }, 1500);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.gradientHeader}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>🎁 Nouveau Cadeau</Text>
          <Text style={styles.headerSubtitle}>Ajoutez à votre wishlist</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Ionicons 
              name={isLoading ? "hourglass" : "checkmark"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderImageSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📸 Photo du produit</Text>
      
      {imagePreview ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={() => {
              setImagePreview(null);
              setFormData(prev => ({ ...prev, imageUrl: '' }));
            }}
          >
            <Ionicons name="close-circle" size={24} color="#ff4757" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.imagePlaceholder}>
          <LinearGradient
            colors={['#f8f9ff', '#e8edff']}
            style={styles.imagePlaceholderGradient}
          >
            <Ionicons name="camera" size={40} color="#667eea" />
            <Text style={styles.imagePlaceholderText}>Ajouter une photo</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="URL de l'image ou lien produit"
        value={formData.imageUrl}
        onChangeText={(value) => handleInputChange('imageUrl', value)}
        placeholderTextColor="#a1a9b8"
        autoCapitalize="none"
      />
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>✨ Informations de base</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nom du produit *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: iPhone 15 Pro, Sac Chanel..."
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          placeholderTextColor="#a1a9b8"
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Prix *</Text>
          <TextInput
            style={styles.input}
            placeholder="299.99"
            value={formData.price}
            onChangeText={(value) => handleInputChange('price', value)}
            keyboardType="numeric"
            placeholderTextColor="#a1a9b8"
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>Marque</Text>
          <TextInput
            style={styles.input}
            placeholder="Apple, Nike..."
            value={formData.brand}
            onChangeText={(value) => handleInputChange('brand', value)}
            placeholderTextColor="#a1a9b8"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Lien du produit</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          value={formData.link}
          onChangeText={(value) => handleInputChange('link', value)}
          placeholderTextColor="#a1a9b8"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderCategorySelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏷️ Catégorie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.optionCard,
              formData.category === category.id && styles.optionCardActive,
              { borderColor: category.color }
            ]}
            onPress={() => handleInputChange('category', category.id)}
          >
            <LinearGradient
              colors={formData.category === category.id ? [category.color, category.color] : ['#f8f9ff', '#ffffff']}
              style={styles.optionCardGradient}
            >
              <Ionicons 
                name={category.icon} 
                size={24} 
                color={formData.category === category.id ? 'white' : category.color} 
              />
              <Text style={[
                styles.optionCardText,
                formData.category === category.id && { color: 'white' }
              ]}>
                {category.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPrioritySelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⭐ Priorité</Text>
      <View style={styles.priorityContainer}>
        {priorities.map(priority => (
          <TouchableOpacity
            key={priority.id}
            style={[
              styles.priorityCard,
              formData.priority === priority.id && [styles.priorityCardActive, { borderColor: priority.color }]
            ]}
            onPress={() => handleInputChange('priority', priority.id)}
          >
            <View style={[styles.priorityIcon, { backgroundColor: priority.color }]}>
              <Ionicons name={priority.icon} size={16} color="white" />
            </View>
            <View style={styles.priorityContent}>
              <Text style={[
                styles.priorityName,
                formData.priority === priority.id && { color: priority.color }
              ]}>
                {priority.name}
              </Text>
              <Text style={styles.priorityDescription}>{priority.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOccasionSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎉 Occasion</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
        {occasions.map(occasion => (
          <TouchableOpacity
            key={occasion.id}
            style={[
              styles.occasionCard,
              formData.occasion === occasion.id && styles.occasionCardActive
            ]}
            onPress={() => handleInputChange('occasion', occasion.id)}
          >
            <Text style={styles.occasionEmoji}>{occasion.emoji}</Text>
            <Text style={[
              styles.occasionText,
              formData.occasion === occasion.id && styles.occasionTextActive
            ]}>
              {occasion.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAdditionalInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📝 Détails supplémentaires</Text>
      
      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Taille</Text>
          <TextInput
            style={styles.input}
            placeholder="M, 42, XL..."
            value={formData.size}
            onChangeText={(value) => handleInputChange('size', value)}
            placeholderTextColor="#a1a9b8"
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>Couleur</Text>
          <TextInput
            style={styles.input}
            placeholder="Noir, Rouge..."
            value={formData.color}
            onChangeText={(value) => handleInputChange('color', value)}
            placeholderTextColor="#a1a9b8"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description / Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Pourquoi vous voulez ce produit, détails importants..."
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
          numberOfLines={4}
          placeholderTextColor="#a1a9b8"
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.saveButtonGradient}
        >
          {isLoading ? (
            <Ionicons name="hourglass" size={20} color="white" />
          ) : (
            <Ionicons name="gift" size={20} color="white" />
          )}
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Ajout...' : 'Ajouter à ma liste'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderImageSection()}
          {renderBasicInfo()}
          {renderCategorySelection()}
          {renderPrioritySelection()}
          {renderOccasionSelection()}
          {renderAdditionalInfo()}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
        
        {renderActionButtons()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7ff',
  },
  keyboardView: {
    flex: 1,
  },
  gradientHeader: {
    paddingBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerRight: {
    marginLeft: 15,
  },
  headerIcon: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  imagePlaceholder: {
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePlaceholderGradient: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d4deff',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#667eea',
    marginTop: 8,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e8edff',
    color: '#1e293b',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionsScroll: {
    marginTop: 8,
  },
  optionCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e8edff',
  },
  optionCardActive: {
    borderWidth: 2,
  },
  optionCardGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  optionCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    marginTop: 4,
    textAlign: 'center',
  },
  priorityContainer: {
    gap: 12,
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e8edff',
  },
  priorityCardActive: {
    borderWidth: 2,
    backgroundColor: '#f8f9ff',
  },
  priorityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityContent: {
    flex: 1,
  },
  priorityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  priorityDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  occasionCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e8edff',
    minWidth: 80,
  },
  occasionCardActive: {
    backgroundColor: '#f8f9ff',
    borderColor: '#667eea',
  },
  occasionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  occasionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  occasionTextActive: {
    color: '#667eea',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e8edff',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  saveButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default AddWishlistItemScreen;