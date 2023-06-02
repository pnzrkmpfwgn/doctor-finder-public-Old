import { GoogleMap,useLoadScript, MarkerF } from "@react-google-maps/api";
import classes from '../../styles/mapStyles.module.css';
import { useDispatch, useSelector } from "react-redux";
import user_location, { setLocationData } from "../../redux/user_location";
import { useEffect,useState,useMemo } from "react";
import {useCookies} from 'react-cookie';
import {doc,setDoc} from 'firebase/firestore';
import {db, useAuth} from '../../firebase/firebase'; 
import { v4 } from "uuid";

export default function MapComponent(){

  

  const userData = useSelector(state => state.userData.data);
  const currentUser = useAuth();
  // const [userDetermined,setUserDetermined] = useState(false);
  const [selectedLocation,setSelectedLocation]  = useState({
    lat:35,
    lng:34
  })
  const CONSTANT_LATITUDE = 111.32; //km
    const CONSTANT_LONGTITUDE = 40075*Math.cos(CONSTANT_LATITUDE)/360

  //Local States
  const [locationName,setLocationName] = useState("Location");

  // const userLocation = useSelector(state => state.locationData.data)
  // const dispatch = useDispatch();
  const {isLoaded} = useLoadScript({
    googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })
  
  // useEffect(()=>{
  //   if(Object.keys(userLocation).length === 0 && !userDetermined ){
  //     const successCallback = (position) => {
  //       setSelectedLocation({
  //         lat:position.coords.latitude,
  //         lng:position.coords.longitude
  //       })
  //     };
      
  //     const errorCallback = (error) => {
  //       console.log(error);
  //     };
  //     navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  //   }
  // },[dispatch, userDetermined, userLocation])

  

  const handleAddLocation = async (name) =>{
    const docRef = doc(db,"Doctors",currentUser.uid);
    const prevLocations = userData.locations
    const locationData = {lat:selectedLocation.lat,lng:selectedLocation.lng,name:name}
    let locations = [...prevLocations, locationData]

    await setDoc(docRef,{
      ...userData,
      locations,
    })
    window.location.reload();
  }

  const handleTextChange = (e) => {
    setLocationName(e.target.value);
  }
 
  const handleAutomaticLocation = () => {
    const successCallback = (position) => {
      setSelectedLocation({
        lat:position.coords.latitude,
        lng:position.coords.longitude
      })
    };
    
    const errorCallback = (error) => {
      console.log(error);
    };
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  }

  const handleLocationSelection  = (e) => {
    setSelectedLocation({
      lat:e.latLng.lat(),
      lng:e.latLng.lng()
    })

  }

  const handleDeleteLocation= async (i)=>{
    const docRef = doc(db,"Doctors",currentUser.uid);
    let locations = userData.locations;
    let newLocations = [...locations]
    newLocations.splice(i,1)
    
    await setDoc(docRef,{
      ...userData,
      locations:newLocations
    })
    window.location.reload();
    // locations.splice(i,1);
    
  }

  const center = useMemo(()=>({lat:selectedLocation.lat,lng:selectedLocation.lng}),[selectedLocation.lat, selectedLocation.lng])
  
   console.log(locationName)
    if(isLoaded){
      return  selectedLocation ? <div>
      <p>
        As a verified doctor you will be able to determine more than one locations as you might be on duty in several hospitals in one week
        location of your clinic or hospital will be recorded to our database as we will query this data for our patients to search for and find.
      </p>
      <button onClick={()=> handleAutomaticLocation()}> Find My Location</button> <br />
      <p> Selected Coordinate : {selectedLocation.lat.toFixed(2) + ", " + selectedLocation.lng.toFixed(2) }  </p>

      <p>Location Name:</p>
      <input type="text" onChange={(e)=>handleTextChange(e)} />
      <button onClick={()=>handleAddLocation(locationName)} > Add this location </button>
      <p> Determined Locations: </p>
      {Object.keys(userData).length !==0 &&

        <ul>
        { userData.locations.length === 0? <p>There are no determined locations yet</p> : userData.locations.map((item,index) => {
          const uniqueKey = v4();
          return <li style={{"cursor":"pointer"}} key={uniqueKey} >
          {item.name}
          <button onClick={()=>handleDeleteLocation(index) } >Delete This Location</button>
        </li>
        })}  
        </ul>
      }
      
      <p>Warning: Automatically finding your location might not be accurate make sure on the map that it is correct</p>
      
      
      
      
    <GoogleMap zoom={16} center={center} mapContainerClassName={classes.map_container} onClick={(e)=>handleLocationSelection(e)}>
      <MarkerF title="Selected Position" position={selectedLocation} />
      {
        Object.keys(userData).length !== 0 && userData.locations.map((item,index) => {
          const uniqueKey = v4();
          return <MarkerF icon={"http://maps.google.com/mapfiles/ms/icons/blue-dot.png"} title={{lat:item.lat,lng:item.lng}} key={uniqueKey} position={{lat:item.lat,lng:item.lng}} />
        })
      }
    </GoogleMap>
  </div> : <div>
      <p>
        As a verified doctor you will be able to determine more than one locations as you might be on duty in several hospitals in one week
        location of your clinic or hospital will be recorded to our database as we will query this data for our patients to search for and find.
      </p>
      
      <p> Your coordinates : { 0 + ", " + 0} </p>
      
      <p>Warning: Automatically finding your location might not be accurate make sure on the map that it is correct</p>
      <button onClick={()=> handleAutomaticLocation()}> Find My Location</button> <br />
      
          
        <GoogleMap zoom={16} center={{lat:0,lng:0}} mapContainerClassName={classes.map_container} onClick={(e)=>handleLocationSelection(e)}>
          <MarkerF position={{lat:0,lng:0}} />
        </GoogleMap>
      </div>
  
    }else{
      return <div>
      Loading
    </div>
    }
  
}