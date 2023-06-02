import { GoogleMap,useLoadScript,MarkerF } from "@react-google-maps/api";
import classes from '../styles/mapStyles.module.css';
import { useDispatch, useSelector } from "react-redux";
import user_location, { setLocationData } from "../redux/user_location";
import { useEffect,useState,useMemo } from "react";
import {useCookies} from 'react-cookie';




export default function SearchByLocation(){


  //Global constant to convert lat and lng to meters
  const CONSTANT_LATITUDE = 111.32; //km
  const CONSTANT_LONGTITUDE = 40075*Math.cos(CONSTANT_LATITUDE)/360

  // const sortingData = useSelector(state => state.sortingResults.data)
  const [userDetermined,setUserDetermined] = useState(false);
  const [localData,setLocalData] = useState({});
  const [localResults,setLocalResults] = useState();
  const [cookie, setCookie] = useCookies(["location"])
  const [sortedData, setSortedData] = useState([])
  const [userClicked,setUserClicked] = useState(false);
  const [counter,setCounter] = useState(0);
  const [induvidualLocation,setInduvidualLocation] = useState({lat:0,lng:0})
  // const userLocation = useSelector(state => state.locationData.data)
  const dispatch = useDispatch();
  const {isLoaded} = useLoadScript({
    googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })
  
  useEffect(()=>{
    if(typeof window !== 'undefined'){
      const data = localStorage.getItem("locationData")
      setLocalResults(JSON.parse(data))
    }
   
    if(Object.keys(localData).length === 0 && !userDetermined ){
      const successCallback = (position) => {
        setLocalData({
          lat:position.coords.latitude,
          lng:position.coords.longitude
        })
      };
      
      const errorCallback = (error) => {
        console.log(error);
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
    }
    
  },[localData, userDetermined])
  
  
  console.log(localResults)
  const handleLocation = (e) => {
    setLocalData({
      lat:position.coords.latitude,
      lng:position.coords.longitude
    })
    setUserDetermined(true);
  }

  const handleSaveLocation = () =>{
    setCookie("location",localData)
  }
  
  const handleAutomaticLocation = () => {
    const successCallback = (position) => {
      setLocalData({
        lat:position.coords.latitude,
        lng:position.coords.longitude
      })
    };
    
    const errorCallback = (error) => {
      console.log(error);
    };
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  }

  console.log(localResults)
  useEffect(()=>{
    if(cookie.location){
      if(Object.keys(localResults).length !==0 && localResults){
        console.log("executed")
        localResults.map(item => {
          for(let i = 0 ; i < item.locations.length; i++){
            const distance = Math.sqrt( Math.pow(item.locations[i].lat*CONSTANT_LATITUDE-cookie.lat*CONSTANT_LATITUDE,2) + Math.pow(item.locations[i].lng*CONSTANT_LONGTITUDE-cookie.lng*CONSTANT_LONGTITUDE,2) )
            setSortedData(prev => {
              let arr = [...prev,{
                title:item.title,
                name:item.name,
                surname:item.surname,
                expertise:item.expertise,
                id:item.objectID,
                distance:distance,
                lat:item.locations[i].lat,
                lng:item.locations[i].lng
              }]
              arr.sort((a,b)=>(a.distance < b.distance) ? 1 : -1)
              return arr;
            })
            
          }
        })
       }
      }else{
      if(localResults && Object.keys(localResults).length !==0){
        console.log("executed")
        localResults.map(item => {
          for(let i = 0 ; i < item.locations.length; i++){
            const distance = Math.sqrt( Math.pow(item.locations[i].lat*CONSTANT_LATITUDE-localData.lat*CONSTANT_LATITUDE,2) + Math.pow(item.locations[i].lng*CONSTANT_LONGTITUDE-localData.lng*CONSTANT_LONGTITUDE,2) )
            setSortedData(prev => {
              let arr = [...prev,{
                title:item.title,
                name:item.name,
                surname:item.surname,
                expertise:item.expertise,
                id:item.objectID,
                distance:distance,
                lat:item.locations[i].lat,
                lng:item.locations[i].lng
              }]
              arr.sort((a,b)=>(a.distance < b.distance) ? 1 : -1)
              return arr;
            })
            
          }
        })
       }
    }
     
  },[CONSTANT_LONGTITUDE, cookie.lat, cookie.lng, cookie.location, localData, localResults])

  

  const center = useMemo(()=>{
    if(Object.keys(localData).length !== 0){
      return {lat:localData.lat,lng:localData.lng}
    }else{
      return {lat:35,lng:33}
    }
  },[localData])

  const handleUserStartSearch = () => {
    setUserClicked(true);
    if(sortedData.length!==0){
      let length = sortedData.length
      if(counter === length){
        setCounter(0);
      }
      setInduvidualLocation({lat:sortedData[counter].lat,lng:sortedData[counter].lng})
      setCounter(prev=> prev + 1);
      
    }
  }

  console.log(sortedData[0])

  if(isLoaded){
    return  Object.keys(localData).length !==0 ? <div className={classes.search_container} >
    <div>
      <p> Determine you location on the map </p>
    <button onClick={()=> handleAutomaticLocation()}> Find My Location</button> <br />
    <button onClick={()=>handleSaveLocation()} > Save this location </button>
    <button disabled={userClicked} onClick={()=>handleUserStartSearch()} > Find Closest </button>
    <button disabled={!userClicked} onClick={()=>handleUserStartSearch()}> Find Next </button>
    </div>
    
  <GoogleMap zoom={12} center={ !userClicked ? center : {lat:induvidualLocation.lat,lng:induvidualLocation.lng}} mapContainerClassName={classes.map_container} onClick={(e)=>handleLocation(e)}>
    <MarkerF position={center} />
    {sortedData.length !== 0 && sortedData.map(item => <MarkerF key={item.distance} icon={{url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"}} position={{lat:item.lat,lng:item.lng}} />
      )}
  </GoogleMap>
</div> : <div>
      <GoogleMap zoom={10} center={{lat:0,lng:0}} mapContainerClassName={classes.map_container} onClick={(e)=>handleLocation(e)}>
        <MarkerF position={{lat:0,lng:0}} />
      </GoogleMap>
    </div>

  }else{
    return <div>
    Loading
  </div>
   }
}