import { useState,useRef, useEffect,useMemo } from "react"
import {doc,setDoc,getDoc} from 'firebase/firestore'
import { getDoctorIds,useAuth,db,postTestimonial, deleteTestimonial, updateTestimonial,reportTestimonial } from "../../firebase/firebase"
import { GoogleMap,useLoadScript, MarkerF } from "@react-google-maps/api";
import { useSelector } from "react-redux";
import {useRouter} from 'next/router'
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import tr from "date-fns/locale/tr";
import us from "date-fns/locale/en-US";
import event_classes from '../../styles/calendarStyles.module.css'
import classes from "../../styles/mapStyles.module.css";
import pageClasses from '../../styles/docPage.module.css';
import { v4 } from "uuid";
import {useCookies} from 'react-cookie';
import StarRating from '../../components/StarRating';
import ratingClasses from '../../styles/starRatingButton.module.css'

export async function getStaticPaths(){
    const data = await getDoctorIds();
    const paths = data.map(slug => {
        return{params:{doc_id:slug}}
    })
    return {
        paths,
        fallback:false,
    }
}

export async function getStaticProps(context){
    const {doc_id} = context.params
    const docRef = doc(db,"Doctors",doc_id);
    const props = (await getDoc(docRef)).data();
    // const props = {doc_id:""}
    return {
        props:{props},
    }
}


