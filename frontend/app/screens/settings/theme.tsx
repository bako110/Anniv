import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ThemeScreen = () => {
  const [selectedTheme, setSelectedTheme] = useState('purple'); // Thème par défaut
  const [selectedAccent, setSelectedAccent] = useState('amber');

  const themes = [
    {
      id: 'purple',
      name: 'Violet Mystique',
      description: 'Élégant et moderne',
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      gradient: ['#8b5cf6', '#7c3aed'],
      icon: 'diamond',
    },
    {
      id: 'blue',
      name: 'Océan Profond',
      description: 'Apaisant et professionnel',
      primary: '#3b82f6',
      secondary: '#60a5fa',
      gradient: ['#3b82f6', '#1d4ed8'],
      icon: 'water',
    },
    {
      id: 'green',
      name: 'Nature Zen',
      description: 'Frais et énergisant',
      primary: '#10b981',
      secondary: '#34d399',
      gradient: ['#10b981', '#059669'],
      icon: 'leaf',
    },
    {
      id: 'pink',
      name: 'Rose Bonbon',
      description: 'Doux et romantique',
      primary: '#ec4899',
      secondary: '#f472b6',
      gradient: ['#ec4899', '#db2777'],
      icon: 'heart',
    },
    {
      id: 'orange',
      name: 'Coucher de Soleil',
      description: 'Chaleureux et vivant',
      primary: '#f97316',
      secondary: '#fb923c',
      gradient: ['#f97316', '#ea580c'],
      icon: 'sunny',
    },
    {
      id: 'teal',
      name: 'Turquoise Moderne',
      description: 'Équilibré et raffiné',
      primary: '#0d9488',
      secondary: '#14b8a6',
      gradient: ['#0d9488', '#0f766e'],
      icon: 'prism',
    },
  ];

  const accentColors = [
    { id: 'amber', name: 'Ambre', color: '#f59e0b', icon: 'star' },
    { id: 'red', name: 'Rouge', color: '#ef4444', icon: 'flame' },
    { id: 'emerald', name: 'Émeraude', color: '#10b981', icon: 'diamond' },
    { id: 'cyan', name: 'Cyan', color: '#06b6d4', icon: 'water' },
    { id: 'violet', name: 'Violet', color: '#8b5cf6', icon: 'sparkles' },
    { id: 'rose', name: 'Rose', color: '#f43f5e', icon: 'heart-circle' },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSaveTheme = () => {
    Alert.alert(
      '🎨 Thème appliqué !',
      `Votre nouveau thème "${themes.find(t => t.id === selectedTheme)?.name}" a été sauvegardé avec succès.`,
      [{ text: 'Parfait !', style: 'default' }]
    );
  };

  const handleResetTheme = () => {
    Alert.alert(
      'Réinitialiser le thème',
      'Voulez-vous revenir au thème par défaut ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'default',
          onPress: () => {
            setSelectedTheme('purple');
            setSelectedAccent('amber');
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Thème et couleurs</Text>
      <TouchableOpacity onPress={handleResetTheme} style={styles.resetButton}>
        <Ionicons name="refresh" size={20} color="#64748b" />
      </TouchableOpacity>
    </View>
  );

  const renderPreview = () => {
    const currentTheme = themes.find(t => t.id === selectedTheme);
    const currentAccent = accentColors.find(a => a.id === selectedAccent);

    return (
      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>🎨 Aperçu</Text>
        <View style={styles.previewContainer}>
          <LinearGradient
            colors={currentTheme.gradient}
            style={styles.previewGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.previewContent}>
              <View style={styles.previewHeader}>
                <View style={[styles.previewIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name={currentTheme.icon} size={24} color="white" />
                </View>
                <View style={styles.previewTexts}>
                  <Text style={styles.previewTitle}>CelebConnect</Text>
                  <Text style={styles.previewSubtitle}>Votre nouvelle apparence</Text>
                </View>
                <View style={[styles.previewAccent, { backgroundColor: currentAccent.color }]}>
                  <Ionicons name={currentAccent.icon} size={16} color="white" />
                </View>
              </View>
              
              <View style={styles.previewCards}>
                <View style={styles.previewCard}>
                  <View style={[styles.previewCardIcon, { backgroundColor: currentAccent.color }]}>
                    <Ionicons name="gift" size={16} color="white" />
                  </View>
                  <Text style={styles.previewCardText}>Anniversaire</Text>
                </View>
                <View style={styles.previewCard}>
                  <View style={[styles.previewCardIcon, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                    <Ionicons name="calendar" size={16} color="white" />
                  </View>
                  <Text style={styles.previewCardText}>Événement</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderThemeSelection = () => (
    <View style={styles.themeSection}>
      <Text style={styles.sectionTitle}>🌈 Thèmes principaux</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.themesContainer}
      >
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeCard,
              selectedTheme === theme.id && styles.selectedThemeCard
            ]}
            onPress={() => setSelectedTheme(theme.id)}
          >
            <LinearGradient
              colors={theme.gradient}
              style={styles.themeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.themeIconContainer}>
                <Ionicons name={theme.icon} size={24} color="white" />
              </View>
              {selectedTheme === theme.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                </View>
              )}
            </LinearGradient>
            <Text style={styles.themeName}>{theme.name}</Text>
            <Text style={styles.themeDescription}>{theme.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAccentColors = () => (
    <View style={styles.accentSection}>
      <Text style={styles.sectionTitle}>✨ Couleurs d'accent</Text>
      <View style={styles.accentGrid}>
        {accentColors.map((accent) => (
          <TouchableOpacity
            key={accent.id}
            style={[
              styles.accentCard,
              selectedAccent === accent.id && styles.selectedAccentCard
            ]}
            onPress={() => setSelectedAccent(accent.id)}
          >
            <View style={[styles.accentColor, { backgroundColor: accent.color }]}>
              <Ionicons name={accent.icon} size={20} color="white" />
              {selectedAccent === accent.id && (
                <View style={styles.accentSelected}>
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </View>
            <Text style={styles.accentName}>{accent.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOptions = () => (
    <View style={styles.optionsSection}>
      <Text style={styles.sectionTitle}>⚙️ Options avancées</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: '#6366f1' }]}>
              <Ionicons name="contrast" size={20} color="white" />
            </View>
            <View>
              <Text style={styles.optionTitle}>Contraste élevé</Text>
              <Text style={styles.optionSubtitle}>Améliore la lisibilité</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="phone-portrait" size={20} color="white" />
            </View>
            <View>
              <Text style={styles.optionTitle}>Animations</Text>
              <Text style={styles.optionSubtitle}>Effets de transition</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionItem, styles.lastOption]}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: '#06b6d4' }]}>
              <Ionicons name="text" size={20} color="white" />
            </View>
            <View>
              <Text style={styles.optionTitle}>Taille de police</Text>
              <Text style={styles.optionSubtitle}>Normale</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSaveButton = () => {
    const currentTheme = themes.find(t => t.id === selectedTheme);
    
    return (
      <View style={styles.saveSection}>
        <TouchableOpacity onPress={handleSaveTheme}>
          <LinearGradient
            colors={currentTheme.gradient}
            style={styles.saveButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.saveButtonText}>Appliquer le thème</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderPreview()}
        {renderThemeSelection()}
        {renderAccentColors()}
        {renderOptions()}
        {renderSaveButton()}
        
        <View style={{ height: 30 }} />
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
  resetButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  
  // Preview Section
  previewSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  previewContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  previewGradient: {
    padding: 20,
  },
  previewContent: {
    gap: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTexts: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  previewSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  previewAccent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCards: {
    flexDirection: 'row',
    gap: 12,
  },
  previewCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  previewCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCardText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },

  // Theme Selection
  themeSection: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  themesContainer: {
    paddingRight: 20,
  },
  themeCard: {
    width: 120,
    marginRight: 16,
    alignItems: 'center',
  },
  selectedThemeCard: {
    transform: [{ scale: 1.05 }],
  },
  themeGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  themeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },

  // Accent Colors
  accentSection: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  accentCard: {
    width: (width - 64) / 3,
    alignItems: 'center',
    gap: 8,
  },
  selectedAccentCard: {
    transform: [{ scale: 1.05 }],
  },
  accentColor: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  accentSelected: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },

  // Options
  optionsSection: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },

  // Save Button
  saveSection: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ThemeScreen;