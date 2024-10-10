import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [error, setError] = useState('');



  const handleRegister = async () => {
    try {
        const response = await fetch('http://192.168.1.8:5000/register', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, firstName, secondName, password, confirmPassword}),
        });
        const registerData = await response.json();
        if (response.ok) {
            console.log('Registration Successful');
            
            Alert.alert('Account created', 'Account was created successfully', [
              { text: 'OK', onPress: () => console.log('OK Pressed') }
          ]);
            router.replace('./Login')
        } else {
            setError(registerData.error);
        }
    } catch (error) {
        setError('An error occurred. Please try again.');
        console.error('Login error:', error);
    }
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.closePageButton} onPress={() => {router.back()}}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <View style={styles.outerLogo}>
          <View style={styles.logo}>
            <View style={styles.innerLogo}>
              <Text style={styles.title}>PEITRIL</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.fullName}>
            <TextInput
                style={styles.nameInput}
                placeholder="First Name"
                value={firstName}
                onChangeText={(text) => setFirstName(text)}
            />
            <TextInput
                style={styles.nameInput}
                placeholder="Surame"
                value={secondName}
                onChangeText={(text) => setSecondName(text)}
            />
        </View>          
        <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
        />      
        <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text) => setPassword(text)}
        />
        <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
            <Text style={styles.btnText}>Register</Text>
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
  closePageButton: {
    width: 30,
    height: 30,
    left: 167,
    bottom: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 15,
  },
  closeButtonText: {
      color: "white",
      fontSize: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fullName: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    width: '47%',
    height: 40,
    borderColor: '#AFE1AF',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 10, 
    marginRight: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#AFE1AF',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  registerBtn: {
    width: 150,
    height: 50,
    backgroundColor: '#AFE1AF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    elevation: 5,
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
});

export default Register;
