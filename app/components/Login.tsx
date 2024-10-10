import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

 

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
        const loginResp = await fetch('http://192.168.1.8:5000/login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const loginData = await loginResp.json();
        if (loginResp.ok) {
            // Handle successful login, such as navigating to the next screen
            router.replace('./MapPage')
            console.log('Login successful');
        } else {
            setError(loginData.error || 'Login failed');
        }
    } catch (error) {
        setError('An error occurred. Please try again.');
        console.error('Login error:', error);
    }
  };

  const handleGuestLogin = () => {
    Alert.alert(
      'Hold on a minute there buddy.',
      'As a guest, you will only be able to view fuel prices, not submit them. Continue without logging in?',
      [
        {
            text: 'Yes',
            onPress: () => router.replace('./MapPage'), // Redirect to MapPage for guest login
        },
        {
          text: 'No',
          onPress: () => console.log('Cancelled guest login'),
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
        <View style={styles.outerLogo}>
          <View style={styles.logo}>
            <View style={styles.innerLogo}>
              <Text style={styles.title}>PEITRIL</Text>
            </View>
          </View>
        </View>
        {/* <Text style={styles.login}>Sign In</Text> */}
        {/* <Text style={styles.login}>Sign In</Text> */}
        <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            autoCapitalize={'none'}
            onChangeText={(text) => setEmail(text)}
        />
        <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            autoCapitalize={'none'}
            onChangeText={(text) => setPassword(text)}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.buttons}>
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.guestBtn} onPress={handleGuestLogin}>
                <Text style={styles.btnText}>Guest</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('./Register')}>
            <Text style={styles.btnText}>Create an account</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(236, 236, 236, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  outerLogo: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    height: 320,
    width: 320,
    borderRadius: 200,
    marginBottom: 50,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'black',
    elevation: 10,
  },
  logo: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    borderRadius: 200,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#AFE1AF',
  },
  innerLogo: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    width: 280,
    borderRadius: 200,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: '#AFE1AF',
  },
  title: {
    fontSize: 70,
    textShadowColor: 'black',
    textShadowRadius: 1,
    textShadowOffset: { 
      width: 1,
      height: 1,
    },
    color: '#AFE1AF',
    fontWeight: 'bold',
  },
  login: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#AFE1AF',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginBtn: {
    width: 150,
    height: 50,
    backgroundColor: '#AFE1AF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    borderRadius: 10,
    marginRight: 40,
  },
  guestBtn: {
    width: 150,
    height: 50,
    backgroundColor: '#AFE1AF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    borderRadius: 10,
  },
  registerBtn: {
    width: "100%",
    height: 50,
    backgroundColor: '#75d1e2',
    alignItems: 'center',
    top: 20,
    elevation: 5,
    justifyContent: 'center',
    borderRadius: 10,
  },
  btnText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  createAccount: {
    marginTop: 20,
    color: 'blue',
  },
  loginLabel: {
    position: "relative", 
    fontWeight: 'bold',
    fontSize: 11
  },

});

export default LoginScreen;
