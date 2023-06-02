import {useAuth} from '../firebase/firebase';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from "react-redux";
import { IntlProvider, FormattedMessage } from 'react-intl';
import {message} from '../data/langData';
import classes from '../styles/doctorProfile.module.css';
import Link from 'next/link'
import StarRating from '../components/StarRating';

const PatientProfile = () =>{
    const currentUser = useAuth();
    const router = useRouter();

    const doctorData =useSelector(state => state.userData.data);
    const language = useSelector(state => state.theme.language)


    return <IntlProvider locale={language} messages={message[language]} >
    <div>
        {currentUser===null || currentUser===undefined ? <div> Loading </div> :<div>
        {Object.keys(doctorData).length ===0 ? "Loading":
        <>
        <div style={{marginLeft:"100px"}} >
            <div className={classes.card} >
                <div className={classes.card_container} >
                    <div className={classes.profile_container} >
                    <i className={'fa fa-user ' + classes.person_icon} ></i>
                    <p><span className={classes._area} ><FormattedMessage id="user_profile_user_fullname" defaultMessage="Default" values={{language}} /> :</span> {doctorData.name + " " + doctorData.surname}</p> 
                    <p> <span className={classes._area} ><FormattedMessage id="user_profile_user_phone_number" defaultMessage="Default" values={{language}} /> :</span> {doctorData.phone_number} </p>
                    <p> <span className={classes._area} > <FormattedMessage id="user_profile_user_status" defaultMessage="Default" values={{language}} /> : </span> {doctorData.verified 
                    ? <FormattedMessage id="user_verified_positive" defaultMessage="Default" values={{language}} />
                    :<FormattedMessage id="user_verified_negative" defaultMessage="Default" values={{language}} />} </p>
                    <p className={classes._area_red} > {!doctorData.verified ?<FormattedMessage id="user_verification_instruction" defaultMessage="Default" values={{language}} /> : ""}</p>
                    <p> <span className={classes._area}><FormattedMessage id="doctor_expertise" defaultMessage="Default" values={{language}} />:</span> {doctorData.expertise} </p>
                    <p className={classes._area}>Rating:</p>
                    <StarRating rating={doctorData.rating} />
                    <div style={{marginBottom:"30px",display:"flex",flexDirection:"row",justifyContent:"space-evenly"}} >
                    <div>
                    <Link className={classes.button_class} href={"/doctor-edit-profile"}> <FormattedMessage defaultMessage="Default" id="user_profile_edit_button" values={{language}} /></Link><br />
                    <Link className={classes.button_class} href="/determine-locations" > <FormattedMessage id="doctor_location_link" defaultMessage="Default" values={{language}} /> </Link>
                    <Link className={classes.button_class} href="/doctor-insurance" > <FormattedMessage id="doctor_insurance_link" defaultMessage="Default" values={{language}} /> </Link>
                    </div>
                    <div>
                    <Link className={classes.button_class} href="/doctor-schedule" > <FormattedMessage id="doctor_schedule" defaultMessage="Default" values={{language}} /> </Link>
                    {/* to be implemented */}
                    <Link className={classes.button_class} href="/your-testimonials" > <FormattedMessage id="doctors_testimonial_link" defaultMessage="Default" values={{language}} /> </Link>
                    </div>
                    </div>
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