import {useCollectionData} from 'react-firebase-hooks/firestore';
import {collection,limit,orderBy,query,serverTimestamp,addDoc,doc,getDoc} from 'firebase/firestore';
import { useSelector,useDispatch } from 'react-redux';
import Image from 'next/image';
import {useState,useRef, useEffect} from 'react';

import classes from '../../styles/chatStyle.module.css';

import {useAuth,db,realtimeDb,checkOnline} from '../../firebase/firebase';
import { ref, onValue,update, onDisconnect,set,get } from "firebase/database";
import { setChatRoomId } from '../../redux/supportAgentState';
import { setRequestedHelpData } from '../../redux/requestedHelpState';
import { useRouter } from 'next/router';
import Link from 'next/link';




const AgentChatComponent = () => {
    const currentUser = useAuth();
    const requestedHelpData = useSelector(state => state.requestedHelpData.data)
    const [userList,setUserList] = useState([])

    const myConnectionsPatientRef = ref(realtimeDb, "pending/")
    const myConnectionsDoctorRef = ref(realtimeDb, "doctors/")
    const dispatch = useDispatch();

    useEffect(()=>{
        let timer = ()=>{}
        if(currentUser){
                timer = setInterval(async()=> await get(myConnectionsPatientRef).then(snap=>{
                const keys = Object.keys(snap.val())
                let arr =[]
                for(let i = 0 ; i < keys.length;i++){
                   arr.push(snap.val()[keys[i]]) 
                }
                    (async()=>{
                        for(let i = 0 ; i < arr.length;i++){
                            if(arr[i]["connections"] && arr[i]["supportAgentId"]===currentUser.uid){
                                if(arr[i]["role"]==="patient"){
                                    const docRef = doc(db,"Patients",arr[i]["id"]);
                                    const docSnap = await getDoc(docRef);
                                    const data = docSnap.data();
                                    const id = {id:arr[i]["id"]}
                                    Object.assign(data,id)
                                    console.log(data)
                                    setUserList(prev=>{
                                        const array = [...prev,data]
                                        const unique = array.filter(
                                            (obj, index) =>
                                              array.findIndex((item) => item.id === obj.id) === index
                                          );
                                        return unique
                                    })
                                }
                                if(arr[i]["role"]==="doctor"){
                                    const docRef = doc(db,"Doctors",arr[i]["id"]);
                                    const docSnap = await getDoc(docRef);
                                    const data = docSnap.data();
                                    console.log(data.id)
                                    setUserList(prev=>{
                                    const array = [...prev,data]
                                    const unique = array.filter(
                                        (obj, index) =>
                                          array.findIndex((item) => item.name === obj.name) === index
                                      );
                                    return unique
                                })
                                }
                                
                            }
                    }
                    })()
            }),2000)
        } 
    return ()=> clearInterval(timer);

},[currentUser, myConnectionsPatientRef])
//    console.log(userList)
    useEffect(()=>{
        if(currentUser){
            checkOnline(currentUser.uid);
        }
    },[currentUser])
    console.log(userList)
    console.log()
    if(currentUser){
        return <div><h2>People who requested support</h2>
        { userList.length !== 0 && userList.map(item=>{
            console.log(`m_${item.id}_${currentUser.uid}`)
            return <div key={item.id}>
                <Link onClick={()=>{
                    dispatch(setChatRoomId(`m_${currentUser.uid}_${item.id}`))
                    dispatch(setRequestedHelpData(item))
                }} href={
                    {
                        pathname:`/chat-rooms/m_${currentUser.uid}_${item.id}`
                    }
                } > {item.name + " " + item.surname} </Link >
            </div>
            })} <div className={classes.background} >
            
        </div>
    </div>
    }else{
        return <div></div>
    }
    
}

export default AgentChatComponent;