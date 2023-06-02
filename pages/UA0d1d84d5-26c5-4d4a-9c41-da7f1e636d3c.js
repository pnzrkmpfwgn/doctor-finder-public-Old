import { useEffect } from "react"; 
import { useSelector,useDispatch } from "react-redux"
import { useAuth,getSupportAgent } from "../firebase/firebase"
import { setSupportAgentData } from "../redux/supportAgentState";
import AgentChatComponent from "../components/chat/AgentChatComponent";

export default function UserAgentControlPanel(){
    const dispatch = useDispatch();
    const userData = useSelector(state => state.supportAgentData.data)
    const currentUser = useAuth();

    

    useEffect(()=>{
        const getData = async () =>{
            try{if(currentUser){
                const userData = await getSupportAgent(currentUser.uid);
                dispatch(setSupportAgentData(userData));
            }
            }catch(error){
                console.log(error)
            }
        }

        const timer = setTimeout(()=>{
            if(currentUser){
              if(userData && Object.keys(userData).length === 0){
                getData();
            }
            }
        },1000)

        return ()=> clearTimeout(timer);
    },[currentUser, dispatch, userData])
    console.log(userData)
    return <div>
        <h1>Support Agent Control Panel</h1>
           {currentUser && userData  && <div>
                <p>Name: {userData.name}</p>
                <p>Surname: {userData.surname}</p>
            </div> }
            <AgentChatComponent />
    </div>
}