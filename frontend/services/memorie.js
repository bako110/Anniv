import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

class MemoryService {
  constructor() {
    this.STORAGE_KEY = '@memories_storage';
    this.IMAGES_DIR = FileSystem.documentDirectory + 'memories_images/';
    this.initializeStorage();
  }

  /**
   * Initialise le stockage et crée le dossier des images
   */
  async initializeStorage() {
    try {
      // Créer le dossier des images s'il n'existe pas
      const dirInfo = await FileSystem.getInfoAsync(this.IMAGES_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.IMAGES_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du stockage:', error);
    }
  }

  /**
   * Génère un ID unique pour un souvenir
   */
  generateUniqueId() {
    return `memory_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Sauvegarde les images localement et retourne les nouveaux chemins
   */
  async saveImages(images) {
    const savedImages = [];
    
    try {
      for (const image of images) {
        const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
        const localPath = this.IMAGES_DIR + filename;
        
        // Copier l'image vers le stockage local
        await FileSystem.copyAsync({
          from: image.uri,
          to: localPath
        });
        
        savedImages.push({
          id: image.id,
          uri: localPath,
          originalUri: image.uri,
          filename: filename
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des images:', error);
      throw new Error('Erreur lors de la sauvegarde des images');
    }
    
    return savedImages;
  }

  /**
   * Supprime les images du stockage local
   */
  async deleteImages(images) {
    try {
      for (const image of images) {
        if (image.uri && image.uri.startsWith(this.IMAGES_DIR)) {
          const fileInfo = await FileSystem.getInfoAsync(image.uri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(image.uri);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des images:', error);
    }
  }

  /**
   * Sauvegarde un nouveau souvenir
   */
  async saveMemory(memoryData) {
    try {
      const { title, description, date, selectedImages, memoryType } = memoryData;
      
      // Validation des données
      if (!title || !title.trim()) {
        throw new Error('Le titre est obligatoire');
      }
      
      if (!selectedImages || selectedImages.length === 0) {
        throw new Error('Au moins une image est requise');
      }

      // Sauvegarder les images localement
      const savedImages = await this.saveImages(selectedImages);
      
      // Créer l'objet souvenir
      const memory = {
        id: this.generateUniqueId(),
        title: title.trim(),
        description: description?.trim() || '',
        date: date.toISOString(),
        images: savedImages,
        memoryType: memoryType || 'vacation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Récupérer les souvenirs existants
      const existingMemories = await this.getAllMemories();
      
      // Ajouter le nouveau souvenir
      const updatedMemories = [memory, ...existingMemories];
      
      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedMemories));
      
      return {
        success: true,
        memory: memory,
        message: 'Souvenir enregistré avec succès'
      };
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du souvenir:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de l\'enregistrement du souvenir'
      };
    }
  }

  /**
   * Récupère tous les souvenirs
   */
  async getAllMemories() {
    try {
      const memoriesData = await AsyncStorage.getItem(this.STORAGE_KEY);
      return memoriesData ? JSON.parse(memoriesData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des souvenirs:', error);
      return [];
    }
  }

  /**
   * Récupère un souvenir par son ID
   */
  async getMemoryById(id) {
    try {
      const memories = await this.getAllMemories();
      return memories.find(memory => memory.id === id) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du souvenir:', error);
      return null;
    }
  }

  /**
   * Met à jour un souvenir existant
   */
  async updateMemory(id, updateData) {
    try {
      const memories = await this.getAllMemories();
      const memoryIndex = memories.findIndex(memory => memory.id === id);
      
      if (memoryIndex === -1) {
        throw new Error('Souvenir non trouvé');
      }

      const existingMemory = memories[memoryIndex];
      
      // Si de nouvelles images sont ajoutées, les sauvegarder
      let updatedImages = existingMemory.images;
      if (updateData.selectedImages && updateData.selectedImages.length > 0) {
        // Supprimer les anciennes images
        await this.deleteImages(existingMemory.images);
        // Sauvegarder les nouvelles images
        updatedImages = await this.saveImages(updateData.selectedImages);
      }

      // Mettre à jour le souvenir
      const updatedMemory = {
        ...existingMemory,
        title: updateData.title?.trim() || existingMemory.title,
        description: updateData.description?.trim() || existingMemory.description,
        date: updateData.date ? updateData.date.toISOString() : existingMemory.date,
        memoryType: updateData.memoryType || existingMemory.memoryType,
        images: updatedImages,
        updatedAt: new Date().toISOString()
      };

      memories[memoryIndex] = updatedMemory;
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(memories));
      
      return {
        success: true,
        memory: updatedMemory,
        message: 'Souvenir mis à jour avec succès'
      };
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du souvenir:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la mise à jour du souvenir'
      };
    }
  }

  /**
   * Supprime un souvenir
   */
  async deleteMemory(id) {
    try {
      const memories = await this.getAllMemories();
      const memory = memories.find(m => m.id === id);
      
      if (!memory) {
        throw new Error('Souvenir non trouvé');
      }

      // Supprimer les images associées
      await this.deleteImages(memory.images);
      
      // Supprimer le souvenir de la liste
      const updatedMemories = memories.filter(m => m.id !== id);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedMemories));
      
      return {
        success: true,
        message: 'Souvenir supprimé avec succès'
      };
      
    } catch (error) {
      console.error('Erreur lors de la suppression du souvenir:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la suppression du souvenir'
      };
    }
  }

  /**
   * Recherche des souvenirs par titre ou description
   */
  async searchMemories(query) {
    try {
      const memories = await this.getAllMemories();
      const lowercaseQuery = query.toLowerCase();
      
      return memories.filter(memory => 
        memory.title.toLowerCase().includes(lowercaseQuery) ||
        memory.description.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  }

  /**
   * Filtre les souvenirs par type
   */
  async getMemoriesByType(memoryType) {
    try {
      const memories = await this.getAllMemories();
      return memories.filter(memory => memory.memoryType === memoryType);
    } catch (error) {
      console.error('Erreur lors du filtrage par type:', error);
      return [];
    }
  }

  /**
   * Filtre les souvenirs par période de dates
   */
  async getMemoriesByDateRange(startDate, endDate) {
    try {
      const memories = await this.getAllMemories();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return memories.filter(memory => {
        const memoryDate = new Date(memory.date);
        return memoryDate >= start && memoryDate <= end;
      });
    } catch (error) {
      console.error('Erreur lors du filtrage par date:', error);
      return [];
    }
  }

  /**
   * Obtient les statistiques des souvenirs
   */
  async getMemoryStats() {
    try {
      const memories = await this.getAllMemories();
      const stats = {
        total: memories.length,
        byType: {},
        byMonth: {},
        totalImages: 0
      };

      memories.forEach(memory => {
        // Statistiques par type
        stats.byType[memory.memoryType] = (stats.byType[memory.memoryType] || 0) + 1;
        
        // Statistiques par mois
        const monthKey = new Date(memory.date).toISOString().substring(0, 7); // YYYY-MM
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
        
        // Total des images
        stats.totalImages += memory.images.length;
      });

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return { total: 0, byType: {}, byMonth: {}, totalImages: 0 };
    }
  }

  /**
   * Exporte tous les souvenirs (sans les images pour la taille)
   */
  async exportMemories() {
    try {
      const memories = await this.getAllMemories();
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        memories: memories.map(memory => ({
          ...memory,
          images: memory.images.map(img => ({
            id: img.id,
            filename: img.filename
          }))
        }))
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    }
  }

  /**
   * Vide complètement le stockage (pour le développement/test)
   */
  async clearAllMemories() {
    try {
      const memories = await this.getAllMemories();
      
      // Supprimer toutes les images
      for (const memory of memories) {
        await this.deleteImages(memory.images);
      }
      
      // Vider AsyncStorage
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      
      return {
        success: true,
        message: 'Tous les souvenirs ont été supprimés'
      };
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors du nettoyage'
      };
    }
  }
}

// Instance singleton du service
const memoryService = new MemoryService();

export default memoryService;