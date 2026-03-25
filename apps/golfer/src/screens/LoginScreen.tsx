/**
 * Login Screen
 *
 * Simple login form with email/password authentication.
 * Follows AK Golf design system.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vennligst fyll inn e-post og passord');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error || 'Innlogging feilet');
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Logo / Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>AK</Text>
          </View>
          <Text style={styles.brandName}>AK Golf</Text>
          <Text style={styles.brandTagline}>Din treningspartner</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-post</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="din@epost.no"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Passord</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Logg inn</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Glemt passord?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Har du ikke konto?{' '}
            <Text style={styles.footerLink}>Kontakt din trener</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // Brand
  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  brandTagline: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },

  // Form
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },

  // Error
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },

  // Button
  loginButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  // Forgot password
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#6B7280',
    fontSize: 14,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  footerLink: {
    color: '#1F2937',
    fontWeight: '600',
  },
});
