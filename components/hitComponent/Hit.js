import Link from "next/link";
import { useEffect,useState } from "react";
import { setLocationsData } from "../../redux/locationResults";
import { useSelector,useDispatch } from "react-redux";
import { connectHits } from 'react-instantsearch-dom';
import classes from '../../styles/hitStyles.module.css'
import {motion,AnimatePresence, animate} from 'framer-motion';
import {useRouter} from 'next/router'
import StarRating from "../StarRating";


const Hit = ({hits}) => {
    
    useEffect(()=>{
        if(typeof window !=="undefined"){
            localStorage.setItem("locationData",JSON.stringify(hits))
        }
    },[hits])
    const router = useRouter();
    const handleDetails = (id) => {
        router.push(`doctor-page/${id}`)
    }
    return <AnimatePresence>
        <div
        className={classes.container} >
        {
            hits.map(hit=>(
                <>
                <motion.div
                key={hit.objectID}
                onClick={()=>handleDetails(hit.objectID)}
                initial={{opacity:0,translateY:-100}}
                whileInView={{opacity:1,translateY:0}}
                transition={{duration:0.6,type: "spring", stiffness: 30}}
                viewport={{ once: true, }}
                whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.5 },
                    background:"lightblue"
                  }}
                  whileTap={{ scale: 0.96 }}
                className={classes.card_hit}>
                <div>
                <div style={{display:"flex",justifyContent:"center",alignContent:"center",}} >
                <i className={"fa fa-user " + classes.person_icon} ></i>
                <div className={classes.card_hit_name}>
                    { hit.title + " " + hit.name + " " +  hit.surname}
                    <div className={classes.card_hit_sub}>
                    {hit.expertise}
                </div>
                </div>
                </div>

                <section>
                    <div className={classes.card_hit_insurance}>
                        <span style={{"fontWeight":"bold"}} > Insurances: </span>{" " +hit.insurance + " "}
                    </div>
                    <div className={classes.card_hit_numeric}>
                    <StarRating rating={hit.rating} />
                    </div>
                    <section>
                        {/* <Link href={`doctor-page/${hit.objectID}`} >Details</Link> */}
                    </section>
        
                </section>
                </div>
                <i className={"fa-solid fa-chevron-right " + classes.link} ></i>
            </motion.div>
            </>
            ))
        }
    </div>
    </AnimatePresence>
}
const CustomHits = connectHits(Hit);

export default CustomHits;