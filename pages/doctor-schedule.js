import {useState,useMemo,useEffect} from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import DatePicker from "react-datepicker";
import tr from "date-fns/locale/tr";
import us from "date-fns/locale/en-US";
import 'react-datepicker/dist/react-datepicker.css'
import { useSelector } from "react-redux";
import { GoogleMap,useLoadScript, MarkerF } from "@react-google-maps/api";
import {useAuth,db} from '../firebase/firebase'
import {doc,setDoc,getDoc} from 'firebase/firestore'
import classes from "../styles/mapStyles.module.css";
import event_classes from '../styles/calendarStyles.module.css';
import {v4} from 'uuid';
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/currentUserState";

// import * as bootstrap from "bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./index.css";


function DoctorSchedule() {
  const [events,setEvents] = useState([])
  const [startTime,setStartTime] = useState();
  const [endTime,setEndTime] = useState();
  const [designatedLocation,setDesignatedLocation] = useState({});
  const [designatedInsurance,setDesignatedInsurance] = useState("");
  const [title,setTitle] = useState("");
  const [locationName,setLocationName] = useState("")
  const router = useRouter()
  const dispatch = useDispatch();
  // const [id,setId] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [selectedLocation,setSelectedLocation]  = useState({
    lat:35,
    lng:34
  })
  const [error,setError] = useState(false)
  
  
  const userData = useSelector(state => state.userData.data)
  const language = useSelector(state => state.theme.language);


  const currentUser = useAuth();

  const {isLoaded} = useLoadScript({
    googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })
  

  useEffect(()=>{
    if(Object.keys(userData).length!==0){
      if(userData.role!=="doctor"){
        router.push("/")
      }
    }
  },[router, userData])

  
  
  useEffect(()=>{
    if(Object.keys(userData).length!==0){
      setEvents(prev => {
        return userData.schedule
      })
    }
  },[userData])
  // console.log(events)
 useEffect(()=>{

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

  },[])

  const handleSetAppointment  = async() =>{
    const year = startDate.getFullYear()
    let month = ""
    let day = "";

    if((startDate.getMonth()) + 1 < 10){
      month = "0" + (startDate.getMonth()+ 1) 
    }else{
      month = (startDate.getMonth()) + 1
    }

    if(startDate.getDate() < 10){
      day = "0" + startDate.getDate()
    }else{
      day = startDate.getDate()
    }

    let start = startTime.split(":");
    let end = endTime.split(":");
    if(parseInt(start[0]) > parseInt(end[0]) ){
      setError(true)
    }

    const eventStart = year + "-"  + month + "-" + day + "T" + startTime + ":00"
    const eventEnd = year + "-"  + month + "-" + day + "T" + endTime + ":00"
    const eventId = v4();
    

    const event = {
      title:title,
      start:eventStart,
      end:eventEnd,
      id:eventId,
      patientName:"",
      patientId:"",
      patientPhone:"",
      location:designatedLocation,
      insurance:designatedInsurance,
      doctorId:currentUser.uid,
      status:"available"
    }

    setEvents(prev => {
      return [...prev,event]
    })



    const docRef = doc(db,"Doctors",currentUser.uid);

    const prevSchedules = userData.schedule
    await setDoc(docRef,{
      ...userData,
      schedule:[
        ...prevSchedules,
        event
      ]
    })
    const newData = (await getDoc(docRef)).data();
    dispatch(setUserData(newData));
    // window.location.reload();
  }
  
  const handleAppointmentStatus = async (id) => {
    const docRef = doc(db,"Doctors",currentUser.uid);
    let scheduleData = [];
    let index = 0
    for(let i = 0 ; i < userData.schedule.length ;i++){
      if(id === userData.schedule[i].id){
        scheduleData = userData.schedule[i]
        index = i
      }
    }
    // console.log(scheduleData)
    if(scheduleData.status==="available"){
      if(confirm("Do you want to cancel this appointment?")){
        
        const event = {...userData.schedule[index],
          color:"red",
          status:"cancelled",
          cancelledBy:"doctor",
          cancelledById:currentUser.uid
        }
        let prevSchedule = [...userData.schedule]
        prevSchedule.splice(index,1)
        console.log(prevSchedule)
        await setDoc(docRef,{
          ...userData,
          schedule:[...prevSchedule,event]
        })
   
    window.location.reload();
    } else{
      return;
    }
  }else if (scheduleData.status === "cancelled"){
    if(confirm("Do you want to open this appointment?")){
        
      const event = {...userData.schedule[index],
        color:"#3788d8",
        status:"available"
      }
      let prevSchedule = [...userData.schedule]
      prevSchedule.splice(index,1)
      await setDoc(docRef,{
        ...userData,
        schedule:[...prevSchedule,event]
      })
 
  window.location.reload();
  } else{
    return;
  }
  }else if (scheduleData.status === "booked"){
    if(confirm("Do you want to cancel this appointment? The patient will be notified")){
        
      const event = {...userData.schedule[index],
        color:"red",
        status:"cancelled"
      }
      let prevSchedule = [...userData.schedule]
      prevSchedule.splice(index,1)
      console.log(prevSchedule)
      await setDoc(docRef,{
        ...userData,
        schedule:[...prevSchedule,event]
      })
 
  window.location.reload();
  } else{
    return;
  }
}
  }
  
  // console.log(startDate)
  const handleStartTimeChange = (e)=>{
    setStartTime(e.target.value)
  }

  const handleEndTimeChange = (e)=>{
    setEndTime(e.target.value)
  }

  const handleTitleChange = (e) =>{
    setTitle(e.target.value)
  }
  const handleInsuranceSelectionChange = (insurance) => {
    setDesignatedInsurance(insurance)
  }

  const handleLocationSelection = (name,lat,lng) => {
    setDesignatedLocation(prev => {
      return {...prev,name:name,lat:lat,lng:lng}
    })
  }

  const handleLocationChange = (e) => {
    setSelectedLocation({
      lat:e.latLng.lat(),
      lng:e.latLng.lng()
    })
  }
  const handleDeleteLocation= async (name)=>{
    const docRef = doc(db,"Doctors",currentUser.uid);
    let locations = userData.locations;
    let newLocations = [...locations]
    for(let i = 0 ; i < locations.length ; i++ ){
      if(locations[i].name === name){
        newLocations.splice(i,1)
      }
    }
    
    await setDoc(docRef,{
      ...userData,
      locations:newLocations
    })
    window.location.reload();
    // locations.splice(i,1);
    
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

  const handleLocationNameChange = (e) => {
    setLocationName(e.target.value)
  }

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
  // console.log(startDate.getMonth())
  // console.log(designatedLocation)
  console.log(userData)
  const center = useMemo(()=>({lat:selectedLocation.lat,lng:selectedLocation.lng}),[selectedLocation.lat, selectedLocation.lng])
  return (
    <div>
     <div style={{"width":"100%", "display":"flex","flexDirection":"row","justifyContent":"space-between","alignItems":"center"}} >
      <div>
      <h1> Determine your timeline here </h1>
      <p> Determined timeline will  appear at below schedule sheet </p>
      <h3>Your Locations</h3>

        { Object.keys(userData).length !==0 && userData.locations.length !== 0 && userData.locations.map((item,index)=>{
          return <div key={index} >
            <label style={{"cursor":"pointer"}} onClick={(e)=> {
              setSelectedLocation({
                lat:item.lat,
                lng:item.lng
              })
            }} htmlFor={item.name}>{item.name}</label> <input  id={item.name} onChange={() => handleLocationSelection(item.name,item.lat,item.lng)} value={item.name} name={"locations"} type="radio"  />
          </div>

        })}


      <h3> Insurances you work with </h3>
      {Object.keys(userData).length !== 0 && userData.insurance.map((item)=>{
        return <div key={item} >
        <label htmlFor={item}>{item}</label> <input id={item} onChange={()=>handleInsuranceSelectionChange(item)} value={item} name={"insurances"} type="radio"  />
      </div>
      }) }
      <p> Select date of appointment </p>
     <div style={{zIndex:"99999"}} ><DatePicker dateFormat={"dd/MM/yyyy"} locale={language==="tr" ? tr : us} selected={startDate} onChange={(date) => setStartDate(date)} /></div>

     <p>Select Time Interval</p>
     <label htmlFor="input"> Start: </label>
     <input onChange={e => handleStartTimeChange(e)} type="time" />
     <label htmlFor="input"> End: </label>
     <input onChange={e => handleEndTimeChange(e)} type="time" />
     <p> Determine a title for the appointment </p>
     <input type="text" onChange={e => handleTitleChange(e)} /> <br /><br />
     <button onClick={()=>handleSetAppointment()} > Set appointment </button>
     <br /><br /><br />
      </div>
     <div style={{"height":"50vh","width":"50%"}} >
     {isLoaded ? <GoogleMap zoom={16} center={center} mapContainerClassName={classes.map_container_medium} onClick={(e)=>handleLocationChange(e)}>
      <MarkerF title="Selected Position" position={selectedLocation} />
      {
        Object.keys(userData).length !== 0 && userData.locations.map((item,index) => {
          return <MarkerF icon={"http://maps.google.com/mapfiles/ms/icons/blue-dot.png"} title={{lat:item.lat,lng:item.lng}} key={index} position={{lat:item.lat,lng:item.lng}} />
        })
      }
    </GoogleMap> : "" }
    <h3>Location: {selectedLocation.lat + ", " + selectedLocation.lng} </h3> 
    <button onClick={() => handleAutomaticLocation()} > Find My Location </button> <br />
    <label htmlFor="locationName">Location Name</label>: <input name="locationName" type="text" onChange={e => handleLocationNameChange(e)} /><br />
    <button onClick={()=> handleAddLocation(locationName)} > Add this Location </button>
    <button onClick={()=> handleDeleteLocation(locationName)} > Delete this Location </button>

     </div>
    </div>
    <p> In order to change the status of an appointment click on the appointment </p>
      <div style={{"marginTop":"150px"}} >
      {events.length > 0 && <Fullcalendar
        plugins={[timeGridPlugin,dayGridPlugin]}
        initialView={"timeGridWeek"}
        locale={language==="tr" ? tr : us}
        headerToolbar={{
          start: "today prev,next", // will normally be on the left. if RTL, will be on the right
          center: "title",
          end: "timeGridDay,timeGridWeek,dayGridMonth", // will normally be on the right. if RTL, will be on the left
          url:"localhost",
          description:"description",
        }}
        eventClassNames={event_classes.event}
        eventClick={(info)=>{handleAppointmentStatus(info.event.id)}}
        height={"90vh"}
        events={events}
      />}
      </div>
    </div>
  );
}

export default DoctorSchedule;