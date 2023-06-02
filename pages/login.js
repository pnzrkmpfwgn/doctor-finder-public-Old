import {login,useAuth} from '../firebase/firebase';
import { useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {setLoading} from '../redux/authentication';
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../data/langData';
import { useRouter} from 'next/router'; 
import classes from '../styles/patientLogin.module.css';

export default function Login(){
    const loading = useSelector(state => state.auth.loading);
    const language = useSelector(state => state.theme.language)
    const dispatch = useDispatch();

    const router = useRouter();

    const emailRef = useRef();
    const passwordRef = useRef();
    const currentUser = useAuth();
    console.log(currentUser)

    async function handleLogin(e){
      e.preventDefault();
        dispatch(setLoading(true))
        try{
          await login(emailRef.current.value,passwordRef.current.value);
        }catch{
          alert("Error!")
        }
        dispatch(setLoading(false))
        router.push("/");
      }
      
    return <IntlProvider locale={language} messages={message[language]} >
      <h2 className={classes.heading} > Login </h2>
      <div style={{height:"100vh"}} className={classes.containerbig} >
        <div className={classes.loginbox} >
          <p className={classes.info} > Please enter your account information  </p>
      <form id="fields">
         <input className={classes.userpass} ref={emailRef} placeholder='Email' type="email" />
          <input className={classes.userpass} ref={passwordRef} type="password" placeholder='Password' />
      <button className={classes.btnblack} disabled={loading || currentUser !== null} onClick={(e)=>handleLogin(e)}><FormattedMessage id="login_button" defaultMessage="Default" values={{language}} /></button>
      </form>
        </div>
      
    </div>
    </IntlProvider>
}