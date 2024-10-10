import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Text, Image, TouchableOpacity, Modal, FlatList, ActivityIndicator} from 'react-native'
import {Camera, CameraType} from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import Icon from 'react-native-vector-icons/AntDesign'
import { router, useLocalSearchParams } from "expo-router"
import * as Location from 'expo-location'



const CameraPage = () => {

    const [startCamera, setStartCamera] = Camera.useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const cameraRef = useRef<Camera>(null);    
    const [petrolPriceOne, setPetrolPriceOne] = useState('');
    const [petrolPriceTwo, setPetrolPriceTwo] = useState('');
    const [petrolPriceThree, setPetrolPriceThree] = useState('');
    const [dieselPriceOne, setDieselPriceOne] = useState('');
    const [dieselPriceTwo, setDieselPriceTwo] = useState('');
    const [dieselPriceThree, setDieselPriceThree] = useState('');
    const [userLocation, setUserLocation] = useState<any>({});
    const [lastUpdate, setLastUpdate] = useState('');
    const [station, setStation] = useState<any>({});
    const [changeStation, setChangeStation] = useState(false)
    const [stations, setStations] = useState<any>([]);
    const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
    const [modalPetrolPrice, setModalPetrolPrice] = useState('');
    const [modalDieselPrice, setModalDieselPrice] = useState('');
    const [modalPriceMessage, setModalPriceMessage] = useState('');
    const [incorrectPrice, setIncorrectPrice] = useState(false);
    const [chosenStation, setChosenStationId] = useState("");
    const [loading, setLoading] = useState(false)

    const { chosenStationId } = useLocalSearchParams();

    useEffect(() => {
        console.log(chosenStationId)
        if(chosenStationId){
            setChosenStationId(chosenStationId.toString())
        }
        else{
            setChosenStationId("0")
        };

        getClosestStation();

    }, []);

    const getClosestStation = async () => {
        let location = await Location.getCurrentPositionAsync({});

        setUserLocation(location.coords);
        
        if(chosenStationId === "0"){
            let user_lat = location.coords.latitude;
            let user_long = location.coords.longitude;
            try{
                const stationResp = await fetch(`http://192.168.1.8:5000/get_nearest_station`, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_lat, 
                        user_long
                    })
                })
                if (!stationResp.ok) {
                    console.log("Failed to fetch station 1");
                    return;
                }
    
                const stationData = await stationResp.json();
                
                setChosenStationId(stationData.station_id);

                setStation(stationData);

                const priceResp = await fetch(`http://192.168.1.8:5000/get_price`, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        station_id: stationData.station_id
                    })
                })
                if (!priceResp.ok) {
                    console.log("Failed to fetch station 2");
                    return;
                }
    
                const priceData = await priceResp.json();
    
                setPetrolPriceOne(priceData.p1);
                setPetrolPriceTwo(priceData.p2);
                setPetrolPriceThree(priceData.p3);
                setDieselPriceOne(priceData.d1);
                setDieselPriceTwo(priceData.d2);
                setDieselPriceThree(priceData.d3);
                setLastUpdate(priceData.date);

            }catch(error) {
                console.log(error);
            }
        } else {
            try{
                const stationResp = await fetch(`http://192.168.1.8:5000/get_station`, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        station_id: chosenStationId
                    })
                })
                if (!stationResp.ok) {
                    console.log("Failed to fetch station 3");
                    return;
                }

                
    
                const stationData = await stationResp.json();
                
                console.log(stationData)

                setStation(stationData);

                const priceResp = await fetch(`http://192.168.1.8:5000/get_price`, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        station_id: chosenStationId
                    })
                })
                if (!priceResp.ok) {
                    console.log("Failed to fetch station");
                    return;
                }
    
                const priceData = await priceResp.json();
    
                setPetrolPriceOne(priceData.p1);
                setPetrolPriceTwo(priceData.p2);
                setPetrolPriceThree(priceData.p3);
                setDieselPriceOne(priceData.d1);
                setDieselPriceTwo(priceData.d2);
                setDieselPriceThree(priceData.d3);
                setLastUpdate(priceData.date);

            }catch(error) {
                console.log(error);
            }
        }
  
    };

    const searchStations = async () => {
        try{

            const stationsResp = await fetch(`http://192.168.1.8:5000/get_stations`, {
              method: 'post',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ "longitude": userLocation.longitude, "latitude": userLocation.latitude}),
            });
    
            if (!stationsResp.ok) {
              console.log("Failed to fetch stations");
              return;
            }
            const stationsData = await stationsResp.json();
            setStations(stationsData);
            setChangeStation(true);

          } catch (error) {
            console.log(error);
          }
    };

    // Function to handle capturing photo
    const handleCapture = async () => {
        if (cameraRef.current?.takePictureAsync) {
            if (cameraRef.current?.takePictureAsync) {
                let photo = await cameraRef.current.takePictureAsync();
                setCapturedImage(photo.uri);
                setModalVisible(true);
            }
        }
    };

    const handlePickImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            console.log("Permission to access camera roll is required!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setCapturedImage(result.assets[0].uri);
            setModalVisible(true);
        }
    };

    const setSelectedStation = async (station_id: string) => {
        try{
            console.log(station_id)
            const stationResp = await fetch(`http://192.168.1.8:5000/get_station`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    station_id: station_id
                })
            })
            if (!stationResp.ok) {
                console.log("Failed to fetch station");
                return;
            }

            const stationData = await stationResp.json();

            setChosenStationId(stationData.station_id);

            console.log(stationData)

            const priceResp = await fetch(`http://192.168.1.8:5000/get_price`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    station_id: station_id
                })
            })
            if (!priceResp.ok) {
                console.log("Failed to fetch stations");
                return;
            }

            const priceData = await priceResp.json();

            setStation(stationData);
            setPetrolPriceOne(priceData.p1);
            setPetrolPriceTwo(priceData.p2);
            setPetrolPriceThree(priceData.p3);
            setDieselPriceOne(priceData.d1);
            setDieselPriceTwo(priceData.d2);
            setDieselPriceThree(priceData.d3);
            setLastUpdate(priceData.date);
        }catch(error) {
            console.error("Error in setSelectedStation:", error);
        }

        
    };

    const submitPicture = async () => {
        
        try {
            setLoading(true);
            setIncorrectPrice(false);

            const formData = new FormData();

            formData.append('image', {
                uri: capturedImage,
                type: 'image/jpeg',
                name: 'photo.jpg',
            } as any);

            // Append stationId to the form data
            formData.append('station_id', station.station_id);

            // Make the POST request to the backend
            const priceResp = await fetch('http://192.168.1.8:5000/price_extraction', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (!priceResp.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await priceResp.json();

            // Handle response from the backend

            console.log('Image uploaded successfully:', data);

            if(data.message === 'Price Extraction Unsuccessful'){
                setIncorrectPrice(true);
            };

            // Reset capturedImage state and hide modal
            setModalVisible(false);
            setModalPriceMessage(data.message)
            setModalPetrolPrice(data.petrol_price);
            setModalDieselPrice(data.diesel_price);
            setSubmissionModalVisible(true);
            setLoading(false);

        } catch (error) {
            console.error('Error submitting image:', error);
        } 
    };

    const savePrices = async () => {

        try{
            console.log(station.station_id)
            const newPriceResp = await fetch(`http://192.168.1.8:5000/add_price`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    station_id: station.station_id,
                    petrol_price: modalPetrolPrice,
                    diesel_price: modalDieselPrice 
                })
            })
            if (!newPriceResp.ok) {
                console.log("Failed to fetch station");
                return;
            }

            const newPriceMessage = await newPriceResp.json();

            console.log(newPriceMessage)

            // Route back to map page
            router.replace('./MapPage')

        }catch(error) {
            console.error("Error in setSelectedStation:", error);
        }

    };

    return (
        <View style={styles.container}>
                <TouchableOpacity style={styles.closePageButton} onPress={() => {router.back()}}>
                    <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
            {!loading ? (
                <>
                {startCamera ? (
                    <Camera
                        style={styles.camera}
                        type={CameraType.back}
                        ref={cameraRef}
                    />
                ) : (
                    <Text>No access to camera</Text>
                )}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.selectImageButton} onPress={handlePickImage}>
                        <Icon name="pluscircle" color={'white'} size={30}></Icon>
                        <Text style={styles.buttonText}>Add photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.captureImageButton} onPress={handleCapture}>
                        <Icon name="camera" color={'white'} size={30}></Icon>
                        <Text style={styles.buttonText}>Take photo</Text>
                    </TouchableOpacity>
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={submissionModalVisible}
                    onRequestClose={() => {
                        setSubmissionModalVisible(false);
                    }}
                >
                    <View style={styles.submissionModalContainer}>
                        <View style={styles.submissionModalContent}>
                            <Text style={styles.submissionModalTitle}>
                                {!incorrectPrice ? "Confirm Prices" : "Prices not detected"} 
                            </Text>
                            <Text style={styles.submissionModalText}>Petrol: €{modalPetrolPrice}</Text>
                            <Text style={styles.submissionModalText}>Diesel: €{modalDieselPrice}</Text>
                            <View style={styles.submissionModalButtonBox}>
                            {!incorrectPrice ? (
                                    <>
                                    <TouchableOpacity style={styles.submissionModalButtonConfirm} onPress={savePrices}>
                                        <Icon name="check" color={'white'} size={20}></Icon>
                                        <Text style={styles.submissionModalButtonText}>Confirm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.submissionModalButtonChange} onPress={() => {router.push({pathname: './ChangeImagePrice', params: {chosenStation, modalPetrolPrice, modalDieselPrice}})}}>
                                        <Icon name="retweet" color={'white'} size={20}></Icon>
                                        <Text style={styles.submissionModalButtonText}>Change</Text>
                                    </TouchableOpacity>
                                    </>
                                ) : (
                                    <TouchableOpacity style={styles.submissionModalButtonChangeAlternate} onPress={() => {router.push({pathname: './ChangeImagePrice', params: {chosenStation, modalPetrolPrice, modalDieselPrice}})}}>
                                        <Icon name="retweet" color={'white'} size={20}></Icon>
                                        <Text style={styles.submissionModalButtonText}>Input Price</Text>
                                    </TouchableOpacity>
                                )}
    
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                    }}
                >
                    <View style={styles.modalContainer}>            
                    {!changeStation ? (
                        <View style={styles.stationBox}>
                            <View style={styles.stationBoxDisplay}>
                                <View style={styles.stationTitleDisplay}>
                                    <View style={styles.stationTitle}>
                                        <Text style={styles.stationBrand}>{station.station_brand}</Text>
                                        <Text style={styles.stationLocation}>{station.location_name}</Text>
                                    </View>
                                    <View style={styles.stationChangeButtonDisplay}>
                                        <TouchableOpacity style={styles.stationChangeButton} onPress={searchStations}>
                                            <Text style={styles.stationChangeText}>Change Station</Text>
                                            <Icon name="swap" size={15}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            <View style={styles.stationPricesDisplay}>
                                <Text style={styles.stationPrice}>Petrol: €{petrolPriceOne}.{petrolPriceTwo}{petrolPriceThree}</Text>
                                <Text style={styles.stationPrice}>Diesel: €{dieselPriceOne}.{dieselPriceTwo}{dieselPriceThree}</Text>
                            </View>
                                <Text style={styles.stationUpdate}>Last Updated: {lastUpdate}</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.stationBox}>
                            <FlatList
                                data={stations}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                    style={[
                                        styles.stationItem, 
                                        item.station_id === station.station_id ? styles.selectedStation : null
                                    ]} 
                                    onPress={() => setSelectedStation(item.station_id)}
                                    >
                                        <Text>{item.station_brand}</Text>
                                        <Text>{item.location_name}</Text>
                                        <Text>Petrol: {item.pet_price}</Text>
                                        <Text>Diesel: {item.die_price}</Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item.station_id.toString()}
                            />
                        </View>
                    )}
                        <Image source={{ uri: capturedImage }} style={styles.modalImage} />
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={styles.confirmImageButton}onPress={() => {
                                submitPicture()
                                }}>
                                <Icon name="check" color={'white'} size={30}></Icon>
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelImageButton}onPress={() => {
                                setModalVisible(false);
                                setChangeStation(false);
                                setCapturedImage("");
                                }}>
                                <Icon name="close" color={'white'} size={30}></Icon>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                </>
            ) : (
                <ActivityIndicator size="large" color="#0000ff"/>
            )}
            
        </View>

          
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(236, 236, 236, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closePageButton: {
        position: 'absolute',
        width: 30,
        height: 30,
        right: 9,
        top: 6,
        zIndex: 1,
        elevation: 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 15,
        },
    closeButtonText: {
        color: "white",
        fontSize: 20,
    },
    camera: {
        width:"100%",
        height: "80%"
    },
    previewImage: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
    },
    buttonContainer: {
        flexDirection: 'row',
        height: '10%',
        width: '100%'
    },
    captureImageButton: {
        height: '100%',
        width: '50%',
        backgroundColor: 'rgba(175,230,175, 1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectImageButton: {
        height: '100%',
        width: '50%',
        backgroundColor: 'rgba(201,201,201, 1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 1)',
    },
    modalImage: {
        width: '100%',
        height: '70%',
        resizeMode: 'contain',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '80%',
    },
    confirmImageButton: {
        width: 75,
        height: 75,
        borderRadius: 10,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(175,230,175, 1)',
    },
    cancelImageButton: {
        width: 75,
        height: 75,
        borderRadius: 10,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,116,120, 1)',
    }
    ,
    stationBox: {
        height: 150,
        width: "90%",
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "rgba(175,225,175, 1)",
        borderRadius: 10,
        elevation: 10,
        justifyContent: "center",
        alignItems: "center"

    },
    stationBoxDisplay: {
        width: '95%',
        height: '95%',
    },
    stationTitleDisplay: {
        borderBottomWidth: 1,
        flexDirection: 'row',
        borderColor: "rgba(175,225,175, 1)"
    },
    stationTitle: {
        width: "75%"
    },
    stationBrand: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    stationLocation: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    stationChangeButtonDisplay: {
        left: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 35,
        width: 70,
        borderRadius: 5,
        backgroundColor: 'rgba(155,217,244, 1)',
        borderWidth: 0.3,
        elevation: 5,

    },
    stationChangeButton: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stationChangeText: {
        fontSize: 8,
        fontWeight: 'bold'
    },
    stationPricesDisplay: {
        marginTop: 10,
    },
    stationPrice: {
        fontSize: 16,
        marginBottom: 10,
    },
    stationUpdate: {
        position: 'relative',
        fontSize: 12,
        top: 5,
    },
    stationItem: {
        height: 100,
        width: 300,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'black',
        marginBottom: 10,
        padding: 5,
    },
    selectedStation: {
        backgroundColor: '#75d1e2', 
    },
    submissionModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    submissionModalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    submissionModalTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold'
    },
    submissionModalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    submissionModalButtonBox: {
        marginTop: 10,
        padding: 10,
        width: '100%',
        flexDirection: "row",
        justifyContent: 'space-evenly',
    },
    submissionModalButtonConfirm: {
        backgroundColor: 'rgba(175,230,175, 1)',
        height: 50,
        width: '30%',
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    submissionModalButtonChange: {
        backgroundColor: 'rgba(255,116,120, 1)',
        height: 50,
        width: '30%',
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    submissionModalButtonChangeAlternate: {
        backgroundColor: 'rgba(255,116,120, 1)',
        height: 50,
        width: 300,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    submissionModalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
});

export default CameraPage;
