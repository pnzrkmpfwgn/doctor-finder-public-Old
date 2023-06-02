import {useAuth} from '../firebase/firebase';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from "react-redux";
import { IntlProvider, FormattedMessage } from 'react-intl';
import {message} from '../data/langData';
import Link from 'next/link'
import classes from '../styles/patientProfile.module.css';

const PatientProfile = () =>{
    const currentUser = useAuth();
    const router = useRouter();

    const patientData =useSelector(state => state.userData.data);
    const language = useSelector(state => state.theme.language)

    console.log(patientData)

    return <IntlProvider locale={language} messages={message[language]} >
    <div>
        {currentUser===null || currentUser===undefined ? <div> Loading </div> :<div>
        {Object.keys(patientData).length ===0 ? "Loading":
        <>
        <div style={{marginLeft:"100px"}} >
        <div className={classes.card} >
        <div className={classes.card_container}>
        <div className={classes.profile_container} >
       <i className={'fa fa-user ' + classes.person_icon} ></i>
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_fullname" defaultMessage="Default" values={{language}} />:</span>  {patientData.name + " " + patientData.surname}</p> 
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_phone_number" defaultMessage="Default" values={{language}} />:</span>{patientData.phone_number} </p>
        <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_status" defaultMessage="Default" values={{language}} />:</span>  {patientData.verified 
        ? <FormattedMessage id="user_verified_positive" defaultMessage="Default" values={{language}} />
         :<FormattedMessage id="user_verified_negative" defaultMessage="Default" values={{language}} />} </p>
        <p className={classes._area_red} > {!patientData.verified ?<FormattedMessage id="user_verification_instruction" defaultMessage="Default" values={{language}} /> : ""}</p>
        <p> <span className={classes._area} ><FormattedMessage id="patient_insurance" defaultMessage="Default" values={{language}} />:</span>{patientData.insurance.map(e => " " + e + ", ")}</p>
        <Link className={classes.button_class} href={"/patient-edit-profile"}> <FormattedMessage defaultMessage="Default" id="user_profile_edit_button" values={{language}} /></Link>
        <Link className={classes.button_class} href="/patient-insurance" > <FormattedMessage id="patient_insurance_link" defaultMessage="Default" values={{language}} /> </Link>
       <Link className={classes.button_class} href="/patient-schedule" > <FormattedMessage id="patient_appointments" defaultMessage="Default" values={{language}} /> </Link> 
        </div>
        </div>
       </div>
        </div>
       
        </>
        }
        </div> }
    </div>
    </IntlProvider>
}

export default PatientProfile;