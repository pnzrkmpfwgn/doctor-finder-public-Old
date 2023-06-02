import { GoogleMap,useLoadScript, MarkerF } from "@react-google-maps/api";
import classes from '../../styles/mapStyles.module.css';
import { useDispatch, useSelector } from "react-redux";
import user_location, { setLocationData } from "../../redux/user_location";
import { useEffect,useState,useMemo } from "react";
import {useCookies} from 'react-cookie';




export default function MapComponent(){
  const userData = useSelector(state => state.userData.data);
  const [userDetermined,setUserDetermined] = useState(false);
  const [cookie, setCookie] = useCookies(["location"])
  const userLocation = useSelector(state => state.locationData.data)
  const dispatch = useDispatch();
  const {isLoaded} = useLoadScript({
    googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })
  const CONSTANT_LATITUDE = 111.32; //km
    const CONSTANT_LONGTITUDE = 40075*Math.cos(CONSTANT_LATITUDE)/360
  useEffect(()=>{
    if(Object.keys(userLocation).length === 0 && !userDetermined ){
      const successCallback = (position) => {
        dispatch(setLocationData({
          lat:position.coords.latitude,
          lng:position.coords.longitude
        }))
      };
      
      const errorCallback = (error) => {
        console.log(error);
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
    }
  },[cookie.location, dispatch, userDetermined, userLocation])

  const handleLocation = (e) => {
    dispatch(setLocationData({
      lat:e.latLng.lat(),
      lng:e.latLng.lng()
    }))
    setUserDetermined(true);
  }

  const handleSaveLocation = () =>{
    setCookie("location",userLocation)
  }
  
  const handleAutomaticLocation = () => {
    const successCallback = (position) => {
      dispatch(setLocationData({
        lat:position.coords.latitude,
        lng:position.coords.longitude
      }))
    };
    
    const errorCallback = (error) => {
      console.log(error);
    };
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  }

  const center = useMemo(()=>({lat:userLocation.lat,lng:userLocation.lng}),[userLocation.lat, userLocation.lng])
  console.log(cookie.location)
  console.log(userLocation)
  if(isLoaded){
    return  Object.keys(userLocation).length !== 0 ? <div>
    <p>
    If you can see your location in the map before determining your location in the website, 
    it might be due to your browser options. Hence our application obtained this information from your device and browser.
    This information is not recorded to our database without your permission. 
    </p>
    <p>
        Notice that your location here may not be correct due to your internet provider. In order to determine your actual location
      you can select your general area in the map bellow.
    </p>
    <p>
      After the determining the location you may save this information to cookies for later sessions. Notice that the your location
      will be lost after closing the tab or reloading. This information will not be recorded to our database if you wish to save it to the cookies in your browser.
    </p>
    <p> Your coordinates : { userLocation.lat.toFixed(2) + ", " + userLocation.lng.toFixed(2)} </p>
    <p> Previously saved coordinates : {cookie.location && cookie.location.lat.toFixed(2) + ", " + cookie.location.lng.toFixed(2) } </p>
    <p>Warning: Automatically finding your location might not be accurate make sure on the map that it is correct</p>
    <button onClick={()=> handleAutomaticLocation()}> Find My Location</button> <br />
    <button onClick={()=>handleSaveLocation()} > Save this location </button>
    
    
  <GoogleMap zoom={16} center={center} mapContainerClassName={classes.map_container} onClick={(e)=>handleLocation(e)}>
    <MarkerF position={center} />
  </GoogleMap>
</div> : <div>
        <p>
        If you can see your location in the map before determining your location in the website, 
      it might be due to your browser options. Hence our application obtained this information from your device and browser.
      This information is not recorded to our database without your permission. 
        </p>
        <p>
            Notice that your location here may not be correct due to your internet provider. In order to determine your actual location
          you can select your general area in the map bellow.
        </p>
        <p>
          After the determining the location you may save this information to cookies for later sessions. Notice that the your location
          will be lost after closing the tab or reloading. This information will not be recorded to our database if you wish to save it to the cookies in your browser.
        </p>
    <p> Your coordinates : {0 + ", " + 0} </p>
        
      <GoogleMap zoom={16} center={{lat:0,lng:0}} mapContainerClassName={classes.map_container} onClick={(e)=>handleLocation(e)}>
        <MarkerF position={{lat:0,lng:0}} />
      </GoogleMap>
    </div>

  }else{
    return <div>
    Loading
  </div>
  }
}