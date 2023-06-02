import {signUpAsDoctor,signUpAsPatient ,useAuth} from '../firebase/firebase';
import { useRef,useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {setLoading} from '../redux/authentication';
import { IntlProvider,FormattedMessage } from "react-intl";
import {message} from '../data/langData';
import { useRouter} from 'next/router';
import classes from '../styles/signUp.module.css';
export default function SignUp(){
    const loading = useSelector(state => state.auth.loading);
    const language = useSelector(state => state.theme.language);
    const [gender, setGender] = useState("male");
    const [nationality, setNationality] = useState("tc")
    const [show,setShow] = useState("");
    const [insurance, setInsurance] = useState([]);
    const dispatch = useDispatch();
    const router = useRouter();


    const emailRef = useRef();
    const passwordRef = useRef();
    const nameRef = useRef();
    const surnameRef = useRef();
    const card_idRef = useRef();
    const medical_lic_idRef = useRef();
    const phone_numberRef = useRef();
    const expertise_ref = useRef();
    const insurance_ref = useRef();
    const title_ref = useRef();
    const currentUser = useAuth();

    async function handleSignUp(){
        dispatch(setLoading(true))
        try{
          await signUpAsPatient(emailRef.current.value,passwordRef.current.value,
            nameRef.current.value,
            surnameRef.current.value,
            gender,
            nationality,
            card_idRef.current.value,
            phone_numberRef.current.value,
            insurance
            );
        }catch{
          alert("Error!")
        }
        dispatch(setLoading(false))
        router.push("/patient-edit-profile")
      }

      const handleInsurance = () => {
        const insurance = insurance_ref.current.value
        setInsurance(prev => {
          const array = [...prev,insurance]
          const uniqueArray = [...new Set(array)]

          return uniqueArray
        })
        insurance_ref.current.value = "";
        
      }

      const handleShow = (e) => {
        setShow(e);
      }

      const handleChange = (e) => {
        setGender(e.target.value);
      };

      const handleIdCardChange = (e) => {
        setNationality(e.target.value);
      }
      console.log( show ? classes.selection_button  + " " +  classes.selected_button : classes.selection_button)
    return <IntlProvider locale={language} messages={message[language]} >
        <div style={{ display:"flex",justifyContent:"center",alignItems:"center"}} >
        <div className={classes.selection_container} >
            <div onClick={()=>handleShow("patient")} className={show==="patient" ?  classes.selection_button  + " " +  classes.selected_button : classes.selection_button } > Register as patient </div>
            <div onClick={()=>handleShow("doctor")} className={show==="doctor" ? classes.selection_button  + " " +  classes.selected_button : classes.selection_button} > Register as doctor </div>
        </div>
        </div>
    {
        show ==="patient" ?
        <div>
    <div className={classes.signupbox} >
    <div id="fields" >

    <div className={classes.row}>

    <div className={classes.rowright}>
    <input className={classes.userinput} ref={emailRef} placeholder='Email' type="email" /> <br /> <br />
    <input className={classes.userinput} ref={passwordRef} type="password" placeholder='Password' /> <br /> <br />
    <div className={classes.selectdropdown}>
    <select onChange={handleIdCardChange}>
    <option value="tc" >T.C. Kimlik</option>
    <option value="kktc" >K.K.T.C. Kimlik</option>
    <option value="uk" >British ID Card</option>
    </select>
    </div>  <br /> <br />
    <input className={classes.userinput} ref={card_idRef} placeholder='ID No.' /> <br /> <br /> 
    <input className={classes.userinput} ref={medical_lic_idRef} placeholder='Medical License ID' /> <br /> <br /> 
    <input className={classes.userinput} ref={expertise_ref} placeholder='Expertise' /> <br /> <br /> 
    </div>

    <div className={classes.rowleft}>
    <input className={classes.userinput} ref={nameRef} placeholder='Name' /> <br /> <br />
    <input className={classes.userinput} ref={surnameRef} placeholder='Surname' /> <br /> <br />
    <div className={classes.selectdropdown}>
    <select onChange={handleChange}>
    <option value="male" ><FormattedMessage id="sign_up_gender_male" defaultMessage="Default" values={{language}} /></option>
    <option value="female" ><FormattedMessage id="sign_up_gender_female" defaultMessage="Default" values={{language}} /></option>
    </select>
    </div> <br /> <br />
    <input className={classes.userinput} ref={title_ref} placeholder='Title' /> <br /> <br /> 
    <input className={classes.userinput} ref={phone_numberRef} type="tel" placeholder='Phone Number' /> <br /> <br />
    <input className={classes.userinput} ref={insurance_ref} placeholder='Insurance' /> 
    <button className={classes.btnblack} onClick={handleInsurance} > Add </button><br /> <br />
    </div> 
    </div>
    
    <div className={classes.buddon}>
    <button className={classes.btnblack} disabled={loading || currentUser !== null} onClick={handleSignUp}><FormattedMessage id="signup" defaultMessage="Default" values={{language}} /></button>
    </div>
   
    </div> 
    
    </div>
    </div>
        :
         <div>
        <div className={classes.signupbox} >
        <div id="fields" >
    
        <div className={classes.row}>
    
        <div className={classes.rowright}>
        <input className={classes.userinput} ref={emailRef} placeholder='Email' type="email" /> <br /> <br />
        <input className={classes.userinput} ref={passwordRef} type="password" placeholder='Password' /> <br /> <br />
        <div className={classes.selectdropdown}>
        <select onChange={handleIdCardChange}>
        <option value="tc" >T.C. Kimlik</option>
        <option value="kktc" >K.K.T.C. Kimlik</option>
        <option value="uk" >British ID Card</option>
        </select>
        </div>  <br /> <br />
        <input className={classes.userinput} ref={card_idRef} placeholder='ID No.' /> <br /> <br /> 
        <input className={classes.userinput} ref={medical_lic_idRef} placeholder='Medical License ID' /> <br /> <br /> 
        <input className={classes.userinput} ref={expertise_ref} placeholder='Expertise' /> <br /> <br /> 
        </div>
    
        <div className={classes.rowleft}>
        <input className={classes.userinput} ref={nameRef} placeholder='Name' /> <br /> <br />
        <input className={classes.userinput} ref={surnameRef} placeholder='Surname' /> <br /> <br />
        <div className={classes.selectdropdown}>
        <select onChange={handleChange}>
        <option value="male" ><FormattedMessage id="sign_up_gender_male" defaultMessage="Default" values={{language}} /></option>
        <option value="female" ><FormattedMessage id="sign_up_gender_female" defaultMessage="Default" values={{language}} /></option>
        </select>
        </div> <br /> <br />
        <input className={classes.userinput} ref={title_ref} placeholder='Title' /> <br /> <br /> 
        <input className={classes.userinput} ref={phone_numberRef} type="tel" placeholder='Phone Number' /> <br /> <br />
        <input className={classes.userinput} ref={insurance_ref} placeholder='Insurance' /> 
        <button className={classes.btnblack} onClick={handleInsurance} > Add </button><br /> <br />
        </div> 
        </div>
        
        <div className={classes.buddon}>
        <button className={classes.btnblack} disabled={loading || currentUser !== null} onClick={handleSignUp}><FormattedMessage id="signup" defaultMessage="Default" values={{language}} /></button>
        </div>
       
        </div> 
        
        </div>
        </div>
    }
  </IntlProvider>
}