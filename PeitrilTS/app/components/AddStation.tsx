import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert} from 'react-native'
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps'
import { router } from 'expo-router'
import * as Location from 'expo-location'

 
const AddStation = () => {
    const [locationName, setLocationName] = useState('');
    const [locationBrand, setLocationBrand] = useState('');
    const [petrolPrice, setPetrolPrice] = useState('');
    const [dieselPrice, setDieselPrice] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState({
        latitude: 0,
        longitude: 0,
    });
    
    useEffect(() => {
            const getUserLocation = async () =>{
                let location = await Location.getCurrentPositionAsync({});
            
                setSelectedLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });

                setLoading(false);

            }

            getUserLocation();
    }, []);

    const submitStation = async () => {
        try{
            setLoading(true);

            const submitResp = await fetch("http://192.168.1.8:5000/add_station", {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    longitude: selectedLocation.longitude, 
                    latitude: selectedLocation.latitude,
                    name: locationName,
                    brand: locationBrand,
                    petrol: petrolPrice, 
                    diesel: dieselPrice
                }),
            }); 

            if (!submitResp.ok) {
                console.log("Failed to submit station");
                return;
            }

            Alert.alert('Station submitted', 'Station will be confirmed and station will be added to map!', [
                { text: 'OK', onPress: () => console.log('OK Pressed') }
            ]);

            router.back();
              
        } catch(error) {
            console.log(error)
        };
        
    };


    return (
        <View style={styles.container}>
        {loading ? (
            <ActivityIndicator size="large" color="#0000ff"/>
        ) : (
            <>
                <TouchableOpacity style={styles.closePageButton} onPress={() => {router.back()}}>
                    <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
                <View style={styles.mapBox}>
                        <MapView 
                        style={styles.map} 
                        showsUserLocation = {true} 
                        followsUserLocation = {true} 
                        provider = {PROVIDER_GOOGLE} 
                        initialRegion={{
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        onPress={(event) => {
                            const { latitude, longitude } = event.nativeEvent.coordinate;
                            setSelectedLocation({ latitude, longitude });
                        }}
                        customMapStyle={mapStyle}
                    >
                            <Marker 
                                draggable 
                                coordinate={selectedLocation}
                                pinColor="green"
                            />
                    </MapView>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Location Name"
                    value={locationName}
                    onChangeText={(text) => setLocationName(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Brand"
                    value={locationBrand}
                    onChangeText={(text) => setLocationBrand(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Petrol Price"
                    keyboardType="numeric"
                    value={petrolPrice}
                    onChangeText={(text) => setPetrolPrice(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Diesel Price"
                    keyboardType="numeric"
                    value={dieselPrice}
                    onChangeText={(text) => setDieselPrice(text)}
                />


                <TouchableOpacity style={styles.submitBtn} onPress={submitStation}>
                    <Text style={styles.btnText}>Submit Station</Text>
                </TouchableOpacity>

                <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>Select station location:</Text>
                </View>    
            </>
            )}
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
    mapBox: {
        height: 350,
        width: 350,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: '#AFE1AF',
        borderRadius: 10,
        borderWidth: 2,
        elevation: 5,
        marginBottom: 10
    },
    map: {
        width: '95%',
        height: '95%',
        borderRadius: 10,
    },
    descriptionBox:{
        position: 'absolute',
        top: 40,
        left: 10,
        width: 100,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#AFE1AF',
        borderRadius: 10,
        elevation: 0,
        backgroundColor: 'white'
    },
    descriptionText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#AFE1AF',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'white'
    },
    buttons: {
        flexDirection: 'row',
        marginTop: 20
    },
    submitBtn: {
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

const mapStyle = 
[
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
]

export default AddStation;
