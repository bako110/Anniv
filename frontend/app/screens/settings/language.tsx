import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const languages = [
  { code: 'fr', name: 'Français', nativeName: 'Français' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

const LanguageScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  const handleBack = () => {
    router.back();
  };

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
    // Ici vous pourriez ajouter la logique pour changer la langue de l'application
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Langue</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderLanguageItem = (language) => (
    <TouchableOpacity
      key={language.code}
      style={styles.languageItem}
      onPress={() => handleLanguageSelect(language.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.languageName}>{language.name}</Text>
        <Text style={styles.languageNative}>{language.nativeName}</Text>
      </View>
      
      {selectedLanguage === language.code ? (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color="#667eea" />
        </View>
      ) : (
        <View style={styles.unselectedIndicator}>
          <View style={styles.emptyCircle} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Langues disponibles</Text>
          <Text style={styles.sectionSubtitle}>
            Sélectionnez votre langue préférée pour l'application
          </Text>
        </View>
        
        <View style={styles.languagesContainer}>
          {languages.map(renderLanguageItem)}
        </View>
        
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.applyButtonContainer}
        >
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => {
              // Logique pour appliquer la langue sélectionnée
              router.back();
            }}
          >
            <Text style={styles.applyButtonText}>Appliquer les changements</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  languagesContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  languageNative: {
    fontSize: 14,
    color: '#64748b',
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  unselectedIndicator: {
    marginLeft: 10,
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  applyButtonContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  applyButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default LanguageScreen;