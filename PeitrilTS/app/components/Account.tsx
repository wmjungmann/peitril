import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,FlatList, Modal} from 'react-native';
import { router} from 'expo-router';
import Icon from 'react-native-vector-icons/AntDesign'
import IconEntypo from 'react-native-vector-icons/Entypo'
import Slider from '@react-native-community/slider'
import * as Location from 'expo-location'

type accountInfo = {
  firstName: string;
  secondName: string;
  email: string;
  pricePref: number;
  distPref: number;
};


const AccountPage = () => {
  const [account, setAccount] = useState<accountInfo>({
    firstName: "",
    secondName: "",
    email: "",
    pricePref: 0,
    distPref: 0,
  });
  const [distanceValue, setDistanceValue] = useState(account.distPref);
  const [priceValue, setPriceValue] = useState(account.pricePref);
  const [saveSuccess, setSaveSuccess] = useState(false); 
  const [favourites, setFavourites] = useState<any>([]);
  const [favouritesControl, setFavouritesControl] = useState(true);
  const [stations, setStations] = useState<any>([])
  const [modalVisible, setModalVisible] = useState(false)


  useEffect(() => {
    const getAccountInfo = async() => {


      try {
        const resp = await fetch("http://192.168.1.8:5000/@current_account");
        if ( resp.ok ) {
          const accountData = await resp.json()
          setAccount(accountData); 
          setDistanceValue(accountData.distPref);
          setPriceValue(accountData.pricePref);
        } else {
          console.log("No user logged in")
        }

        const favResp = await fetch("http://192.168.1.8:5000/get_favourites");
        if(favResp.ok) {
          const favData = await favResp.json()
          
          if(Array.isArray(favData) && favData.length > 0) {
            setFavourites(favData);
            setFavouritesControl(true);
          } else {
            console.log("No favorite stations found.");
            // Handle the case where no favorite stations are found
            setFavouritesControl(false); // Set favouritesControl to false since no favorite stations are found
          }

          
        } else {
          console.log("Favourites not retrieved");
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAccountInfo();

  }, []);

  const storePreferences = async () => {
    try {
  
      const response = await fetch("http://192.168.1.8:5000/update_preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pricePref: priceValue,
          distPref: distanceValue
        })
      });
  
      if (response.ok) {
        console.log("Preferences stored successfully.");
        setSaveSuccess(true); // Set save success to true
        // Reset save success after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
      } else {
        console.error("Failed to store preferences:", response.statusText);
      }
    } catch (error) {
      console.error("Error storing preferences:", error);
    }
  };

  const searchStations = async () => {
    try{
        let location = await Location.getCurrentPositionAsync({});
        let latitude = location.coords.latitude;
        let longitude = location.coords.longitude;

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
        setModalVisible(true);
      } catch (error) {
        console.log(error);
      }
  };

  const addFavourite = async (station_id:string) => {
    try {
      const favResponse = await fetch("http://192.168.1.8:5000/add_favourite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          station_id
        })
      });
  
      if (favResponse.ok) {
        console.log("Preferences stored successfully.");

        setFavouritesControl(true);

        const newFavoriteStation = stations.find((station:any) => station.station_id === station_id);

        if (newFavoriteStation) {
          // Update the favorites state by adding the new favorite station
          setFavourites((prevFavourites:any) => [
            ...prevFavourites,
            newFavoriteStation
          ]);
        }
      } else {
        console.error("Failed to delete favourite:",favResponse.statusText);
      }
    } catch (error) {
      console.error("Error storing preferences:", error);
    }
  };

  const removeFavourite = async (station_id:string) => {
    try {
      const favResponse = await fetch("http://192.168.1.8:5000/remove_favourite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          station_id
        })
      });
  
      if (favResponse.ok) {
        console.log("Preferences stored successfully.");

        //Remove station from the favourites object
        setFavourites((prevFavourites: any) => {
          const newFavourites = prevFavourites.filter((fav: any) => fav.station_id !== station_id)
          
          if(newFavourites.length === 0) {
            setFavouritesControl(false);
          }
          return newFavourites;
        });
        

      } else {
        console.error("Failed to delete favourite:",favResponse.statusText);
      }
    } catch (error) {
      console.error("Error storing preferences:", error);
    }
  };

  const isFavorited = (station_id: string) => {
    return favourites && favourites.some((fav: any) => fav.station_id === station_id);
  };

  const closeSearchStations = () => {
    setModalVisible(false);
  };
   
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => {router.back()}}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
      <View style={styles.headerName}>
        <View style={styles.profileHeader}>
          <IconEntypo name="user" size={100} color="#AFE1AF" style={styles.profileIcon}/>
        </View>
        <View style={styles.userNameBox}>
          <Text style={styles.username}>{account.firstName} {account.secondName}</Text>
          <Text style={styles.email}>{account.email}</Text>
        </View>
      </View>
      <View style={styles.favouritesBox}>
        <View style={styles.favouritesTitle}>
          <Text style={styles.title}>Favourites</Text>
          <TouchableOpacity style={styles.addFavouritesButton} onPress={searchStations}>
            <Text style={styles.addFavouritesButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.favouritesContent}>
          {favouritesControl ? (
            <FlatList
            data={favourites}
            renderItem={({ item }) => (
              <View style={styles.stationItem}>
                <View style={styles.stationItemDisplay}>
                    <View style={styles.stationItemContent}>
                        <Text style={styles.stationItemTitle}>{item.station_brand}</Text>
                        <Text style={styles.stationItemSubtitle}>{item.location_name}</Text>
                        <Text style={styles.stationItemPrice}>Petrol: {item.pet_price}</Text>
                        <Text style={styles.stationItemPrice}>Diesel: {item.die_price}</Text>
                    </View>
                    <IconEntypo name="location-pin" size={60} color={item.colour} style={{left: 30}}></IconEntypo>
                    <TouchableOpacity style={styles.removeButton} onPress={() => removeFavourite(item.station_id)}>
                      <Text style={styles.removeButtonText}>X</Text>
                    </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.station_id.toString()}
            /> ) : (
              <>
              <Text style={styles.noFavouritesText}>Add favourite stations and display them here!</Text>
              <Icon name='smileo' size={30} color='gray'/>
              </>                  
          )}
        </View>
      </View>
      <View style={styles.settings}>
        <Text style={styles.title}>Map Settings</Text>
        <Text style={styles.label}>Distance: {distanceValue}km</Text>
        <View style={styles.sliderBox}>
          <Text style={styles.sliderNumber}>  1</Text>
          <Slider
            style={styles.slider}
            value={account.distPref}
            minimumValue={1}
            maximumValue={20}
            step={0.5}
            tapToSeek={true}
            thumbTintColor='rgba(175,225,175, 1)'
            minimumTrackTintColor='rgba(175,225,175, 1)'
            onValueChange={(value) => setDistanceValue(value)}
          />
          <Text style={styles.sliderNumber}>20</Text>
        </View>
        <Text style={styles.label}>Price: €{priceValue.toFixed(2)}</Text>
        <View style={styles.sliderBox}>
          <Text style={styles.sliderNumber}>€1</Text>
          <Slider
            style={styles.slider}
            value={account.pricePref}
            minimumValue={1}
            maximumValue={3}
            step={0.01}
            tapToSeek={true}
            thumbTintColor='rgba(175,225,175, 1)'
            minimumTrackTintColor='rgba(175,225,175, 1)'
            onValueChange={(value) => setPriceValue(value)}
          />
          <Text style={styles.sliderNumber}>€3</Text>
        </View>
        <TouchableOpacity style={styles.saveBox} onPress={storePreferences}>
          <Text style={styles.saveBoxText}>Save Preferences</Text>
        </TouchableOpacity>
        {saveSuccess && <Text style={styles.saveSuccessMessage}>Preferences saved successfully!</Text>}
      </View>
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeSearchStations}
      >
        <View style={styles.modalView}>
            <View style={styles.modalExit}>
                <TouchableOpacity style={styles.closeModalButton} onPress={closeSearchStations}>
                    <Text style={styles.closeModalButtonText}>X</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={stations}
                renderItem={({ item }) => (
                    <View style={styles.stationItem}>
                        <View style={styles.stationItemDisplay}>
                            <View style={styles.stationItemContent}>
                                <Text style={styles.stationItemTitle}>{item.station_brand}</Text>
                                <Text style={styles.stationItemSubtitle}>{item.location_name}</Text>
                                <Text style={styles.stationItemPrice}>Petrol: {item.pet_price}</Text>
                                <Text style={styles.stationItemPrice}>Diesel: {item.die_price}</Text>
                            </View>
                            <IconEntypo name="location-pin" size={50} color={item.colour}></IconEntypo>
                            <TouchableOpacity 
                              style={styles.modalAddFavouriteButton}
                              onPress={() => {
                                isFavorited(item.station_id) ? removeFavourite(item.station_id) : addFavourite(item.station_id);
                              }}>
                                  <Text style={styles.modalAddFavouriteButtonText}>
                                    {isFavorited(item.station_id) ? "Remove" : "Add"}
                                  </Text>
                                  <IconEntypo name="star" size={30} color={isFavorited(item.station_id) ? "yellow" : "white"}></IconEntypo>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.station_id.toString()}
            />
        </View>
    </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(236, 236, 236, 0.8)',
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  closeButton: {
    position: 'absolute',
    width: 30,
    height: 30,
    top: 10,
    right: 10,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 15,
    elevation: 5, 
  },
  closeButtonText: {
    color: "white",
    fontSize: 20,
  },
  headerName: {
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "50%",
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  userNameBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 0,
  },
  email: {
    fontSize: 16,
  },
  profileIcon: {
    width: 150,
    height: 150,
    left: 30,
    top: 20,
  },
  favouritesBox: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingBottom: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(175,225,175, 1)',
    elevation: 5,
    width: '100%',
    height: 275,
    alignItems: 'center',
  },
  favouritesTitle: {
    
  },
  addFavouritesButton: {
    position: 'absolute',
    left: 155,
    bottom: 5,
    backgroundColor: 'rgba(175,225,175, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 30,
    borderRadius: 10,
    elevation: 5
  },
  addFavouritesButtonText: {
    fontWeight: 'bold'
  },
  favouritesContent: {
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  noFavouritesText: {
    color: 'gray',
    paddingBottom: 10,
  },
  settings: {
    position: 'absolute',
    width: '100%',
    borderRadius: 10,
    bottom: 20,
    left: 20,
    padding: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(175,225,175, 1)',
    //borderTopWidth: 1,
    //borderBottomWidth: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 10,
  },
  saveBox: {
    width: '40%',
    height: 50,
    backgroundColor: 'rgba(175,225,175, 1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    margin: '2.5%',
  },
  saveBoxText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sliderBox: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  slider: {
    width: 300,
  },
  sliderNumber: {
    fontWeight: 'bold'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveSuccessMessage: {

  },
  stationItem: {
    height: 90,
    width: 300,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'rgba(175,225,175, 1)',
    marginBottom: 10,
    padding: 5,
    //elevation: 1,
    backgroundColor: 'rgba(236, 236, 236, 0.8)'
  },
  stationItemDisplay: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  stationItemContent: {
      width: "60%"
  },
  removeButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.8)',
    height: 20,
    width: 20,
    left: 40,
    bottom: 28,
    elevation: 5,
    justifyContent: 'center',
    borderRadius: 100,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold'
  },
  stationItemTitle: {
      fontSize: 14,
      fontWeight: 'bold'
  },
  stationItemSubtitle: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 5,
  },
  stationItemPrice: {
      fontSize: 12
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
  closeModalButton: {
    backgroundColor: 'rgba(175,225,175, 1)',
    width: 30,
    height: 30,
    borderRadius: 200,
    left: 150,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeModalButtonText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalExit: {
      marginBottom: 5,
  },
  modalAddFavouriteButton: {
    backgroundColor: '#75d1e2',
    height: 50,
    width: 50,
    borderRadius: 10,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalAddFavouriteButtonText: {
    fontSize: 12,
  },
});

export default AccountPage;
