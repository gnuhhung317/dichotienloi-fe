import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import authService from '../services/auth.service';

/**
 * Component test nhanh các API authentication
 * Sử dụng để test API trước khi tích hợp vào UI chính
 */
export function AuthTestScreen() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('Test User');

  const testRegister = async () => {
    try {
      const result = await authService.register({ email, password, name });
      Alert.alert('Success', `Registered: ${result.user.name}`);
      console.log('Register result:', result);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Register error:', error);
    }
  };

  const testLogin = async () => {
    try {
      const result = await authService.login({ email, password });
      Alert.alert('Success', `Logged in: ${result.user.name}`);
      console.log('Login result:', result);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Login error:', error);
    }
  };

  const testGetMe = async () => {
    try {
      const user = await authService.getMe();
      Alert.alert('Success', `User: ${user.name} (${user.email})`);
      console.log('GetMe result:', user);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('GetMe error:', error);
    }
  };

  const testLogout = async () => {
    try {
      await authService.logout();
      Alert.alert('Success', 'Logged out');
      console.log('Logout success');
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Logout error:', error);
    }
  };

  const testIsAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      Alert.alert('Auth Status', `Authenticated: ${isAuth}`);
      console.log('IsAuth result:', isAuth);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('IsAuth error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Test Screen</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={testRegister}>
        <Text style={styles.buttonText}>Test Register</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testLogin}>
        <Text style={styles.buttonText}>Test Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testGetMe}>
        <Text style={styles.buttonText}>Test Get Me</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testIsAuth}>
        <Text style={styles.buttonText}>Test Is Authenticated</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={testLogout}>
        <Text style={styles.buttonText}>Test Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#16A34A',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
