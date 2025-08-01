/**
 * Login Form Component with Schema Validation
 * Demonstrates the integration of Zod validation with React Native forms
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthSchemas, schemaValidator, ValidationError } from '../../utils/schemaValidator';
import { useAuth } from '../../hooks/useApiWithValidation';
import { structuredLogger } from '../../utils/structuredLogger';

interface LoginFormProps {
  onLoginSuccess?: (user: any) => void;
  onLoginError?: (error: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();

  // Real-time validation as user types
  const validateField = (field: keyof typeof formData, value: any) => {
    try {
      // Validate individual field
      if (field === 'email') {
        AuthSchemas.login.shape.email.parse(value);
      } else if (field === 'password') {
        AuthSchemas.login.shape.password.parse(value);
      }
      
      // Clear error if validation passes
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      
    } catch (error) {
      if (error instanceof Error) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: error.message,
        }));
      }
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate field in real-time (with debounce for better UX)
    if (typeof value === 'string' && value.length > 0) {
      validateField(field, value);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    structuredLogger.userAction('form_submit_attempt', 'auth', {
      component: 'LoginForm',
      action: 'submit',
    }, {
      hasEmail: !!formData.email,
      hasPassword: !!formData.password,
    });

    try {
      // Validate entire form
      const validatedData = schemaValidator.validateFormData(
        AuthSchemas.login,
        formData,
        'login-form'
      );

      structuredLogger.debug('Form validation passed', {
        component: 'LoginForm',
        action: 'validate',
      });

      // Attempt login
      const result = await login.execute(validatedData.email, validatedData.password);
      
      if (result) {
        structuredLogger.userAction('login_success', 'auth', {
          component: 'LoginForm',
          action: 'login_success',
        }, {
          userId: result.user?.id,
        });

        onLoginSuccess?.(result.user);
        Alert.alert('Success', 'Login successful!');
      } else {
        // Handle API errors
        const errorMessage = login.error || 'Login failed';
        
        structuredLogger.userAction('login_failed', 'auth', {
          component: 'LoginForm',
          action: 'login_failed',
        }, {
          error: errorMessage,
          validationErrors: login.validationErrors,
        });

        if (login.validationErrors) {
          setValidationErrors(login.validationErrors);
        } else {
          onLoginError?.(errorMessage);
          Alert.alert('Error', errorMessage);
        }
      }

    } catch (error) {
      if (error instanceof ValidationError) {
        // Handle validation errors
        const errors = error.getFormattedErrors();
        setValidationErrors(errors);
        
        structuredLogger.userAction('form_validation_failed', 'auth', {
          component: 'LoginForm',
          action: 'validation_failed',
        }, {
          validationErrors: errors,
        });

        Alert.alert('Validation Error', error.getFirstError());
      } else {
        // Handle unexpected errors
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        
        structuredLogger.error('Login form unexpected error', error as Error, {
          component: 'LoginForm',
          action: 'submit',
        });

        onLoginError?.(errorMessage);
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(validationErrors).length > 0;
  const isFormValid = formData.email && formData.password && !hasErrors;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            validationErrors.email && styles.inputError,
          ]}
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          accessibilityLabel="Email input"
          accessibilityHint="Enter your email address"
        />
        {validationErrors.email && (
          <Text style={styles.errorText}>{validationErrors.email}</Text>
        )}
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[
            styles.input,
            validationErrors.password && styles.inputError,
          ]}
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          accessibilityLabel="Password input"
          accessibilityHint="Enter your password"
        />
        {validationErrors.password && (
          <Text style={styles.errorText}>{validationErrors.password}</Text>
        )}
      </View>

      {/* Remember Me Checkbox */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleInputChange('rememberMe', !formData.rememberMe)}
        disabled={isSubmitting}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: formData.rememberMe }}
      >
        <View style={[styles.checkbox, formData.rememberMe && styles.checkboxChecked]}>
          {formData.rememberMe && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Remember me</Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!isFormValid || isSubmitting) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Sign in button"
        accessibilityHint="Tap to sign in with your credentials"
      >
        <Text style={[
          styles.submitButtonText,
          (!isFormValid || isSubmitting) && styles.submitButtonTextDisabled,
        ]}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      {/* Loading State */}
      {login.loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Authenticating...</Text>
        </View>
      )}

      {/* Forgot Password Link */}
      <TouchableOpacity
        style={styles.forgotPasswordContainer}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Forgot password link"
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default LoginForm;
