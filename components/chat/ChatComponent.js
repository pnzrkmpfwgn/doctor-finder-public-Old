import {useCollectionData} from 'react-firebase-hooks/firestore';
import {collection,limit,orderBy,query,serverTimestamp,addDoc,doc,getDoc} from 'firebase/firestore';
import { useSelector,useDispatch } from 'react-redux';
import Image from 'next/image';
import {useState,useRef, useEffect} from 'react';

import classes from '../../styles/chatStyle.module.css';

import {useAuth,db,realtimeDb,checkOnline} from '../../firebase/firebase';
import { ref, onValue,update, onDisconnect,set,get } from "firebase/database";
import { setSupportAgentId } from '../../redux/supportAgentState';
import { useRouter } from 'next/router';
import Link from 'next/link';

const ChatMessage = (props) =>{
    const {text,uid} = props.message;
    const currentUser = useAuth();
    const userData = useSelector(state => state.userData.data)
    const supportAgentData = useSelector(state => state.supportAgentData.data)

    const messageClass = uid === props.userId ? 'sent' : 'received';
    
    return <>{currentUser ? uid === currentUser.uid ? <div className={classes.message + " " + messageClass} >
    <Image className={classes.image} src={"/user-picture.png"} alt="" width="75" height="75" />
     <p> {userData.name + " " + userData.surname} </p> <p className={classes.message} > {text} </p></div> : <div className={classes.message_participant + " " + messageClass} >
     <p> {supportAgentData.name + " " + supportAgentData.surname} </p> <p className={classes.message_participant} > {text} </p>
        <Image className={classes.image} src={"/user-picture.png"} alt="" width="75" height="75" />
    </div> : ""}</>
}

const ChatRoom = () => {
    const router = useRouter();
    const ChatRoomId = useSelector(state => state.supportAgentData.ChatRoomId);
    let messagesRef = ()=>{}
    try{
        messagesRef = collection(db,router.query.cid)
    }catch{
        messagesRef = collection(db,"default")
    }

    const currentUser = useAuth();
    const q = query(messagesRef,orderBy("createdAt"),limit(25));
    
    const dispatch = useDispatch();
    
    const supportAgentId = useSelector(state => state.supportAgentData.id);

    const [messages] = useCollectionData (q,{idField:'id'})

    const [formValue,setFormValue] = useState('');
    const dummy = useRef();

    const sendMessage = async(e) => {
        e.preventDefault();

        const {uid,photoURL} = currentUser;

        await addDoc(messagesRef,{
            text:formValue,
            createdAt:serverTimestamp(),
            uid
        })

        setFormValue('')
        dummy.current.scrollIntoView({behavior:'smooth'})
    }

console.log(messages)

const closeChat = ()=>{
    router.push("/");
}

    return <div classes={classes.chat_body} >
        <button onClick={()=>closeChat()} >X</button>
        <div>
            {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        </div>
        <div ref={dummy} > </div>
        <form  className={classes.form_style} onSubmit={sendMessage} >
            <input className={classes.input_body} value={formValue} onChange={(e)=>setFormValue(e.target.value)} />

            <button className={classes.btn} type='submit' >&gt;</button>
        </form>
    </div>
}

export default ChatRoom