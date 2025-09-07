import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();

  useEffect(() => {
    // Handle email verification and other auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is an email verification
          if (session.user.email_confirmed_at && !session.user.last_sign_in_at) {
            Alert.alert(
              'Email Verified!',
              'Your email has been successfully verified. You can now log in.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Sign out the user so they can log in normally
                    supabase.auth.signOut();
                  }
                }
              ]
            );
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
