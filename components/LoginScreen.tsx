import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, Eye, EyeOff, Zap, Shield, Mail, Phone, UserPlus } from 'lucide-react-native';
import Animated, { FadeInUp, SlideInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials, RegisterRequest } from '@/types/auth';

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const { login, register, simulateVerification, isLoading, error } = useAuth();

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    const credentials: LoginCredentials = {
      email,
      password,
      loginType: 'streaming', // Default to streaming for simplified login
    };

    try {
      await login(credentials);
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const registerData: RegisterRequest = {
      name: fullName,
      email,
      password,
      confirmPassword,
      phone: phone || undefined,
      username: username || undefined,
    };

    try {
      const result = await register(registerData);
      setRegistrationSuccess(true);
      setRegistrationMessage(result.message);
      
      // Clear form
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
      setUsername('');
    } catch (error) {
      Alert.alert('Registration Failed', (error as Error).message);
    }
  };

  const handleSimulateVerification = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter the email address to verify');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    try {
      await simulateVerification(email);
      Alert.alert('Success', 'Email verified successfully! You can now log in.');
      setRegistrationSuccess(false);
      setIsRegistering(false);
    } catch (error) {
      Alert.alert('Verification Failed', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D1117', '#1B1B1B']} style={styles.background}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
          <Text style={styles.title}>Snooker Stream Pro</Text>
          <Text style={styles.subtitle}>Professional Broadcasting Platform</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View entering={SlideInDown.delay(400)} style={styles.loginContainer}>
            {/* Registration Success Message */}
            {registrationSuccess && (
              <View style={styles.successContainer}>
                <Mail size={48} color="#4CAF50" />
                <Text style={styles.successTitle}>Check Your Email</Text>
                <Text style={styles.successMessage}>{registrationMessage}</Text>
                
                {/* Demo Verification Button */}
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={handleSimulateVerification}
                >
                  <Text style={styles.verifyButtonText}>Simulate Email Verification</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.backToLoginButton}
                  onPress={() => {
                    setRegistrationSuccess(false);
                    setIsRegistering(false);
                  }}
                >
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            )}

            {!registrationSuccess && (
              <>
                {/* Toggle between Login and Register */}
                <View style={styles.authToggle}>
                  <TouchableOpacity
                    style={[styles.toggleButton, !isRegistering && styles.activeToggle]}
                    onPress={() => setIsRegistering(false)}
                  >
                    <Text style={[styles.toggleText, !isRegistering && styles.activeToggleText]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, isRegistering && styles.activeToggle]}
                    onPress={() => setIsRegistering(true)}
                  >
                    <UserPlus size={16} color={isRegistering ? '#fff' : '#40E0D0'} />
                    <Text style={[styles.toggleText, isRegistering && styles.activeToggleText]}>
                      Register
                    </Text>
                  </TouchableOpacity>
                </View>
                {!isRegistering && (
                  <>
                    {/* Welcome Message */}
                    <View style={styles.welcomeSection}>
                      <Text style={styles.welcomeTitle}>Welcome Back</Text>
                      <Text style={styles.welcomeSubtitle}>
                        Sign in to access your snooker streaming platform
                      </Text>
                    </View>
                  </>
                )}

                {/* Form */}
                <View style={styles.form}>
                  {isRegistering && (
                    <View style={styles.inputContainer}>
                      <User size={20} color="#666" />
                      <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#666"
                        value={fullName}
                        onChangeText={setFullName}
                      />
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Mail size={20} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Email address"
                      placeholderTextColor="#666"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  {isRegistering && (
                    <>
                      <View style={styles.inputContainer}>
                        <User size={20} color="#666" />
                        <TextInput
                          style={styles.input}
                          placeholder="Username (optional)"
                          placeholderTextColor="#666"
                          value={username}
                          onChangeText={setUsername}
                          autoCapitalize="none"
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <Phone size={20} color="#666" />
                        <TextInput
                          style={styles.input}
                          placeholder="Phone (optional)"
                          placeholderTextColor="#666"
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </>
                  )}

                  <View style={styles.inputContainer}>
                    <Lock size={20} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#666"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={20} color="#666" />
                      ) : (
                        <Eye size={20} color="#666" />
                      )}
                    </TouchableOpacity>
                  </View>

                  {isRegistering && (
                    <View style={styles.inputContainer}>
                      <Lock size={20} color="#666" />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#666"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? (
                          <EyeOff size={20} color="#666" />
                        ) : (
                          <Eye size={20} color="#666" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {error && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}

                  <TouchableOpacity
                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                    onPress={isRegistering ? handleRegister : handleLogin}
                    disabled={isLoading}
                  >
                    <Text style={styles.loginButtonText}>
                      {isLoading 
                        ? (isRegistering ? 'Creating Account...' : 'Signing In...') 
                        : (isRegistering ? 'Create Account' : 'Sign In')
                      }
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B0BEC5',
    fontSize: 16,
  },
  loginContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 40,
  },
  authToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeToggle: {
    backgroundColor: '#40E0D0',
  },
  toggleText: {
    color: '#40E0D0',
    fontSize: 14,
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#fff',
  },
  welcomeSection: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    color: '#40E0D0',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: '#B0BEC5',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    color: '#B0BEC5',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backToLoginButton: {
    paddingVertical: 8,
  },
  backToLoginText: {
    color: '#40E0D0',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#40E0D0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});