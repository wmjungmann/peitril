import React, {useEffect, useState} from "react"
import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, BackHandler, View, TouchableOpacity, Text, TextInput, KeyboardAvoidingView, Pressable, Modal, FlatList, Alert} from "react-native"
import Icon from 'react-native-vector-icons/AntDesign'
import * as Location from 'expo-location'


const ChangeImagePrice = () => {
    const [petrolPriceOne, setPetrolPriceOne] = useState('0');
    const [petrolPriceTwo, setPetrolPriceTwo] = useState('0');
    const [petrolPriceThree, setPetrolPriceThree] = useState('0');
    const [dieselPriceOne, setDieselPriceOne] = useState('0');
    const [dieselPriceTwo, setDieselPriceTwo] = useState('0');
    const [dieselPriceThree, setDieselPriceThree] = useState('0');
    const [petrolParseOne, setPetrolParseOne] = useState('0');
    const [petrolParseTwo, setPetrolParseTwo] = useState('0');
    const [petrolParseThree, setPetrolParseThree] = useState('0');
    const [dieselParseOne, setDieselParseOne] = useState('0');
    const [dieselParseTwo, setDieselParseTwo] = useState('0');
    const [dieselParseThree, setDieselParseThree] = useState('0');
    const [petrolUpdateOne, setPetrolUpdateOne] = useState('');
    const [petrolUpdateTwo, setPetrolUpdateTwo] = useState('');
    const [petrolUpdateThree, setPetrolUpdateThree] = useState('');
    const [dieselUpdateOne, setDieselUpdateOne] = useState('');
    const [dieselUpdateTwo, setDieselUpdateTwo] = useState('');
    const [dieselUpdateThree, setDieselUpdateThree] = useState('');
    const [lastUpdate, setLastUpdate] = useState('');
    const [station, setStation] = useState<any>({});
    const [chosenStationId, setChosenStationId] = useState("");
    const { chosenStation, modalPetrolPrice, modalDieselPrice } = useLocalSearchParams();

    useEffect(() => {
        if(chosenStation){
            console.log(chosenStation);
            setChosenStationId(chosenStation[0])
        }
        else {
            setChosenStationId("0");
        };

        setSelectedStation();


        if(modalPetrolPrice != "0") {
            parsePrice();
        }



    }, []);

    const setSelectedStation = async () => {
        try{
            console.log(chosenStationId)
            const stationResp = await fetch(`http://192.168.1.8:5000/get_station`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    station_id: chosenStation
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
                    station_id: chosenStation
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

    const parsePrice = async () => {
        try{
            const priceResp = await fetch(`http://192.168.1.8:5000/parse_price`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    petrol_price: modalPetrolPrice,
                    diesel_price: modalDieselPrice
                })
            })
            if (!priceResp.ok) {
                console.log("Failed to fetch stations");
                return;
            }

            const priceData = await priceResp.json();

            setPetrolParseOne(priceData.p1);
            setPetrolParseTwo(priceData.p2);
            setPetrolParseThree(priceData.p3);
            setDieselParseOne(priceData.d1);
            setDieselParseTwo(priceData.d2);
            setDieselParseThree(priceData.d3);
        }catch(error) {
            console.error("Error in setSelectedStation:", error);
        }

        
    };

    const handleSavePrices = async () => {
        // Process the updated prices here
        let petrolPriceTotal = petrolParseOne + '.' + petrolParseTwo + petrolParseThree
        let dieselPriceTotal = dieselParseOne + '.' + dieselParseTwo + dieselParseThree

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

            Alert.alert('Success', 'Prices saved successfully', [
                { text: 'OK', onPress: () => router.replace('./MapPage') }
            ]);


            console.log(newPriceMessage)

        }catch(error) {
            console.error("Error in setSelectedStation:", error);
        }

        console.log('Updated Petrol Price:', petrolPriceTotal);
        console.log('Updated Diesel Price:', dieselPriceTotal);
    };

    return(
        <KeyboardAvoidingView style={styles.container} behavior="height">
            <View style={styles.stationBox}>
                <View style={styles.stationBoxDisplay}>
                    <View style={styles.stationTitleDisplay}>
                        <View style={styles.stationTitle}>
                            <Text style={styles.stationBrand}>{station.station_brand}</Text>
                            <Text style={styles.stationLocation}>{station.location_name}</Text>
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
                            placeholder={petrolParseOne}
                            value={petrolParseOne}
                            maxLength={1}
                            onChangeText={(text) => setPetrolParseOne(text)}
                        />
                        <Text style={{fontSize: 50}}>.</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder={petrolParseTwo}
                            value={petrolParseTwo}
                            maxLength={1}
                            onChangeText={(text) => setPetrolParseTwo(text)}
                        />
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder={petrolParseThree}
                            value={petrolParseThree}
                            maxLength={1}
                            onChangeText={(text) => setPetrolParseThree(text)}
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
                            value={dieselParseOne}
                            maxLength={1}
                            onChangeText={(text) => setDieselParseOne(text)}
                        />
                        <Text style={{fontSize: 50}}>.</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={dieselParseTwo}
                            maxLength={1}
                            onChangeText={(text) => setDieselParseTwo(text)}
                        />
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={dieselParseThree}
                            maxLength={1}
                            onChangeText={(text) => setDieselParseThree(text)}
                        />
                    </View>
                </View>
            </View>
            <Pressable style={styles.saveBox} onPress={handleSavePrices}>
                <Text style={styles.saveBoxText}>SAVE</Text>
            </Pressable>
        </KeyboardAvoidingView >
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(236, 236, 236, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
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
        width: '50%',
        height: 75,
        bottom: 100,
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
        borderColor: 'black',
        marginBottom: 10,
        padding: 5,
    },
    selectedStation: {
        backgroundColor: 'yellow', // Choose your desired highlight color
    },
});

export default ChangeImagePrice;