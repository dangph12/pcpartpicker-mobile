/* eslint-disable import/no-unresolved */
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { supabase } from '~/lib/subpabase';

interface AvatarProps {
  size?: number;
  url: string | null;
  onUpload: (filePath: string) => void;
  showUploadButton?: boolean;
}

const Avatar = ({
  url,
  size = 150,
  onUpload,
  showUploadButton = true,
}: AvatarProps) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { height: size, width: size };

  useEffect(() => {
    if (url) {
      downloadImage(url);
    } else {
      downloadImage('default.png');
    }
  }, [url]);

  const downloadImage = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);

      if (error) {
        console.warn('Error downloading image: ', error.message);
        setAvatarUrl(null);
        return;
      }

      if (data) {
        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error downloading image: ', error.message);
      }
      setAvatarUrl(null);
    }
  };

  const uploadAvatar = async () => {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const img = result.assets[0];
      const response = await fetch(img.uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileExt = img.mimeType?.split('/')[1] || 'jpeg';

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${Date.now()}.${fileExt}`, arrayBuffer, {
          contentType: img.mimeType || 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      if (data) {
        onUpload(data.path);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error uploading image: ', error.message);
      } else {
        console.warn('Error uploading image: ', error);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]} />
      )}
      {showUploadButton && (
        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={uploadAvatar} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Change Avatar'}
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatar: {
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  image: {
    objectFit: 'cover',
  },
  noImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 12,
  },
});

export default Avatar;
