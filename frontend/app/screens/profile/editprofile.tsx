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
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const EditProfileScreen = () => {
  const [profile, setProfile] = useState({
    name: 'Alex Dubois',
    username: '@alexdubois',
    email: 'alex.dubois@example.com',
    phone: '+33 6 12 34 56 78',
    birthDate: '1990-05-15',
    bio: 'Passionné d\'aventures et de moments partagés 🌟 Organisateur d\'événements inoubliables',
    location: '', // Laissé vide initialement
    website: 'alexdubois.com',
  });

  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face');
  const [coverPhoto, setCoverPhoto] = useState('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop');
  const [interests, setInterests] = useState(['Voyage', 'Photographie', 'Cuisine', 'Musique', 'Sport', 'Art']);
  const [newInterest, setNewInterest] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    // Récupérer la localisation au chargement du composant
    getCurrentLocation();
    // Demander les permissions pour la galerie
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos.');
      }
    })();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Autorisation de localisation",
            message: "Cette application a besoin d'accéder à votre position.",
            buttonNeutral: "Demander plus tard",
            buttonNegative: "Annuler",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          Alert.alert("Permission refusée", "Vous avez refusé l'accès à votre position.");
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    const hasPermission = await requestLocationPermission();
    
    if (hasPermission) {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setProfile(prev => ({
            ...prev,
            location: `Position: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
          setIsLoadingLocation(false);
        },
        (error) => {
          Alert.alert("Erreur", "Impossible de récupérer votre position.");
          console.log(error.code, error.message);
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setIsLoadingLocation(false);
    }
  };

  const pickImage = async (type) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [4, 2],
        quality: 1,
      });

      if (!result.canceled) {
        if (type === 'avatar') {
          setAvatar(result.assets[0].uri);
        } else {
          setCoverPhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite lors de la sélection de l'image.");
      console.error(error);
    }
  };

  const handleSave = () => {
    Alert.alert('Profil mis à jour', 'Vos modifications ont été enregistrées avec succès !');
    router.back();
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setProfile({...profile, birthDate: selectedDate.toISOString().split('T')[0]});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header avec photo de couverture */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.coverGradient}
          />
          <TouchableOpacity 
            style={styles.changeCoverButton}
            onPress={() => pickImage('cover')}
          >
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.changeCoverText}>Changer la photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Section Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <TouchableOpacity 
              style={styles.changeAvatarButton}
              onPress={() => pickImage('avatar')}
            >
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulaire d'édition */}
        <View style={styles.formContainer}>
          {/* Champ Nom */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nom complet</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile({...profile, name: text})}
              placeholder="Votre nom"
            />
          </View>

          {/* Champ Pseudo */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Pseudo</Text>
            <TextInput
              style={styles.input}
              value={profile.username}
              onChangeText={(text) => setProfile({...profile, username: text})}
              placeholder="Votre pseudo"
            />
          </View>

          {/* Champ Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.iconInput]}
                value={profile.email}
                onChangeText={(text) => setProfile({...profile, email: text})}
                placeholder="Votre email"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Champ Téléphone */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Téléphone</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.iconInput]}
                value={profile.phone}
                onChangeText={(text) => setProfile({...profile, phone: text})}
                placeholder="Votre numéro"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Champ Date de naissance */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date de naissance</Text>
            <TouchableOpacity 
              style={styles.input} 
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateInputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                <Text style={styles.dateText}>{profile.birthDate}</Text>
              </View>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={new Date(profile.birthDate)}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Champ Bio */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={profile.bio}
              onChangeText={(text) => setProfile({...profile, bio: text})}
              placeholder="Décrivez-vous en quelques mots..."
              multiline
              numberOfLines={3}
            />
            <Text style={styles.charCount}>{profile.bio.length}/150</Text>
          </View>

          {/* Champ Localisation */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Localisation</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="location-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, styles.iconInput, { flex: 1 }]}
                  value={profile.location}
                  onChangeText={(text) => setProfile({...profile, location: text})}
                  placeholder={isLoadingLocation ? "Récupération de votre position..." : "Où êtes-vous ?"}
                />
                <TouchableOpacity 
                  onPress={getCurrentLocation}
                  style={{ marginLeft: 10 }}
                >
                  <Ionicons name="refresh" size={20} color="#667eea" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Champ Site web */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Site web</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="link-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.iconInput]}
                value={profile.website}
                onChangeText={(text) => setProfile({...profile, website: text})}
                placeholder="Votre site web"
                keyboardType="url"
              />
            </View>
          </View>

          {/* Centres d'intérêt */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Centres d'intérêt</Text>
            <View style={styles.interestsContainer}>
              {interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                  <TouchableOpacity onPress={() => removeInterest(interest)}>
                    <Ionicons name="close" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addInterestContainer}>
              <TextInput
                style={[styles.input, styles.interestInput]}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Ajouter un centre d'intérêt"
                onSubmitEditing={addInterest}
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={styles.addInterestButton} 
                onPress={addInterest}
                disabled={!newInterest.trim()}
              >
                <Ionicons name="add" size={24} color={newInterest.trim() ? "#667eea" : "#cbd5e1"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Boutons d'action */}
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
        >
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  coverContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  changeCoverButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
  },
  changeCoverText: {
    color: 'white',
    fontSize: 14,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#667eea',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  iconInput: {
    paddingLeft: 45,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 5,
  },
  interestText: {
    fontSize: 14,
    color: '#475569',
  },
  addInterestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  interestInput: {
    flex: 1,
  },
  addInterestButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    flex: 1,
    marginLeft: 10,
  },
});

export default EditProfileScreen;