// src/components/social/StoryCircle.tsx
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StoryCircleProps {
  image: ImageSourcePropType;
  name: string;
  isLive?: boolean;
  hasUnseen?: boolean;
  onPress?: () => void;
}

const StoryCircle: React.FC<StoryCircleProps> = ({ 
  image, 
  name, 
  isLive = false, 
  hasUnseen = false, 
  onPress = () => {} 
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.imageContainer, hasUnseen && styles.unseenBorder]}>
        <Image source={image} style={styles.image} />
        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 12,
    width: 80,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unseenBorder: {
    borderColor: '#ff5a5f',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  liveBadge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#ff5a5f',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  name: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StoryCircle;