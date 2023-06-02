import { useEffect } from "react";
import {useAuth,logOut,getUserData,getDoctorIds} from '../../firebase/firebase';
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { IntlProvider,FormattedMessage } from "react-intl";
import LayoutContext from "./layoutContext";
import { useSelector, useDispatch } from "react-redux";
import { setLanguage } from "../../redux/theme";
import {useCookies} from 'react-cookie';
import {message} from '../../data/langData';
import Link from 'next/link';
import { useRouter} from 'next/router';
import {setLoading} from '../../redux/authentication';
import { setUserData } from "../../redux/currentUserState";
import { setSupportAgentData } from "../../redux/supportAgentState";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useOnScreen,useMediaQuery } from '../../utils/hooks'
import classes from '../../styles/layout.module.css';



//Using Redux reducers at the top of the component tree
//import {increment,decrement,incrementByAmount} from '../../redux/counter'

//Might be useful for later
//import { useOnScreen,useMediaQuery } from '../../utils/hooks';
//


export default function Layout(props) {
  const [cookie, setCookie] = useCookies(["lang"])

  // const loading = useSelector(state => state.auth.loading);
  const language = useSelector(state => state.theme.language);
  const userData = useSelector(state => state.userData.data);
  const [ref, visible] = useOnScreen({ rootMargin: '-100px' })
  const size = useMediaQuery(768)
  
  // console.log(userData);

  //@LEGACY
  // const patientData = useSelector(state => state.patientData.data);
  // const doctorData = useSelector(state => state.doctorData.data);
  const dispatch = useDispatch();

  const router = useRouter();

  const user = useAuth();
    //Get the global state
   
    //using dispatch function to dispatch actions
    


 // const [size, setSize] = useState();
  //const [ref, visible] = useOnScreen({ rootMargin: '-100px' })
  //const size = useMediaQuery(768)
  // useEffect(() => {
  //   setSize(document.body.clientWidth);
  // }, []);
  // useEffect(() => {
  //   const onResize = (e) => {
  //     setSize(e.target.outerWidth);
  //   };
  //   window.addEventListener("resize", onResize);
  //   return () => {
  //     window.removeEventListener("resize", onResize);
  //   };
  // }, []);

  // console.log(userData)

  useEffect(()=>{
    (async()=>{
    const data= await getDoctorIds();
    // console.log(data)
   })()
    const getData = async () =>{
      try{
          const userData = await getUserData(user.uid);
          dispatch(setUserData(userData));
          // console.log(patientData);
      }catch(error){
          console.log(error)
      }
  }
  const timer = setTimeout(()=>{
      if(user){
        if(userData && Object.keys(userData).length === 0){
          getData();
      }
      }
  },1000)
  
    if(cookie.lang){
      dispatch(setLanguage(cookie.lang))
    }else if(navigator.language){
      let ln = navigator.language.split("-")
      dispatch(setLanguage(ln[0]))
      setCookie("lang",ln[0])
    }

    return ()=> clearTimeout(timer);

  },[cookie, dispatch, userData, setCookie, user])
  
  // console.log(patientData)
  // console.log(user)

  
  return (
    <>
    <LayoutContext.Provider value={language} >
   
    <IntlProvider locale={language} messages={message[language]} >
    {size ? null : <div ref={ref} className={classes.content} ></div>}
    <Header visible={visible} />
     <main title="Main">
       {props.children}
     </main>
     <Footer footer_title={<FormattedMessage id="heading" defaultMessage="Default" values={{language}} />} />
    
    
    </IntlProvider>
    </LayoutContext.Provider>
    </>
  );
}