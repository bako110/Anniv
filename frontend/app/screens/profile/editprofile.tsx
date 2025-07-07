import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import EditeprofileStyles from '../../../styles/editprofile';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService } from '../../../services/profile';

const { width } = Dimensions.get('window');

// Avatars par défaut
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=150';
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop';

const BASE_URL = 'http://192.168.11.123:8000'; 

const EditProfileScreen = ({ route }) => {
  // États principaux
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    birthDate: '',
    bio: '',
    location: '',
    website: '',
    title: '',
    company: '',
    experience: '',
    education: '',
  });

  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [coverPhoto, setCoverPhoto] = useState(DEFAULT_COVER);
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // États de chargement
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  useEffect(() => {
    initializeProfile();
  }, []);

  const initializeProfile = async () => {
    try {
      await setupPermissions();
      await loadUserProfile();
    } catch (error) {
      console.error('Erreur initialisation:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger le profil. Vérifiez votre connexion.',
        [
          { text: 'Réessayer', onPress: initializeProfile },
          { text: 'Retour', onPress: () => router.back() }
        ]
      );
    }
  };

  const getUserIdentifier = async () => {
    try {
      const identifier = await AsyncStorage.getItem('userIdentifier');
      if (identifier) {
        return identifier;
      } else {
        throw new Error('Identifiant utilisateur introuvable. Veuillez vous reconnecter.');
      }
    } catch (error) {
      console.error('Erreur récupération identifiant:', error);
      throw error;
    }
  };

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);

      const identifier = await getUserIdentifier();
      const cachedProfile = await loadFromCache();

      if (cachedProfile) {
        populateProfileData(cachedProfile);
      }

      try {
        const profileData = await profileService.getProfile(identifier);
        if (profileData) {
          await saveToCache(profileData);
          populateProfileData(profileData);
        }
      } catch (apiError) {
        console.error('Erreur API profileService.getProfile:', apiError);

        if (!cachedProfile) {
          if (apiError.status === 404) {
            if (identifier.includes('@')) {
              setProfile(prev => ({ ...prev, email: identifier }));
            } else {
              setProfile(prev => ({ ...prev, phone: identifier }));
            }
          } else {
            throw apiError;
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromCache = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('userProfile');
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Erreur cache:', error);
      return null;
    }
  };

  const saveToCache = async (profileData) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
    } catch (error) {
      console.error('Erreur sauvegarde cache:', error);
    }
  };

  const populateProfileData = (profileData) => {
    if (!profileData) return;

    const fullName = profileData.first_name && profileData.last_name
      ? `${profileData.first_name} ${profileData.last_name}`.trim()
      : profileData.name || '';

    setProfile({
      name: fullName,
      username: profileData.username || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      birthDate: profileData.birth_date || '',
      bio: profileData.bio || '',
      location: profileData.location || '',
      website: profileData.website || '',
      title: profileData.title || '',
      company: profileData.company || '',
      experience: profileData.experience || '',
      education: profileData.education || '',
    });

    if (Array.isArray(profileData.interests)) {
      setInterests(profileData.interests);
    }

    if (Array.isArray(profileData.skills)) {
      setSkills(profileData.skills);
    }

    if (profileData.avatar_url && !profileData.avatar_url.includes('ui-avatars.com')) {
      // Ajout cache busting
      const avatarUrl = profileData.avatar_url.startsWith('http')
        ? profileData.avatar_url
        : `${BASE_URL}${profileData.avatar_url}`;
      setAvatar(`${avatarUrl}?t=${Date.now()}`);
    } else {
      const userName = fullName || profileData.username || 'User';
      setAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=667eea&color=fff&size=150`);
    }

    if (profileData.coverPhoto) {
      const coverUrl = profileData.coverPhoto.startsWith('http')
        ? profileData.coverPhoto
        : `${BASE_URL}${profileData.coverPhoto}`;
      setCoverPhoto(`${coverUrl}?t=${Date.now()}`);
    } else {
      setCoverPhoto(DEFAULT_COVER);
    }
  };

  const setupPermissions = async () => {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();
    } catch (error) {
      console.error('Erreur permissions:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Permission de localisation",
            message: "Cette application a besoin d'accéder à votre position.",
            buttonNeutral: "Plus tard",
            buttonNegative: "Annuler",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.warn('Erreur permission localisation:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);

    try {
      const hasPermission = await requestLocationPermission();

      if (hasPermission) {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setProfile(prev => ({
              ...prev,
              location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }));
            setIsLoadingLocation(false);
          },
          (error) => {
            console.error('Erreur géolocalisation:', error);
            Alert.alert("Erreur", "Impossible de récupérer votre position.");
            setIsLoadingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000
          }
        );
      } else {
        setIsLoadingLocation(false);
      }
    } catch (error) {
      console.error('Erreur getCurrentLocation:', error);
      setIsLoadingLocation(false);
    }
  };

  const pickImage = async (type) => {
    try {
      Alert.alert(
        'Sélectionner une photo',
        'Choisissez la source de votre photo',
        [
          { text: 'Galerie', onPress: () => openImagePicker(type, 'gallery') },
          { text: 'Caméra', onPress: () => openImagePicker(type, 'camera') },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Erreur pickImage:', error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image.");
    }
  };

  const openImagePicker = async (type, source) => {
    try {
      let result;

      const options = {
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [4, 2],
        quality: 0.8,
      };

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          ...options,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
      }

      if (!result.canceled && result.assets?.length > 0) {
        const imageUri = result.assets[0].uri;
        await processSelectedImage(imageUri, type);
      }
    } catch (error) {
      console.error("Erreur sélection image:", error);
      Alert.alert("Erreur", "Impossible de traiter l'image sélectionnée.");
    }
  };

  const processSelectedImage = async (imageUri, type) => {
    try {
      if (type === 'avatar') {
        setIsUploadingAvatar(true);
        setAvatar(imageUri);
      } else {
        setIsUploadingCover(true);
        setCoverPhoto(imageUri);
      }

      const uploadedData = await uploadImage(imageUri, type);
      console.log('Upload result:', uploadedData); // DEBUG important

      if (uploadedData) {
        if (type === 'avatar') {
          const avatarUrl = uploadedData.avatar_url || uploadedData.url;
          if (avatarUrl) {
            const fullAvatarUrl = avatarUrl.startsWith('http') ? avatarUrl : `${BASE_URL}${avatarUrl}`;
            setAvatar(`${fullAvatarUrl}?t=${Date.now()}`); // cache busting
          } else {
            console.warn('avatarUrl est vide ou non défini dans la réponse');
          }
        } else {
          const coverUrl = uploadedData.coverPhoto || uploadedData.cover_photo_url || uploadedData.url;
          if (coverUrl) {
            const fullCoverUrl = coverUrl.startsWith('http') ? coverUrl : `${BASE_URL}${coverUrl}`;
            setCoverPhoto(`${fullCoverUrl}?t=${Date.now()}`);
          } else {
            console.warn('coverUrl est vide ou non défini dans la réponse');
          }
        }

        Alert.alert('Succès', 'Image mise à jour avec succès !');

        if (uploadedData.profile) {
          await saveToCache(uploadedData.profile);
        }
      }
    } catch (error) {
      console.error(`Erreur traitement ${type}:`, error);
      Alert.alert('Erreur', `Impossible de mettre à jour l'image: ${error.message}`);

      const cachedProfile = await loadFromCache();
      if (cachedProfile) {
        if (type === 'avatar') {
          const avatarUrl = cachedProfile.avatar_url || DEFAULT_AVATAR;
          setAvatar(avatarUrl.includes('http') ? avatarUrl : `${BASE_URL}${avatarUrl}`);
        } else {
          const coverUrl = cachedProfile.coverPhoto || DEFAULT_COVER;
          setCoverPhoto(coverUrl.includes('http') ? coverUrl : `${BASE_URL}${coverUrl}`);
        }
      }
    } finally {
      if (type === 'avatar') {
        setIsUploadingAvatar(false);
      } else {
        setIsUploadingCover(false);
      }
    }
  };

  const uploadImage = async (uri, type) => {
    try {
      if (!uri) throw new Error('URI invalide');

      const identifier = await getUserIdentifier();
      const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

      const file = {
        uri: uri,
        name: `${type}_${Date.now()}.${fileExtension}`,
        type: mimeType,
      };

      if (type === 'avatar') {
        return await profileService.uploadAvatar(identifier, file);
      } else {
        return await profileService.uploadCoverPhoto(identifier, file);
      }
    } catch (error) {
      console.error("Erreur upload:", error);

      if (error.message.includes('Network request failed')) {
        throw new Error('Problème de connexion réseau.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Upload trop long. Réessayez avec une image plus petite.');
      } else {
        throw new Error(`Erreur upload: ${error.message}`);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true); // On bloque l'interface pendant la sauvegarde
    try {
      // Validation du nom complet (champ obligatoire)
      if (!profile.name.trim()) {
        throw new Error('Le nom est obligatoire.');
      }

      // Récupération de l'identifiant utilisateur (email ou téléphone)
      const identifier = await getUserIdentifier();

      // Validation selon type d'identifiant
      if (identifier.includes('@') && !profile.email.trim()) {
        throw new Error("L'email est obligatoire.");
      }
      if (!identifier.includes('@') && !profile.phone.trim()) {
        throw new Error('Le téléphone est obligatoire.');
      }

      // Préparation des valeurs email et téléphone à envoyer (respect du backend)
      const emailToUse = identifier.includes('@') ? identifier : profile.email.trim();
      const phoneToUse = !identifier.includes('@') ? identifier : profile.phone.trim();

      // Découpage du nom complet en prénom + nom
      const nameParts = profile.name.trim().split(' ');

      // Construction de l'objet à envoyer au serveur
      const updateData = {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: emailToUse,
        phone: phoneToUse,
        username: profile.username.trim(),
        birthDate: profile.birthDate || null,
        bio: profile.bio.trim(),
        location: profile.location.trim(),
        website: profile.website.trim(),
        title: profile.title.trim(),
        company: profile.company.trim(),
        experience: profile.experience.trim(),  // singulier, chaîne
        education: profile.education.trim(),    // singulier, chaîne
        skills: skills,
        interests: interests,
      };

      // Suppression des champs vides sauf email et téléphone (qui sont obligatoires)
      Object.keys(updateData).forEach(key => {
        if (!updateData[key] && !['email', 'phone'].includes(key)) {
          delete updateData[key];
        }
      });

      // Appel API pour mettre à jour le profil
      const updatedProfile = await profileService.updateProfile(identifier, updateData);

      // Sauvegarde en cache local
      await saveToCache(updatedProfile);

      // Mise à jour des infos utilisateur dans AsyncStorage
      await updateUserInfo(updatedProfile);

      // Confirmation utilisateur et retour à l'écran précédent
      Alert.alert(
        'Succès',
        'Profil mis à jour avec succès !',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (error) {
      // Affichage de l’erreur si échec
      console.error('Erreur sauvegarde:', error);
      Alert.alert('Erreur', error.message || 'Échec de la mise à jour du profil');
    } finally {
      setIsSaving(false); // Débloque l’interface
    }
  };

  const updateUserInfo = async (updatedProfile) => {
    try {
      const userInfoString = await AsyncStorage.getItem('userInfo');
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        const updatedUserInfo = {
          ...userInfo,
          name: `${updatedProfile.first_name} ${updatedProfile.last_name}`.trim(),
          username: updatedProfile.username,
          avatar_url: updatedProfile.avatar_url,
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      }
    } catch (error) {
      console.error('Erreur mise à jour userInfo:', error);
    }
  };

  const addInterest = () => {
    const trimmedInterest = newInterest.trim();
    if (trimmedInterest && !interests.includes(trimmedInterest)) {
      setInterests([...interests, trimmedInterest]);
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const addSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setProfile({
        ...profile,
        birthDate: selectedDate.toISOString().split('T')[0]
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={EditeprofileStyles.container}>
        <View style={EditeprofileStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={EditeprofileStyles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={EditeprofileStyles.container}>
      <ScrollView contentContainerStyle={EditeprofileStyles.scrollContainer}>
        {/* Header avec photo de couverture */}
        <View style={EditeprofileStyles.coverContainer}>
          <Image source={{ uri: coverPhoto }} style={EditeprofileStyles.coverPhoto} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={EditeprofileStyles.coverGradient}
          />
          <TouchableOpacity
            style={EditeprofileStyles.changeCoverButton}
            onPress={() => pickImage('cover')}
            disabled={isUploadingCover}
          >
            {isUploadingCover ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="camera" size={20} color="white" />
            )}
            <Text style={EditeprofileStyles.changeCoverText}>
              {isUploadingCover ? 'Upload...' : 'Changer'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={EditeprofileStyles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Section Avatar */}
        <View style={EditeprofileStyles.avatarSection}>
          <View style={EditeprofileStyles.avatarContainer}>
            <Image source={{ uri: avatar }} style={EditeprofileStyles.avatar} />
            <TouchableOpacity
              style={EditeprofileStyles.changeAvatarButton}
              onPress={() => pickImage('avatar')}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Formulaire d'édition */}
        <View style={EditeprofileStyles.formContainer}>
          {/* Nom complet */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Nom complet *</Text>
            <TextInput
              style={EditeprofileStyles.input}
              value={profile.name}
              onChangeText={(text) => setProfile({...profile, name: text})}
              placeholder="Votre nom"
            />
          </View>

          {/* Pseudo */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Pseudo</Text>
            <TextInput
              style={EditeprofileStyles.input}
              value={profile.username}
              onChangeText={(text) => setProfile({...profile, username: text})}
              placeholder="Votre pseudo"
            />
          </View>

          {/* Email (lecture seule) */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Email *</Text>
            <View style={EditeprofileStyles.inputWithIcon}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={EditeprofileStyles.inputIcon} />
              <TextInput
                style={[EditeprofileStyles.input, EditeprofileStyles.iconInput, EditeprofileStyles.disabledInput]}
                value={profile.email}
                placeholder="Votre email"
                editable={false}
              />
            </View>
          </View>

          {/* Téléphone */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Téléphone</Text>
            <View style={EditeprofileStyles.inputWithIcon}>
              <Ionicons name="call-outline" size={20} color="#64748b" style={EditeprofileStyles.inputIcon} />
              <TextInput
                style={[EditeprofileStyles.input, EditeprofileStyles.iconInput]}
                value={profile.phone}
                onChangeText={(text) => setProfile({...profile, phone: text})}
                placeholder="Votre numéro"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Date de naissance */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Date de naissance</Text>
            <TouchableOpacity
              style={EditeprofileStyles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={EditeprofileStyles.dateInputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                <Text style={EditeprofileStyles.dateText}>
                  {profile.birthDate || 'Sélectionner une date'}
                </Text>
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={profile.birthDate ? new Date(profile.birthDate) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Bio */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Bio</Text>
            <TextInput
              style={[EditeprofileStyles.input, EditeprofileStyles.bioInput]}
              value={profile.bio}
              onChangeText={(text) => setProfile({...profile, bio: text})}
              placeholder="Décrivez-vous..."
              multiline
              numberOfLines={3}
              maxLength={150}
            />
            <Text style={EditeprofileStyles.charCount}>{profile.bio.length}/150</Text>
          </View>

          {/* Localisation */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Localisation</Text>
            <View style={EditeprofileStyles.inputWithIcon}>
              <Ionicons name="location-outline" size={20} color="#64748b" style={EditeprofileStyles.inputIcon} />
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[EditeprofileStyles.input, EditeprofileStyles.iconInput, { flex: 1 }]}
                  value={profile.location}
                  onChangeText={(text) => setProfile({...profile, location: text})}
                  placeholder={isLoadingLocation ? "Récupération..." : "Où êtes-vous ?"}
                />
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  style={{ marginLeft: 10 }}
                  disabled={isLoadingLocation}
                >
                  <Ionicons
                    name={isLoadingLocation ? "hourglass-outline" : "refresh"}
                    size={20}
                    color="#667eea"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Site web */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Site web</Text>
            <View style={EditeprofileStyles.inputWithIcon}>
              <Ionicons name="link-outline" size={20} color="#64748b" style={EditeprofileStyles.inputIcon} />
              <TextInput
                style={[EditeprofileStyles.input, EditeprofileStyles.iconInput]}
                value={profile.website}
                onChangeText={(text) => setProfile({ ...profile, website: text })}
                placeholder="Votre site web"
                keyboardType="url"
              />
            </View>
          </View>

          {/* Titre du profil */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Titre</Text>
            <TextInput
              style={EditeprofileStyles.input}
              value={profile.title}
              onChangeText={(text) => setProfile({ ...profile, title: text })}
              placeholder="Ex: Développeur Mobile"
            />
          </View>

          {/* Entreprise actuelle */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Entreprise actuelle</Text>
            <TextInput
              style={EditeprofileStyles.input}
              value={profile.company}
              onChangeText={(text) => setProfile({ ...profile, company: text })}
              placeholder="Ex: Google, Freelance, etc."
            />
          </View>

          {/* Expériences */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Expériences</Text>
            <TextInput
              style={[EditeprofileStyles.input, { height: 100, textAlignVertical: 'top' }]}
              value={profile.experience}
              onChangeText={(text) => setProfile({ ...profile, experience: text })}
              placeholder="Résumé de vos expériences"
              multiline
            />
          </View>

          {/* Formations */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Formations</Text>
            <TextInput
              style={[EditeprofileStyles.input, { height: 80, textAlignVertical: 'top' }]}
              value={profile.education}
              onChangeText={(text) => setProfile({ ...profile, education: text })}
              placeholder="Vos diplômes, écoles, etc."
              multiline
            />
          </View>

          {/* Compétences */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Compétences</Text>
            <View style={EditeprofileStyles.interestsContainer}>
              {skills.map((skill, index) => (
                <View key={index} style={EditeprofileStyles.interestTag}>
                  <Text style={EditeprofileStyles.interestText}>{skill}</Text>
                  <TouchableOpacity onPress={() => removeSkill(skill)}>
                    <Ionicons name="close" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={EditeprofileStyles.addInterestContainer}>
              <TextInput
                style={[EditeprofileStyles.input, EditeprofileStyles.interestInput]}
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder="Ajouter une compétence"
                onSubmitEditing={addSkill}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={EditeprofileStyles.addInterestButton}
                onPress={addSkill}
                disabled={!newSkill.trim()}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={newSkill.trim() ? "#667eea" : "#cbd5e1"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Centres d'intérêt */}
          <View style={EditeprofileStyles.inputContainer}>
            <Text style={EditeprofileStyles.inputLabel}>Centres d'intérêt</Text>
            <View style={EditeprofileStyles.interestsContainer}>
              {interests.map((interest, index) => (
                <View key={index} style={EditeprofileStyles.interestTag}>
                  <Text style={EditeprofileStyles.interestText}>{interest}</Text>
                  <TouchableOpacity onPress={() => removeInterest(interest)}>
                    <Ionicons name="close" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={EditeprofileStyles.addInterestContainer}>
              <TextInput
                style={[EditeprofileStyles.input, EditeprofileStyles.interestInput]}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Ajouter un centre d'intérêt"
                onSubmitEditing={addInterest}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={EditeprofileStyles.addInterestButton}
                onPress={addInterest}
                disabled={!newInterest.trim()}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={newInterest.trim() ? "#667eea" : "#cbd5e1"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Boutons d'action */}
      <View style={EditeprofileStyles.actionButtons}>
        <TouchableOpacity
          style={EditeprofileStyles.cancelButton}
          onPress={() => router.back()}
          disabled={isSaving}
        >
          <Text style={EditeprofileStyles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[EditeprofileStyles.saveButton, isSaving && EditeprofileStyles.disabledButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={EditeprofileStyles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
