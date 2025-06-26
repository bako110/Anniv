import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ExportScreen = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  // États pour les options d'exportation
  const [exportContacts, setExportContacts] = useState(true);
  const [exportEvents, setExportEvents] = useState(true);
  const [exportBirthdays, setExportBirthdays] = useState(true);
  const [exportPhotos, setExportPhotos] = useState(false);
  const [exportSettings, setExportSettings] = useState(true);
  const [exportInvitations, setExportInvitations] = useState(true);

  const [selectedFormat, setSelectedFormat] = useState('json');

  const handleBack = () => {
    router.back();
  };

  const exportFormats = [
    {
      id: 'json',
      name: 'JSON',
      description: 'Format structuré, idéal pour la sauvegarde',
      icon: 'code-outline',
      size: '~2-5 MB',
      color: '#0ea5e9'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Compatible avec Excel et Google Sheets',
      icon: 'grid-outline',
      size: '~1-3 MB',
      color: '#16a34a'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Document lisible, idéal pour l\'impression',
      icon: 'document-text-outline',
      size: '~3-8 MB',
      color: '#dc2626'
    }
  ];

  const dataCategories = [
    {
      key: 'exportContacts',
      value: exportContacts,
      setter: setExportContacts,
      title: 'Contacts',
      description: 'Noms, téléphones, emails, adresses',
      icon: 'people-outline',
      color: '#667eea',
      count: '127 contacts'
    },
    {
      key: 'exportEvents',
      value: exportEvents,
      setter: setExportEvents,
      title: 'Événements',
      description: 'Événements créés et participations',
      icon: 'calendar-outline',
      color: '#ed8936',
      count: '23 événements'
    },
    {
      key: 'exportBirthdays',
      value: exportBirthdays,
      setter: setExportBirthdays,
      title: 'Anniversaires',
      description: 'Dates d\'anniversaire et historique',
      icon: 'gift-outline',
      color: '#f56565',
      count: '89 anniversaires'
    },
    {
      key: 'exportPhotos',
      value: exportPhotos,
      setter: setExportPhotos,
      title: 'Photos',
      description: 'Images des événements et profils',
      icon: 'image-outline',
      color: '#48bb78',
      count: '342 photos'
    },
    {
      key: 'exportSettings',
      value: exportSettings,
      setter: setExportSettings,
      title: 'Paramètres',
      description: 'Préférences et configuration',
      icon: 'settings-outline',
      color: '#8b5cf6',
      count: 'Configuration'
    },
    {
      key: 'exportInvitations',
      value: exportInvitations,
      setter: setExportInvitations,
      title: 'Invitations',
      description: 'Invitations envoyées et reçues',
      icon: 'mail-outline',
      color: '#06b6d4',
      count: '45 invitations'
    }
  ];

  const simulateExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulation du processus d'exportation
    const steps = [
      { progress: 20, message: 'Préparation des données...' },
      { progress: 40, message: 'Collecte des contacts...' },
      { progress: 60, message: 'Exportation des événements...' },
      { progress: 80, message: 'Génération du fichier...' },
      { progress: 100, message: 'Finalisation...' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setExportProgress(step.progress);
    }

    setIsExporting(false);
    
    Alert.alert(
      '✅ Exportation terminée',
      `Vos données ont été exportées avec succès au format ${selectedFormat.toUpperCase()}. Le fichier a été envoyé à votre adresse email.`,
      [
        { text: 'Fermer', onPress: () => router.back() },
        { text: 'Voir les détails', style: 'default' }
      ]
    );
  };

  const handleExport = () => {
    const selectedCategories = dataCategories.filter(cat => cat.value).length;
    
    if (selectedCategories === 0) {
      Alert.alert(
        'Aucune donnée sélectionnée',
        'Veuillez sélectionner au moins une catégorie de données à exporter.'
      );
      return;
    }

    Alert.alert(
      'Confirmer l\'exportation',
      `Vous allez exporter ${selectedCategories} catégorie(s) de données au format ${selectedFormat.toUpperCase()}. Cette opération peut prendre quelques minutes.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Exporter', onPress: simulateExport }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Exporter mes données</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderInfoSection = () => (
    <View style={styles.infoSection}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.infoGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.infoIcon}>
          <Ionicons name="download-outline" size={32} color="white" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Sauvegardez vos données</Text>
          <Text style={styles.infoDescription}>
            Téléchargez une copie complète de toutes vos données CelebConnect
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderFormatSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📄 Format d'exportation</Text>
      <View style={styles.sectionContent}>
        {exportFormats.map((format, index) => (
          <TouchableOpacity
            key={format.id}
            style={[
              styles.formatItem,
              selectedFormat === format.id && styles.selectedFormat,
              index === exportFormats.length - 1 && styles.lastItem
            ]}
            onPress={() => setSelectedFormat(format.id)}
          >
            <View style={styles.formatLeft}>
              <View style={[styles.formatIcon, { backgroundColor: format.color }]}>
                <Ionicons name={format.icon} size={20} color="white" />
              </View>
              <View style={styles.formatInfo}>
                <Text style={styles.formatName}>{format.name}</Text>
                <Text style={styles.formatDescription}>{format.description}</Text>
              </View>
            </View>
            <View style={styles.formatRight}>
              <Text style={styles.formatSize}>{format.size}</Text>
              <View style={[
                styles.radioButton,
                selectedFormat === format.id && styles.radioButtonSelected
              ]}>
                {selectedFormat === format.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDataSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📋 Données à exporter</Text>
      <View style={styles.sectionContent}>
        {dataCategories.map((category, index) => (
          <View
            key={category.key}
            style={[
              styles.dataItem,
              index === dataCategories.length - 1 && styles.lastItem
            ]}
          >
            <View style={styles.dataLeft}>
              <View style={[styles.dataIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon} size={20} color="white" />
              </View>
              <View style={styles.dataInfo}>
                <Text style={styles.dataTitle}>{category.title}</Text>
                <Text style={styles.dataDescription}>{category.description}</Text>
                <Text style={styles.dataCount}>{category.count}</Text>
              </View>
            </View>
            <Switch
              value={category.value}
              onValueChange={category.setter}
              trackColor={{ false: '#d1d5db', true: '#667eea' }}
              thumbColor={category.value ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderExportProgress = () => {
    if (!isExporting) return null;

    return (
      <View style={styles.progressOverlay}>
        <View style={styles.progressModal}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.progressTitle}>Exportation en cours...</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${exportProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{exportProgress}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderExportButton = () => (
    <View style={styles.exportButtonContainer}>
      <TouchableOpacity
        style={[styles.exportButton, isExporting && styles.disabledButton]}
        onPress={handleExport}
        disabled={isExporting}
      >
        <LinearGradient
          colors={isExporting ? ['#94a3b8', '#94a3b8'] : ['#667eea', '#764ba2']}
          style={styles.exportGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons 
            name={isExporting ? "hourglass-outline" : "download-outline"} 
            size={20} 
            color="white" 
          />
          <Text style={styles.exportButtonText}>
            {isExporting ? 'Exportation...' : 'Commencer l\'exportation'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <Text style={styles.exportNote}>
        💡 Le fichier sera envoyé à votre adresse email dans quelques minutes
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderInfoSection()}
        {renderFormatSelection()}
        {renderDataSelection()}
        {renderExportButton()}
        
        <View style={{ height: 30 }} />
      </ScrollView>

      {renderExportProgress()}
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
  infoSection: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedFormat: {
    backgroundColor: '#f0f4ff',
  },
  formatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  formatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formatInfo: {
    flex: 1,
  },
  formatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  formatDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  formatRight: {
    alignItems: 'flex-end',
  },
  formatSize: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#667eea',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5, 
    backgroundColor: '#667eea',
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dataLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataInfo: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  dataDescription: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  dataCount: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  exportButtonContainer: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  exportButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  exportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  exportNote: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default ExportScreen;