import React, {useEffect, useState} from "react"
import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, View, TouchableOpacity, Text} from "react-native"
import Icon from 'react-native-vector-icons/AntDesign'


const ReportPrice = () => {

    const [chosenStationId, setChosenStationId] = useState("");
    const { chosen_station_id } = useLocalSearchParams();

    useEffect(() => {
        if (chosen_station_id) {
            setChosenStationId(chosen_station_id.toString());
        }
        else {
            setChosenStationId("0");
        }
      }, [chosen_station_id]);

    return(
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={() => {router.back()}}>
                <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <View style={styles.selectionButtons}>
                <TouchableOpacity style={styles.selectionCamera} onPress={() => {router.push({pathname: './CameraPrice', params: {chosenStationId}})}}> 
                    <Icon name='camera' color='white' size={100}></Icon> 
                    <Text style={styles.selectionText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.selectionInput} onPress={() => {router.push({pathname: './TextPrice', params: {chosenStationId}})}}>
                    <Icon name='edit' color='white' size={100}></Icon> 
                    <Text style={styles.selectionText}>Text</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
   
};

// Style Sheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(236, 236, 236, 0.8)',
        alignItems: "center",
        justifyContent: "center",
    },
    closeButton: {
        position: "absolute",
        top: 6,
        right: 9,
        width: 30,
        height: 30,
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
    selectionButtons: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 350,
        height: 600,

    },
    selectionButtonsInner: {
        width:350,
        height:595,
        borderWidth: 1,
    },
    selectionCamera: {
        width: '100%',
        height: '50%',
        backgroundColor: '#AFE1AF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        borderRadius: 10,
        borderWidth: 3,
        elevation: 10
    },
    selectionInput: {
        width: '100%',
        height: '50%',
        backgroundColor: '#AFE1AF',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 3,
        elevation: 10
    },
    selectionText: {
        fontWeight: 'bold',
        color: 'white',
        fontSize:  50,
    },
});

export default ReportPrice;