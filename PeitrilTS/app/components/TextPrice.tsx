import React, {useEffect, useState} from "react"
import { router, useLocalSearchParams } from "expo-router"
import { 
    StyleSheet, BackHandler, View, 
    TouchableOpacity, Text, TextInput, 
    KeyboardAvoidingView, Pressable, Modal, 
    FlatList, Alert, TouchableWithoutFeedback,
    Keyboard
} from "react-native"
import Icon from 'react-native-vector-icons/AntDesign'
import IconEntypo from 'react-native-vector-icons/Entypo'
import * as Location from 'expo-location'


const TextPrice = () => {
    const [petrolPriceOne, setPetrolPriceOne] = useState('');
    const [petrolPriceTwo, setPetrolPriceTwo] = useState('');
    const [petrolPriceThree, setPetrolPriceThree] = useState('');
    const [dieselPriceOne, setDieselPriceOne] = useState('');
    const [dieselPriceTwo, setDieselPriceTwo] = useState('');
    const [dieselPriceThree, setDieselPriceThree] = useState('');
    const [lastUpdate, setLastUpdate] = useState('');
    const [station, setStation] = useState<any>({});
    const [stations, setStations] = useState<any>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [userLocation, setUserLocation] = useState<any>({});
    const [newPriceChange, setNewPriceChange] = useState(false);
    const [chosenStation, setChosenStationId] = useState("");

    const { chosenStationId } = useLocalSearchParams();

    useEffect(() => {

        setNewPriceChange(false);

        if(chosenStationId){
            setChosenStationId(chosenStationId.toString())
        } else {
            setChosenStationId("0")
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            handleBackButtonPress
        );

        closestStation();


        return () => backHandler.remove();

    }, []);

    const handleBackButtonPress = () => {
        if(modalVisible) {
            setModalVisible(false);
            return true;
        }
        else{
            if(newPriceChange) {
                router.replace("./MapPage");
            }
            else {
                setNewPriceChange(false);
                router.back();
            }
        }
        
    };

    const closestStation = async () => {
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
                    console.log("Failed to fetch station");
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
                    console.log("Failed to fetch station");
                    return;
                }
    
                const stationData = await stationResp.json();
    
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
            setModalVisible(true);
          } catch (error) {
            console.log(error);
          }
    };

    const closeSearchStations = () => {
        setModalVisible(false);
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

    const handleSavePrices = async () => {
        // Process the updated prices here
        let petrolPriceTotal = petrolPriceOne + '.' + petrolPriceTwo + petrolPriceThree
        let dieselPriceTotal = dieselPriceOne + '.' + dieselPriceTwo + dieselPriceThree

        try{
            console.log(station.station_id)
            const newPriceResp = await fetch(`http://192.168.1.8:5000/add_price`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    station_id: station.station_id,
                    petrol_price: petrolPriceTotal,
                    diesel_price: dieselPriceTotal 
                })
            })
            if (!newPriceResp.ok) {
                console.log("Failed to fetch station");
                return;
            }

            const newPriceMessage = await newPriceResp.json();

            setNewPriceChange(true);

            Alert.alert('Success', 'Prices saved successfully', [
                { text: 'OK', onPress: () => router.replace("./MapPage")}
            ]);

        }catch(error) {
            console.error("Error in setSelectedStation:", error);
        }

    };

    return(

            <KeyboardAvoidingView style={styles.container} behavior="height">
                <TouchableOpacity style={styles.closePageButton} onPress={() => {router.back()}}>
                    <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
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
                <View style={styles.fuelBox}>
                    <View style={styles.petrolBox}>
                        <View style={styles.inputLabelDisplay}>
                            <Text style={styles.inputLabel}>Petrol</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={{fontSize: 50}}>€ </Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={petrolPriceOne}
                                maxLength={1}
                                onChangeText={(text) => setPetrolPriceOne(text)}
                            />
                            <Text style={{fontSize: 50}}>.</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={petrolPriceTwo}
                                maxLength={1}
                                onChangeText={(text) => setPetrolPriceTwo(text)}
                            />
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={petrolPriceThree}
                                maxLength={1}
                                onChangeText={(text) => setPetrolPriceThree(text)}
                            />
                        </View>
                    </View>
                    <View style={styles.dieselBox}>
                        <View style={styles.inputLabelDisplay}>
                            <Text style={styles.inputLabel}>Diesel</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={{fontSize: 50}}>€ </Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={dieselPriceOne}
                                maxLength={1}
                                onChangeText={(text) => setDieselPriceOne(text)}
                            />
                            <Text style={{fontSize: 50}}>.</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={dieselPriceTwo}
                                maxLength={1}
                                onChangeText={(text) => setDieselPriceTwo(text)}
                            />
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={dieselPriceThree}
                                maxLength={1}
                                onChangeText={(text) => setDieselPriceThree(text)}
                            />
                        </View>
                    </View>
                </View>
                <Pressable style={styles.saveBox} onPress={handleSavePrices}>
                    <Text style={styles.saveBoxText}>SAVE</Text>
                </Pressable>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={closeSearchStations}
                >
                    <View style={styles.modalView}>
                        <View style={styles.modalExit}>
                            <TouchableOpacity style={styles.closeButton} onPress={closeSearchStations}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
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
                                    <View style={styles.stationItemDisplay}>
                                        <View style={styles.stationItemContent}>
                                            <Text style={styles.stationItemTitle}>{item.station_brand}</Text>
                                            <Text style={styles.stationItemSubtitle}>{item.location_name}</Text>
                                            <Text style={styles.stationItemPrice}>Petrol: {item.pet_price}</Text>
                                            <Text style={styles.stationItemPrice}>Diesel: {item.die_price}</Text>
                                        </View>
                                        <IconEntypo name="location-pin" size={40} color={item.colour}></IconEntypo>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.station_id.toString()}
                        />
                    </View>
                </Modal>
            </KeyboardAvoidingView>


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
        width: 30,
        height: 30,
        left: 168,
        top: 16,
        zIndex: 1,
        elevation: 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 15,
    },
    stationBox: {
        height: 150,
        top: 50,
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
    fuelBox: {
        flexDirection: 'column',
        height: '80%',
        width: '100%',
        alignItems: 'center',
        top: 50,
    },
    petrolBox: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 50,
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        elevation: 5,
        backgroundColor: 'rgba(175,225,175, 1)'
    },
    dieselBox: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 50,
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        elevation: 5,
        backgroundColor: 'rgba(244,241,155, 1)'
    },
    inputLabelDisplay: {
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        bottom: 10,
    },
    inputLabel: {
        fontWeight: 'bold',
        fontSize: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    input: {
        width: 60,
        height: 80,
        fontWeight: 'bold',
        fontSize: 30,
        borderWidth: 1,
        borderColor: 'black',
        textAlign: 'center',
        backgroundColor: 'white'
    },
    saveBox: {
        position: 'absolute',
        width: '50%',
        height: 75,
        bottom: 50,
        backgroundColor: 'rgba(175,225,175, 1)',
        borderRadius: 10,
        justifyContent: 'center',
        elevation: 10,
        alignItems: 'center',
        borderWidth: 0.3
    },
    saveBoxText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalView: {
        margin: 20,
        height: '90%',
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        alignItems: "center",
        elevation: 5
    },
    modalExit: {
        marginBottom: 5,
    },
    closeButton: {
        width: 30,
        height: 30,
        left: 140,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 15,
    },
    closeButtonText: {
        color: "white",
        fontSize: 20,
    },
    stationItem: {
        height: 100,
        width: 300,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'black',
        marginBottom: 10,
        padding: 5,
        //elevation: 1,
        backgroundColor: 'rgba(228, 225, 225, 0.8)'
    },
    stationItemDisplay: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    stationItemContent: {
        width: "70%"
    },
    stationItemTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    stationItemSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    stationItemPrice: {
        fontSize: 16
    },
    selectedStation: {
        backgroundColor: '#75d1e2', 
    },
});

export default TextPrice;