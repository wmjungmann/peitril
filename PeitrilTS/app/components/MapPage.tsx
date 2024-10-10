import React, {useEffect, useState} from "react"
import { StyleSheet, View, TouchableOpacity, Text, Modal, ActivityIndicator} from "react-native"
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps'
import * as Location from 'expo-location'
import Icon from 'react-native-vector-icons/AntDesign'
import IconEntypo from 'react-native-vector-icons/Entypo'
import { Callout } from "react-native-maps"
import { router } from "expo-router"

type RegionObjectCoords = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}; 

const MapPage = () => {
  
  const [initialRegion, setInitialRegion] = useState<RegionObjectCoords>({
    latitude: 53.1935396582192, 
    longitude: -8.185652398048035,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });


  const [stations, setStations] = useState([]);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(false);
  
  //Set the initial cordinates
  useEffect(() => {

    const getRegionStations = async () => {
      try{
        let latitude, longitude;
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("Location permission denied");

          // Set options for backend to show all stations
          let latitude = 9999;
          let longitude = 9999;

          setInitialRegion({
            latitude: 53.1935396582192, 
            longitude: -8.185652398048035,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });

        }
        else{
          //setCurrentLocation(location.coords);
          let location = await Location.getCurrentPositionAsync({});
          
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;

          setInitialRegion({
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }

        // Retrieve user preferences
        const prefResp = await fetch("http://192.168.1.8:5000/mapPreferences")
        if (!prefResp.ok) {
          console.log("Failed to fetch preferences");
          return;
        }
        const pref = await prefResp.json();

        if(pref.type === "Registered") {
          setUser(true)
        }

        console.log("Preferences set")

        console.log(pref.distPref)

        const stationsResp = await fetch(`http://192.168.1.8:5000/get_stations`, {
          method: 'post',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ longitude, latitude}),
        });

        if (!stationsResp.ok) {
          console.log("Failed to fetch stations");
          return;
        }
        const stationsData = await stationsResp.json();
        setStations(stationsData);
        setLoading(false)
        console.log(stationsData)
      } catch (error) {
        console.log(error);
      }
    };
    
    getRegionStations();

  }, []);

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  const updatePrice = async (chosen_station_id: string)=> {
    router.push({ pathname: './ReportPrice', params: {chosen_station_id}})
  };

  const logoutUser = async () => {
    try{
      await fetch("http://192.168.1.8:5000/logout");
      router.replace('./Login');
    }
    catch (error){
      console.log(error)
    }
  };

  const renderMarkers = () => {
       return stations.map((marker: any) =>   
        <Marker
          key={marker.station_id}
          coordinate={{latitude: marker.x_coord, longitude: marker.y_coord}}
          pinColor={marker.colour}
        >
          <Callout onPress={() => updatePrice(marker.station_id)}>
            <View style={styles.calloutContainer}>
              <View style={styles.calloutTop}>
                <View style={styles.calloutTopTitle}>
                  <Text style={styles.calloutTitle}>{marker.station_brand}</Text>
                  <Text style={styles.calloutSubtitle}>{marker.location_name}</Text>
                </View>
                <TouchableOpacity style={styles.calloutSubmit}>
                  <Text style={styles.calloutSubmitText}>Submit Price</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calloutPriceBox}>
                <Text style={styles.calloutPrice}>Petrol: €{marker.pet_price}</Text>
                <Text style={styles.calloutPrice}>Diesel: €{marker.die_price}</Text>
              </View>
              <View style={styles.calloutDateBox}>
                <Text style={styles.calloutDateTitle}>Updated: </Text>
                <Text style={styles.calloutDate}>{marker.date}</Text>
              </View>
            </View>
          </Callout>
        </Marker>
      ) ;
  };


  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff"/>
        ) : (
          <>
            <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation = {true} followsUserLocation = {true} provider = {PROVIDER_GOOGLE} customMapStyle={mapStyle}>
            {
              renderMarkers()
            }
            </MapView>

            <View style={styles.userButton}>

              <TouchableOpacity style={styles.button} onPress={toggleMenu}>
                <View style={styles.buttonInnerStyle}>
                    <View style={styles.buttonCenterStyle}>
                      <IconEntypo name="menu" size={40}></IconEntypo>
                      <Text style={styles.menuButtonText}>MENU</Text>
                    </View>
                </View>
              </TouchableOpacity>

              {/* Menu */} 
              <Modal
              animationType="fade"
              transparent={true}
              visible={isMenuVisible}
              onRequestClose={toggleMenu}
              >
                <View style={styles.modalContainer}>
                  {/* Menu Items */} 
                  <View style={styles.modalContent}>
                      <Text style={styles.menuTitle}>PEITRIL</Text>
                      <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
                          <Text style={styles.closeButtonText}>X</Text>
                      </TouchableOpacity>
                      {user ? (
                        <>
                          <TouchableOpacity onPress={() => {router.push('./ReportPrice')}}>
                            <View style={styles.menuItem}>
                                <Icon name="exclamationcircle" size={25} color="red" style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Report Price</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => {router.push('./AddStation')}}>
                            <View style={styles.menuItem} >
                                <Icon name="pluscircle" size={25} color="#75d1e2" style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Add Station</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => {router.push('./Account')}}>
                            <View style={styles.menuItem}>
                                <IconEntypo name="user" size={25} color="#AFE1AF" style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>My Account</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={logoutUser}>
                            <View style={styles.menuItem}>
                                <Icon name="logout" size={25} color="black" style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Sign Out</Text>
                            </View>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity disabled={true}>
                            <View style={styles.menuItem}>
                                <Icon name="lock" size={25} color="gray" style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Report Price</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity disabled={true}>
                            <View style={styles.menuItem}>
                                <Icon name="lock" size={25} color="gray" style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Add Station</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity disabled={true}>
                            <View style={styles.menuItem}>
                                <Icon name="lock" size={25} color="gray" style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Account</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={logoutUser}>
                            <View style={styles.menuItem}>
                                <Icon name="user" size={25} color="black" style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Sign In</Text>
                            </View>
                            
                          </TouchableOpacity>
                          <Text>Sign in to access all features</Text>
                        </>
                      )}
                  </View>
                </View>
              </Modal>
            </View>
          </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  userButton: {
    height: '15%',
    padding: 20,
    position: "absolute",
    bottom:20,
    left:20
  },
  button: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black', 
    height: 87,
    width: 87,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "flex-end",
    elevation: 10
  },
  buttonInnerStyle: {
    borderColor: '#AFE1AF',
    borderWidth: 6,
    height: 85,
    width: 85,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  buttonCenterStyle: {
    borderColor: 'black',
    backgroundColor: '#AFE1AF',
    borderWidth: 0.5,
    height: 80,
    width: 80,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontWeight: 'bold',
    bottom: 5,
    fontSize: 10,
  },
  modalContainer: {
    position: "absolute",
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 10 ,
    borderWidth: 0.5,
    borderRadius: 10,
    width: "60%",
    elevation: 5,
  },
  menuTitle: {
    fontSize: 30,
    color: '#AFE1AF',
    fontWeight: 'bold',
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 15,
  },
  closeButtonText: {
    color: "white",
    fontSize: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  menuItemIcon: {
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  calloutContainer: {
    width: 200,
    padding: 10,
    backgroundColor: 'white',
  },
  calloutTop: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  calloutTopTitle: {
    width: "65%",
  },
  calloutSubmit: {
    position: 'relative',
    elevation: 5,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center' ,
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#AFE1AF'
  },
  calloutSubmitText: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  calloutSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  calloutPriceBox: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "black"
  },
  calloutPrice: {
    
  },
  calloutDateBox: {
    flexDirection: 'row',
  },
  calloutDate: {
    fontSize: 10,
    width: "70%",
  },
  calloutDateTitle: {
    fontSize: 10,
    width: "30%",
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

export default MapPage;