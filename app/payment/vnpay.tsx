import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';

const VNPayPage = () => {
  const router = useRouter();
  const { url, orderId } = useLocalSearchParams();
  const [error, setError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && url) {
      const openInBrowser = async () => {
        try {
          await WebBrowser.openBrowserAsync(decodeURIComponent(url as string));
          router.back();
        } catch (error) {
          setError(true);
        }
      };
      openInBrowser();
      return;
    }
  }, [url, router]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Cancel Payment',
        'Are you sure you want to cancel this payment?',
        [
          {
            text: 'No',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      backHandler.remove();
    };
  }, [router]);

  const handleWebViewNavigationStateChange = (newNavState: any) => {
    const { url: currentUrl } = newNavState;
    if (currentUrl && currentUrl.includes('payment/return')) {
      const urlParams = new URLSearchParams(currentUrl.split('?')[1]);
      const vnpResponseCode = urlParams.get('vnp_ResponseCode');
      const vnpTxnRef = urlParams.get('vnp_TxnRef');

      router.replace({
        pathname: '/payment/return',
        params: {
          orderId: vnpTxnRef || orderId,
          responseCode: vnpResponseCode || '',
          fromWebView: 'true',
        },
      });
    }
  };

  React.useEffect(() => {
    if (url) {
      const decodedUrl = decodeURIComponent(url as string);

      if (!decodedUrl.includes('vnpayment.vn')) {
        setError(true);
      }
    }
  }, [url]);

  if (!url) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid payment URL</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.loadingText}>Opening VNPay in your browser...</Text>
        <Text style={styles.errorText}>
          If the browser didn&apos;t open automatically, click the button below:
        </Text>
        <Button
          mode="contained"
          onPress={async () => {
            if (url) {
              await WebBrowser.openBrowserAsync(
                decodeURIComponent(url as string)
              );
            }
          }}
          style={styles.retryButton}>
          Open VNPay Payment
        </Button>
        <Button mode="outlined" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load payment page</Text>
        <Button
          mode="contained"
          onPress={() => {
            setError(false);
            webViewRef.current?.reload();
          }}
          style={styles.retryButton}>
          Retry in WebView
        </Button>
        <Button
          mode="outlined"
          onPress={async () => {
            if (url) {
              await WebBrowser.openBrowserAsync(
                decodeURIComponent(url as string)
              );
              router.back();
            }
          }}
          style={styles.retryButton}>
          Open in Browser
        </Button>
        <Button mode="outlined" onPress={() => router.back()}>
          Cancel Payment
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: decodeURIComponent(url as string) }}
        style={styles.webview}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        allowsBackForwardNavigationGestures={false}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
      />
    </View>
  );
};

export default VNPayPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    marginBottom: 10,
    minWidth: 120,
  },
});