export default function DoctorPage({props}){
    const [showTestimonial,setShowTestimonial] = useState(false);
    const [showReportPanel,setShowReportPanel] = useState(false);
    const [anonymous,setAnonymous] = useState(false);
    const [testimonialText,setShowTestimonialText] = useState("");
    const [showEdit,setShowEdit] = useState(false); 
    const [doctorId,setDoctorId] = useState("");
    const [average, setAverage] = useState(0)
    const [reportText,setReportText] = useState("");
    const [reportReason,setReportReason] = useState("");
    const [hastTestimonial,setHasTestimonial] = useState(false);
    const [alreadyReported,setAlreadyReported] = useState(false);
    const [appointmentSelected,setAppointmentSelected] = useState(false);
    const [insuranceMatch,setInsuranceMatch] = useState(false);
    const [detailsPanel,setDetailsPanel] = useState({});
    const [events,setEvents] = useState([])
    const currentUser = useAuth();
    const userData = useSelector(state=> state.userData.data);
    const language = useSelector(state => state.theme.language)
    const[rating,setRating] = useState(0);
    const [hover, setHover] = useState(0);

    const handleRating = (index) => {
        setRating(index)
    }
    
    const [selectedLocation,setSelectedLocation]  = useState({
        lat:35,
        lng:34
      })
    const [cookie, setCookie] = useCookies(["location"])

    const CONSTANT_LATITUDE = 111.32; //km
    const CONSTANT_LONGTITUDE = 40075*Math.cos(CONSTANT_LATITUDE)/360
    

    const router = useRouter();

    const {isLoaded} = useLoadScript({
        googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      })
    
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

    useEffect(()=>{
      if(typeof window !== "undefined"){
        setRating(localStorage.getItem("rating"));
      }
    },[])
    if(typeof window !== "undefined"){
      console.log(localStorage.getItem("rating"))
    }
    console.log(rating)
    
    useEffect(()=>{
       
        if(Object.keys(props).length!==0){
          setEvents(prev => {
            return props.schedule
          })
        }
      },[props])

    console.log(props)
    useEffect(()=>{
        const {doc_id} = router.query
        setDoctorId(doc_id);

    },[router.query])

    useEffect(()=>{
        (async()=>{
            if(props){
            let averageL = 0;
            for(let i = 0 ; i < props.testimonials.length ; i++){
              let num = 0;
              if(props.testimonials[i]["rating"]==="Nan"){
                num = 0
              }else{
                num = props.testimonials[i]["rating"]
              }
                num = Number(num)
                averageL+=num
                
            }
            const arrLength = props.testimonials.length;
            averageL = averageL / arrLength

            averageL = averageL.toPrecision(2)
            if(averageL===NaN || averageL ==="undefined" || averageL==="null" ){
                averageL=0
            }
            setAverage(averageL)
            }

            if(doctorId){
                const docRef = doc(db,"Doctors",doctorId);
                    await setDoc(docRef,{
                        ...props,
                        rating:0
                    })    
                
                    await setDoc(docRef,{
                        ...props,
                        rating:average
                    })
                
            }
        })()
        
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props, doctorId])
    useEffect(()=>{
        if(props && currentUser){
            for(let i = 0 ; i < props.testimonials.length ; i++){
                if(props.testimonials[i]["from"] === currentUser.uid){
                    setHasTestimonial(true);
                }else{
                    setHasTestimonial(false)
                }
            }
           
        }
    },[currentUser, props])

    //Refs
    const textRef = useRef();
    const handleChange =(e)=>{
        if(e.target.value==="anonymous"){
            setAnonymous(true)
        }else{
            setAnonymous(false)
        }
    }   

    const handleTextChange = (e) => {
        setShowTestimonialText(e.target.value)
    }

    const handlePostTestimonial = (e) => {
        e.preventDefault();
        setShowTestimonialText(textRef.current.value)
        let patientPrevTestimonials = [];
        userData.my_testimonials.forEach(element => {
            patientPrevTestimonials.push(element)
        });
        let doctorPrevTestimonials = []
        props.testimonials.forEach(element=>{
            doctorPrevTestimonials.push(element)
        })
        postTestimonial(testimonialText,currentUser.uid,doctorId,rating,anonymous,props,userData,patientPrevTestimonials,doctorPrevTestimonials,userData.name,userData.surname )
        
        textRef.current.value="";


    }
    const handleUpdateTestimonial= async (e)=>{
        e.preventDefault();
        setShowTestimonialText(textRef.current.value)
        let patientPrevTestimonials = [];
        userData.my_testimonials.forEach(element => {
            patientPrevTestimonials.push(element)
        });
        let doctorPrevTestimonials = []
        let reports = {}
        for(let i = 0 ; i < userData.my_testimonials.length; i++){
            if(doctorId === userData.my_testimonials[i]["to"]){
                reports = my_testimonials[i]["reports"];
            }
        }
        props.testimonials.forEach(element=>{
            doctorPrevTestimonials.push(element)
        })
        await updateTestimonial(testimonialText,currentUser.uid,doctorId,rating,anonymous,props,userData,patientPrevTestimonials,doctorPrevTestimonials,userData.name,userData.surname,props.reports)
        
        textRef.current.value="";

        setShowEdit(prev=>!prev)
    }
    const handleReportTestimonial = async (e,reported_user_id,user_id,testimonial_id) => {
        
        if(!alreadyReported){
            reportTestimonial(reportReason,reportText,reported_user_id,currentUser.uid,doctorId,testimonial_id)
        }
        
        e.target.value="";
    }

    const handleReportReason = async (e) => {
        setReportReason(e.target.value);
    }

    const handleReportText = async (e) =>{
        setReportText(e.target.value);
    }

    const handleShowReportTestimonialPanel = async(testimonial_id)=>{
        const docRef = doc(db,"Reported Testimonials",testimonial_id);
        const data = (await getDoc(docRef)).data()
        if(data){
          if(data.testimonial_id === testimonial_id){
            setAlreadyReported(prev => !prev)
        }else{
          setShowReportPanel(prev => !prev)
        }
        }else{
          setShowReportPanel(prev => !prev)
        }
    }
    console.log(userData)
    const handleAppointmentDetails = (id) =>{
        setAppointmentSelected(true);
        let data = []
        for(let i = 0 ; i < props.schedule.length ; i++){
            if(id === props.schedule[i].id){
                data = props.schedule[i]
            }
        }
        
        let start = data.start.split("T");
        let end = data.end.split("T");

        for(let i = 0 ; i < userData.insurance.length ; i++){
            if(data.insurance === userData.insurance[i]){
                setInsuranceMatch(true)
            }
        }
        let distance = 0;

        if(cookie.location){
            distance = Math.sqrt( Math.pow(data.location.lat*CONSTANT_LATITUDE-cookie.lat*CONSTANT_LATITUDE,2) + Math.pow(data.location.lng*CONSTANT_LONGTITUDE-cookie.lng*CONSTANT_LONGTITUDE,2) )
        }else{
            distance = Math.sqrt( Math.pow(data.location.lat*CONSTANT_LATITUDE-selectedLocation.lat*CONSTANT_LATITUDE,2) + Math.pow(data.location.lng*CONSTANT_LONGTITUDE-selectedLocation.lng*CONSTANT_LONGTITUDE,2) )
        }
        console.log(rating)

        setDetailsPanel({
            title:data.title,
            start:start,
            end:end,
            id:data.id,
            insurance:data.insurance,
            location:data.location,
            distance:distance,
            status:data.status
        });
    }


    const handleAppointmentStatus = async (id,doctorId) => {
        const docRef = doc(db,"Doctors",doctorId);
        const docPatient = doc(db,"Patients",currentUser.uid);
        let scheduleData = [];
        let patientScheduleData = [];
        let index = 0
        let indexForPatient = 0
        // console.log(props.schedule)
        // console.log(id)
        // console.log(props.schedule)
        for(let i = 0 ; i < props.schedule.length ;i++){
          if(id === props.schedule[i].id){
            console.log("executed")
            scheduleData = props.schedule[i]
            index = i
          }
        }

        for(let i = 0 ; i < userData.schedule.length ;i++){
            if(id === userData.schedule[i].id){
              patientScheduleData = userData.schedule[i]
              indexForPatient = i
            }
          }
        // console.log(scheduleData)
        if(scheduleData.status==="available"){
          if(confirm("Do you want to book this appointment")){
            const event = {...props.schedule[index],
              color:"#878a88",
              status:"booked",
              bookedBy:currentUser.uid,
              patientName:userData.name + " " + userData.surname,
              patientId:currentUser.uid,
              patientPhone:userData.phone_number
            }
            let prevSchedule = [...props.schedule]
            let prevPatientSchedule = [...userData.schedule]

            prevSchedule.splice(index,1)
            // console.log(prevSchedule)
            await setDoc(docRef,{
              ...props,
              schedule:[...prevSchedule,event]
            })
            // prevPatientSchedule.splice(indexForPatient,1)
            await setDoc(docPatient,{
                ...userData,
              schedule:[...prevPatientSchedule,event]
            })
       
        window.location.reload();
        } else{
          return;
        }
      }else if (scheduleData.status === "cancelled" && scheduleData.cancelledById === currentUser.uid){
        if(confirm("This appointment is cancelled by you do you want to book it again?")){
            const event = {...props.schedule[index],
                color:"#878a88",
                status:"booked",
                bookedBy:currentUser.uid,
                patientName:userData.name + " " + userData.surname,
                patientId:currentUser.uid,
                patientPhone:userData.phone_number
              }
              let prevSchedule = [...props.schedule]
              let prevPatientSchedule = [...userData.schedule]
  
              prevSchedule.splice(index,1)
              // console.log(prevSchedule)
              await setDoc(docRef,{
                ...props,
                schedule:[...prevSchedule,event]
              })
              prevPatientSchedule.splice(indexForPatient,1)
              await setDoc(docPatient,{
                  ...userData,
                schedule:[...prevPatientSchedule,event]
              })
         
          window.location.reload();
        }else{
            return;
        }
        
      }else if (scheduleData.status === "booked" && scheduleData.bookedBy === currentUser.uid){
        alert("This appointment is booked by you")
      }else if (scheduleData.status ==="booked"){
        alert("This appointment is booked")
      } else{
        alert("This appointment is cancelled")
      }
      }

      const handleCancellation = async (id,doctorId) => {
        const docRef = doc(db,"Doctors",doctorId);
        const docPatient = doc(db,"Patients",currentUser.uid);
        let scheduleData = [];
        let patientScheduleData = [];
        let index = 0
        let indexForPatient = 0
        
        for(let i = 0 ; i < props.schedule.length ;i++){
          if(id === props.schedule[i].id){
            console.log("executed")
            scheduleData = props.schedule[i]
            index = i
          }
        }

        for(let i = 0 ; i < userData.schedule.length ;i++){
            if(id === userData.schedule[i].id){
              patientScheduleData = userData.schedule[i]
              indexForPatient = i
            }
          }
        // console.log(scheduleData)
        if(scheduleData.status==="booked" && scheduleData.bookedBy ===currentUser.uid){
          if(confirm("Do you want to cancel this appointment")){
            const event = {...props.schedule[index],
              color:"red",
              status:"cancelled",
              cancelledBy:"patient",
              cancelledById:currentUser.uid,
              patientName:userData.name + " " + userData.surname,
              patientId:currentUser.uid,
              patientPhone:userData.phone_number
            }
            let prevSchedule = [...props.schedule]
            let prevPatientSchedule = [...userData.schedule]

            prevSchedule.splice(index,1)
            // console.log(prevSchedule)
            await setDoc(docRef,{
              ...props,
              schedule:[...prevSchedule,event]
            })
            prevPatientSchedule.splice(indexForPatient,1)
            await setDoc(docPatient,{
                ...userData,
              schedule:[...prevPatientSchedule,event]
            })
       
        window.location.reload();
        } else{
          return;
        }
      }else if (scheduleData.status === "cancelled" && scheduleData.cancelledById === currentUser.uid ){
        alert("This appointment is cancelled by you")
      }else{
        alert("This appointment is not booked by you")
      }
      }

    const center = useMemo(()=>({lat:selectedLocation.lat,lng:selectedLocation.lng}),[selectedLocation.lat, selectedLocation.lng])
      console.log(props.rating)

    return <div>
       {/* eslint-disable-next-line @next/next/no-img-element */}
       <img
            src={"/image.jpg"}
            alt='slides'
            className={pageClasses.slides}
          />
      <div className={pageClasses.container} >
       
      <div style={{display:"flex",justifyContent:"start",alignContent:"center"}} >
          <i className={"fa fa-user " + pageClasses.person_icon} ></i>
        <h1> { props.title + " " + props.name + " " + props.surname} </h1>
        </div>
        <h3 style={{fontStyle:"italic"}} > {props.expertise} </h3>
        <StarRating rating={props.rating==="NaN" ? 0 : props.rating} />
      </div>

        <div style={{"display":"flex","flexDirection":"row",justifyContent:"space-between",marginTop:"100px"}} >
        {events.length > 0 && <div style={{"width":"50%",marginLeft:"20px",marginBottom:"25px"}}>
        <Fullcalendar
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
        eventClick={(info)=>{handleAppointmentDetails(info.event.id)}}
        height={"90vh"}
        events={events}
      />
            </div>}
            {appointmentSelected && 
            <div className={pageClasses.card}>
              <div className={pageClasses.card_container}>
                  <h3> Appointment Details </h3> 
                 <div>
                    
                    <div>
                    <h4> {detailsPanel.title} </h4>
                    <p> {detailsPanel.start + " "} - {" " + detailsPanel.end} </p>
                    <p>Insurance: {detailsPanel.insurance} {insuranceMatch && <span>&#10003;</span>} </p>
                    <p>{!insuranceMatch &&  "You have no matching insurance with this appointment"} </p>
                    <p>Distance: {detailsPanel.distance.toFixed(3)} KM</p>
                    <p>Status: {detailsPanel.status}</p>
                    <div style={{"height":"50vh","width":"100%"}} >
                    {isLoaded ? <GoogleMap zoom={8} center={center} mapContainerClassName={classes.map_container_medium} onClick={(e)=>handleLocationChange(e)}>
                       <MarkerF title="Selected Position" position={selectedLocation} />
                        <MarkerF icon={"http://maps.google.com/mapfiles/ms/icons/blue-dot.png"} title={{lat:detailsPanel.location.lat,lng:detailsPanel.location.lng}}  position={{lat:detailsPanel.location.lat,lng:detailsPanel.location.lng}} />

                     </GoogleMap> : "" }
                     <button className={pageClasses.button_class} onClick={()=>handleAppointmentStatus(detailsPanel.id,doctorId)} >Book this appointment</button>
                     <button className={pageClasses.button_class} disabled={detailsPanel.status ==="available"} onClick={()=>handleCancellation(detailsPanel.id,doctorId)} >Cancel this appointment</button>
                        </div>
                    </div>  
            </div>     
              </div>
            </div>
          }
            
        </div>
        <h4 className={pageClasses.testimonials_heading} > Testimonials </h4>
        <div className={pageClasses.testimonials_container} >

        { (currentUser && Object.keys(userData).length !==0 && userData.role==="patient" ) && <div>
        {hastTestimonial ? <p style={{fontStyle:"italic",color:"rgba(140, 140, 140, 0.92)"}} > You have a testimonial for this doctor, you can only edit or delete the testimonial you already have </p>:<p className={pageClasses.button_class} style={{"cursor":"pointer","padding":"10px",}} onClick={()=>setShowTestimonial(prev=> {
            if(prev){
                return false
            }else{
                return true
            }
        } )} > Write a testimonial for this doctor </p> }
        { showTestimonial && 
        <div className={pageClasses.textarea_container} >
            <textarea className={pageClasses.textarea_style} type="text" placeholder="Type your testimonial here" ref={textRef} onChange={(e)=>handleTextChange(e)} style={{"width":"300px","height":"100px"}} ></textarea> <br></br>
            <div className={ratingClasses.star_rating}>
        {[...Array(5)].map((star, index) => {
          index += 1;
          return (
            <div key={index}
            style={{marginBottom:"30px",display:"inline"}}   > 
              <span          
              className={index <= (hover || rating) ? ratingClasses.on : ratingClasses.off}
              onClick={() => handleRating(index)}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(rating)}>
                <span className={ratingClasses.star}>&#9733;</span>
                </span>
            </div>
     
          );
        })}
      </div>
      <div style={{marginTop:"20px"}} >
      <label style={{marginTop:"20px"}} htmlFor="anon-selection">
        Anonymous
      </label>
      <input  id={"anonymous"} onChange={(e)=>handleChange(e)} value={"anonymous"} name={"anon-selection"} type="radio"  />
      <label htmlFor="anon-selection">
        Public
      </label>
      <input  id={"public"} onChange={(e)=>handleChange(e)} value={"public"} name={"anon-selection"} type="radio"  />
            <br />
            <button type="submit" className={pageClasses.button_class} onClick={(e)=>handlePostTestimonial(e)} > Send Testimonial </button>
      </div>

        </div>
        }
        </div>
        }
        { props.testimonials.length!==0 ? props.testimonials.map((item,index) =>{
            if( currentUser && item.from === currentUser.uid){
                return <div key={item.from}> 
                    {showEdit ?
                    <div className={pageClasses.card} key={item.from} style={{marginBottom:"25px"}}>
                      <div className={pageClasses.card_container} >
                        <p className={pageClasses.testimonial_text} style={{color:"#595959"}} > Your testimonial </p>
                      <textarea className={pageClasses.textarea_style} type="text" ref={textRef} onChange={(e)=>handleTextChange(e)} style={{"width":"300px","height":"100px"}} ></textarea> <br></br>
                      <div className={ratingClasses.star_rating}>
                      {[...Array(5)].map((star, index) => {
                         index += 1;
                         return (
                           <div key={index}
                           style={{marginBottom:"30px",display:"inline"}}   > 
                             <span          
                             className={index <= (hover || rating) ? ratingClasses.on : ratingClasses.off}
                             onClick={() => handleRating(index)}
                             onMouseEnter={() => setHover(index)}
                             onMouseLeave={() => setHover(rating)}>
                               <span className={ratingClasses.star}>&#9733;</span>
                               </span>
                           </div>
                    
                         );
                       })}
                    </div>
                    <div style={{marginTop:"20px"}} >
                        <label style={{marginTop:"20px"}} htmlFor="anon-selection">
                          Anonymous
                        </label>
                        <input  id={"anonymous"} onChange={(e)=>handleChange(e)} value={"anonymous"} name={"anon-selection"} type="radio"  />
                        <label htmlFor="anon-selection">
                          Public
                        </label>
                        <input  id={"public"} onChange={(e)=>handleChange(e)} value={"public"} name={"anon-selection"} type="radio"  />
                              <br />
                              <button type="submit" className={pageClasses.button_class} onClick={(e)=>handleUpdateTestimonial(e)} > Send Testimonial </button>
                        </div>
                      </div>
                </div>
                     :<div className={pageClasses.card} key={item.from} style={{marginBottom:"25px"}} >
                    <div className={pageClasses.card_container}>
                    {!item.isAnonymous ? <div style={{marginTop:"10px"}} > <i className={"fa fa-user " + pageClasses.person_icon} ></i> <p style={{fontWeight:"bold",fontSize:"28px"}} >{item.name + " " + item.surname }</p> </div> :<p> Anonymous </p>}
                    <hr/>
                     <p className={pageClasses.testimonial_text}> <i class="fa-solid fa-quote-left"></i> {item.testimonial_text} <i class="fa-solid fa-quote-right"></i> </p>
                    <StarRating rating={item.rating} />
                    <p  className={pageClasses.button_class} onClick={()=>setShowEdit(prev => !prev)} style={{"cursor":"pointer"}} > Edit this testimonial </p>
                    <p className={pageClasses.button_class_red} onClick={()=> deleteTestimonial(currentUser.uid,doctorId,props,userData) } style={{"cursor":"pointer"}} > Delete this testimonial </p>
                    </div>
                </div>}
                     </div>
                // 
            }else{           
                return (
                  <div style={{marginBottom:"25px"}} key={item.from} className={pageClasses.card}>
                <div className={pageClasses.card_container}>
                {!item.isAnonymous ? <div style={{marginTop:"10px"}} > <i className={"fa fa-user " + pageClasses.person_icon} ></i> <p style={{fontWeight:"bold",fontSize:"28px"}} >{item.name + " " + item.surname }</p> </div> :<div style={{marginTop:"10px"}} ><i className={"fa fa-user " + pageClasses.person_icon} ></i><p style={{color: "rgb(169, 169, 169)",}} > Anonymous </p></div>}
                        <p className={pageClasses.testimonial_text}> <i class="fa-solid fa-quote-left"></i> {item.testimonial_text} <i class="fa-solid fa-quote-right"></i> </p>
                        <StarRating rating={item.rating} />
                        <p className={pageClasses.button_class_red} onClick={()=> handleShowReportTestimonialPanel(item.testimonial_id)} > Report this testimonial </p>
                        {alreadyReported ? <p>This testimonial is already reported</p> :showReportPanel && <div>
                            <label htmlFor="select" style={{fontWeight:"bold"}} > Select a reason </label>
                            <select onChange={(e)=>handleReportReason(e)} >
                                  <option defaultValue={"misleading"} >Misleading</option>
                                  <option>Irrelevant</option>
                                  <option>Offensive language</option>
                                  <option>Spam</option>
                                  <option>Other</option>
                              </select><br></br><br />
                              <div className={pageClasses.report_text_area_container} >
                              <label style={{fontWeight:"bold"}} htmlFor="textarea">Additional Info</label>
                              <textarea className={pageClasses.textarea_container} type="text" ref={textRef} onChange={(e)=>handleReportText(e)} style={{"width":"300px","height":"100px"}} ></textarea> <br></br>
                              </div>
                              <button style={{marginBottom:"10px"}} className={pageClasses.button_class_red} type="submit"onClick={(e)=>handleReportTestimonial(e,item.from,currentUser.uid,item.testimonial_id)} > Send Report </button>
                          </div> }
                        
                    </div>
                  </div>
                    
                )
            }
           
  }): <p style={{fontStyle:"italic",color:"rgba(140, 140, 140, 0.92)"}} >There are no testimonials for this doctor yet</p> }
        </div>

    </div>
}

