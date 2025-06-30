/* eslint-disable import/no-unresolved */
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { supabase } from '~/lib/subpabase';

interface AvatarProps {
  size: number;
  url: string | null;
  onUpload: (filePath: string) => void;
}

const Avatar = ({ url, size = 150, onUpload }: AvatarProps) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const avatarSize = { height: size, width: size };

  useEffect(() => {
    if (url) {
      downloadImage(url);
    }
  }, [url]);

  const downloadImage = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);

      if (error) {
        throw error;
      }

      if (data) {
        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error downloading image: ', error.message);
      }
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
    <View>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]}></View>
      )}
      <View>
        <Button onPress={uploadAvatar} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 5,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  image: {
    objectFit: 'cover',
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgb(200, 200, 200)',
    borderRadius: 5,
  },
});

export default Avatar;
