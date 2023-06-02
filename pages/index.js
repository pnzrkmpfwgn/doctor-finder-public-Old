import { FormattedMessage } from "react-intl";
import Link from 'next/link';
import CustomHits from '../components/hitComponent/Hit';
import algoliasearch from 'algoliasearch'
import { InstantSearch,Hits,SortBy,RefinementList,Panel,Menu,Configure,Highlight } from "react-instantsearch-dom";
import {useAuth} from '../firebase/firebase';
import { useEffect,useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import {setLocationData} from "../redux/user_location";
import { useRouter } from "next/router";
import { delay } from "../utils/hooks";
import Image from 'next/image'
import classes from '../styles/mainMenu.module.css';
import input_classes from '../styles/customSearcbar.module.css';
import { connectSearchBox,connectRefinementList } from "react-instantsearch-dom";
import { AnimatePresence,motion } from "framer-motion";


const SearchBox = ({ currentRefinement, isSearchStalled, refine }) => {
  const locations = useSelector(state => state.results.data);
  const router = useRouter();
  const handleLocationSearch = (e) => {
    e.preventDefault();
    // localStorage.clear()
    delay(500)
    // const unique = [];
    // for (const item of locations) {
    //   const isDuplicate = unique.find((obj) => obj.objectID === item.objectID);
    //   if (!isDuplicate) {
    //     unique.push(item);
    //   }
    // }

    // localStorage.setItem("locationData",JSON.stringify(unique))
    delay(1000)
    // console.log(sessionStorage.getItem("locationData"))
    router.push("/search-by-location")
  }
 return <form className={input_classes.form_wrapper}>
    <p style={{fontSize:"20px",fontWeight:"bold"}} > Without any preset you can instantly search with any related keyword</p>
    <input
      type="search"
      style={{width:"60%"}}
      value={currentRefinement}
      onChange={event => refine(event.currentTarget.value)}
      className={input_classes.userpass}
    />
    <button className={input_classes.btnblack} type="submit" value="Search" onClick={(e) => e.preventDefault()}  ><i className="fa fa-search" ></i></button>
    <button className={input_classes.btnblack} onClick={(e)=>handleLocationSearch(e)} > Find the closest </button>
    <SortBy
        defaultRefinement={"Doctors"}
        currentRefinement={"Doctors"}
             items={[
               { value: 'Doctors', label: 'Featured' },
               { value: 'Doctors_rating_desc', label: 'Rating ordered by descending'},
               { value: 'Doctors_rating_asc', label: 'Rating ordered by ascending'},
               { value: 'Doctors_expertise_desc', label: 'Expertise ordered by descending'},
               { value: 'Doctors_expertise_asc', label: 'Expertise ordered by ascending'},
            ]}
        />
    <RefinementList attribute="insurance" />
  </form>
}

const CustomSearchBox = connectSearchBox(SearchBox);


// const RefinementList = ({
//   items,
//   isFromSearch,
//   refine,
//   searchForItems,
//   createURL,
// }) => (
//   <ul>
//     <li>
//       <input
//         type="search"
//         onChange={event => searchForItems(event.currentTarget.value)}
//       />
//     </li>
//     {items.map(item => (
//       <li key={item.label}>
//         <a
//           href={createURL(item.value)}
//           style={{ fontWeight: item.isRefined ? 'bold' : '' }}
//           onClick={event => {
//             event.preventDefault();
//             refine(item.value);
//           }}
//         >
//           {isFromSearch ? (
//             <Highlight attribute="label" hit={item} />
//           ) : (
//             item.label
//           )}{' '}
//           ({item.count})
//         </a>
//       </li>
//     ))}
//   </ul>
// );

// const CustomRefinementList = connectRefinementList(RefinementList);


export default function Home({locale}) {
  const currentUser = useAuth();
  const dispatch = useDispatch();
  const locations = useSelector(state => state.results.data);
  const userData = useSelector(state => state.userData.data);
  const router = useRouter();


  //Local States
const [recordFound,setRecordFound] = useState(false); 

//Legacy Local States
  //const [searchTerm,setSearchTerm] = useState("");
  //const [data,setData] = useState(null)

  useEffect(()=>{
    if(typeof window!=="undefined"){
      console.log(localStorage.getItem("locationData"))
    }
  },[])

  useEffect(()=>{
    const successCallback = (position) => {
      // console.log(position);
    };
    
    const errorCallback = (error) => {
      console.log(error);
    };
    dispatch(setLocationData(navigator.geolocation.getCurrentPosition(successCallback, errorCallback)))
  },[dispatch])


  //Algolia settings
  const searchClient = algoliasearch("FRQUE711DV","366fc87e044a0f4d69976375ba843a6a")

  //LEGACY search function
  // const handleSearch = () =>{
  //   setData(search(searchTerm))
  // }
  // console.log(data)
  // console.log(location)
  
  

  const handleLocationSearch = () => {
    localStorage.clear()
    delay(500)
    const unique = [];
    for (const item of locations) {
      const isDuplicate = unique.find((obj) => obj.objectID === item.objectID);
      if (!isDuplicate) {
        unique.push(item);
      }
    }

    // console.log(unique)
    localStorage.setItem("locationData",JSON.stringify(unique))
    delay(1000)
    // console.log(sessionStorage.getItem("locationData"))
    router.push("/search-by-location")
  }

  return (
    <>
       {/* eslint-disable-next-line @next/next/no-img-element */}
       <img
            src={"/background.jpg"}
            alt='slides'
            className={classes.slides}
          />
    <div className={classes.main_container} >
    
      <AnimatePresence>
        <motion.div className={classes.Heading} 
        initial={{ opacity: 0, translateX: -100 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ duration: 0.5 }}
        >
          <h1>Welcome To Doctor Finder...</h1>
        </motion.div>
        <div className={classes.explanation_container} >
        <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={classes.explanation}>
        <i className="fa fa-search" ></i>
        <p>Find medical personel you look for</p>
        </motion.div>
        <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5,delay:1.5 }}
        className={classes.explanation} >
        <i class="fa-solid fa-users-viewfinder"></i>
          <p> Inspect the medical personels </p>
        </motion.div>
        <motion.div
        className={classes.explanation}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5,delay:2.5 }} >
          <i className="fa-regular fa-calendar-check" ></i>
          <p> Then book your appointment </p>
        </motion.div>
        </div>
      </AnimatePresence>
    {/* {currentUser ? <Link href="/chat-page" > Get Help by Support Agent </Link> : "" } */}
     <div>
      {/* <p><FormattedMessage id="heading_main_menu" defaultMessage="Default" values={{locale}} /></p> */}
      {/* {userData ? userData.role ==="patient" ? <Link href="/patient-profile" > 
        <FormattedMessage id="user_main_menu_profile_link"  defaultMessage="Default" values={{locale}} /> 
        </Link> : userData.role==="doctor" ? <Link href="/doctor-profile" > 
        <FormattedMessage id="user_main_menu_profile_link"  defaultMessage="Default" values={{locale}} /> 
        </Link>: "" : ""} */}
     </div>
     
      <motion.div 
      
       className={classes.main_body} >
      <InstantSearch searchClient={searchClient} indexName="Doctors" onSearchParameters={(searchState)=>{
        setRecordFound(true)
      }} >

          <motion.div
          initial={{ opacity: 0, scale: 0,translateY:100 }}
          animate={{ opacity: 1, scale: 1,translateY:0 }}
          transition={{ duration: 0.5,delay:3.5 }}
          className="site-grid">
          <CustomSearchBox />
          
           {recordFound && <CustomHits hitComponent={Hits} /> }
          </motion.div>
      </InstantSearch>
      </motion.div>
    </div>
    </>
  )
}

//LEGACY search bar
/* <div style={{"width":"50%","marginLeft":"20px"}} >
    <div className="search-wrapper">
    <label htmlFor="search">Search Doctors</label>
    <input type="search" id="search" onChange={(e)=>setSearchTerm(e.target.value)} />
    <button onClick={()=>handleSearch()} > Search </button>
      </div>
      <div className="user-cards" >Results</div>
      <template  />
    {/* {data ? data.map(item=>{
      return <div key={item.id} className="card">
      {item.expertise}
      <div className="header" >{item.name + " " + item.surname}</div>
      <div className="body" >{item.title}</div>
    </div>
    }) : ""} */

  //</div> */}