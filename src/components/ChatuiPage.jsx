import React, { useState,useEffect ,useRef, useCallback} from "react";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import TextField from "@mui/material/TextField";

import CreateTwoToneIcon from '@mui/icons-material/CreateTwoTone';
import AddAPhotoTwoToneIcon from '@mui/icons-material/AddAPhotoTwoTone';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SendIcon from '@mui/icons-material/Send';
import axios from "axios";
import moment  from 'moment'
import EmojiPicker from 'emoji-picker-react';
import { Emoji, EmojiStyle } from 'emoji-picker-react';
import Avatar from '@mui/material/Avatar';
import { deepOrange, deepPurple } from '@mui/material/colors';
import io from "socket.io-client";
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router-dom";
import jwt_decode from 'jwt-decode'

const ChatuiPage = () => {
    const [users,setusers]=useState(null)
   
    const [sender,setsender]=useState ( () => {
        const savedItem = JSON.parse(localStorage.getItem("user"));
        
       const parsedItem =savedItem? jwt_decode(savedItem):'';
       return parsedItem.user || {Name:""};
       });
      
    const socket = useRef();
    const messageRef=useRef(null)
    const [reciever,setreciever]=useState({Name:"You"})
    const [id, setid] = useState('');
    
    const [msg,setmsg]=useState('')
    const [msgsent, setmsgsent] = useState(false)
    const [messages,setmessages]=useState([])
    const [onlineusers,setonlineusers] =useState([])
    const [notified,setnotified]=useState([])
    const [emojipicked,setemojipicked]=useState(false)
    const navigate=useNavigate()
    let me=(sender.Name+reciever.Name).split('').sort().join(',')
   
    useEffect(() => {
      let user1=localStorage.getItem('user')
  
    if(!user1){
     navigate('/login')
    }
    },[localStorage.getItem('user')])

    useEffect(()=>{
        socket.current=io.connect("https://chatappbackend-3ieq.onrender.com") 
        return () => {
          socket.current.disconnect();
        };
      },[reciever.Name])

      useEffect(()=>{
        messageRef.current.scrollIntoView()
        },[messages])

  

      useEffect(() => {
        
        console.log(sender.Name,reciever.Name)
      
          socket.current.on('connect',()=>{
             
              setid(socket.current.id);
            
                socket.current.emit('getname',{User:sender.Name})
               
             
                socket.current.emit('joined',{room:me,user:sender.Name});
             
               
             
          })

      }, [sender.Name,socket.current,reciever.Name]);

useEffect(() => {
  socket.current.on('member',(data)=>{
    setonlineusers(data.users2)
    console.log(data)
   })

  return () => {
    socket.current.off('member')
  }
}, [socket.current])

useEffect(() => {
  socket.current.on('notify',(data)=>{
    setnotified((prev)=>(
      [...prev,data]
    ))
    console.log(data)
   })

  return () => {
    socket.current.off('notify')
  }
}, [socket.current])


useEffect(() => {
  socket.current.on('sendMessage',(data)=>{
    
     setmessages([...messages,data]);
      setmsgsent(!msgsent)
    
    console.log(messages);
     })
}, [msgsent,messages,msg])

useEffect(() => {
  fetch('https://chatappbackend-3ieq.onrender.com/chat/all',{

   method:'get',
   headers:{
     'accept': 'application/json',
     'Access-Control-Allow-Origin': "*",
     'content-type': 'application/x-www-form-urlencoded',
     'Access-Control-Allow-Credentials': 'true',
 }
  } )
  .then(data=>data.json())
  .then(res=>{
  
    let filtered=res.filter(e=>e.room==me)
      
    setmessages(res)
  })
 

}, [reciever.Name])

const checkonline= useCallback(
  (name) => {
   const online=onlineusers.find(e=>e.user==name)
   if(online){
    return true
   }else{
    return false
   }
  },
  [onlineusers],
);
const checknewmsg= useCallback(
  (name) => {
   const notify=notified.find(e=>e.user==name)
 
   
   if(notify && name!=reciever.Name ){
    return true
   }else{
    return false
   }
  },
  [notified,sender.Name]
);

const clearnotified=(name)=>{
 
  const item=notified.filter(e=>e.user!==name)
setnotified(item)
console.log(item)

}
 


const send=(e)=>{
  if(!msg.length>0){
    e.preventDefault()
  }else{
    let time=new Date().getTime()
    socket.current.emit('message',{msg,id,me,time,reciever:reciever.Name});
    
    setmsg('')
    setemojipicked(false)
  }

}

const handlelogout=()=>{
  localStorage.removeItem('user')
  navigate('/login')
}



  
    useEffect(() => {
 const fetchdata=async()=>{
    try{
        const res=  await axios.get('http://localhost:4001/user/all')
        if(res.status==200){
            setusers(res.data)
        }
         
         }catch(err){
           console.log(err)
         }
 }
 fetchdata()
 }, [])
 
    return (
    <div className="main">
      <div className="chatui">
        <div className="fisrtdiv">
          <div>
            <div>
            <Avatar sx={{ bgcolor: deepOrange[500] }}>{sender?.Name[0]}</Avatar>
            </div>
            <div>
              <b style={{color:"blue"}}>{sender?.Name}</b>
              <p>{sender.Occupation}</p>
            </div>
            <div>
              <LogoutIcon onClick={handlelogout} />
            </div>
          </div>
         
          
            <TextField
              placeholder="search user"
              size='small'
              variant="standard"
              color="primary"
              focused
            />
         
          <div>
          {users?.filter(e=>e.Name!==sender.Name)?.map((elem)=>{
            return <div className="user">
                  <div>
                  <Avatar sx={{ bgcolor: deepOrange[500] }}>{elem?.Name[0]}</Avatar>
            </div>
            <div>
              <b onClick={()=>{setreciever(elem);clearnotified(elem.Name)}} style={{cursor:"pointer"}}>{elem.Name}</b>
              <p>{elem.Occupation}</p>
            </div>
            <div className="notification">
            {checknewmsg(elem.Name)&&<p className="notify" >New</p>}
              
            {checkonline(elem.Name)&&<p className="online"></p>} 
            </div>
            </div>
          })}
          </div>
        </div>
        <div className="secondiv">
          <div>
            <div>
            <div>
            <Avatar sx={{ bgcolor: deepOrange[500] }}>{reciever?.Name[0]}</Avatar>
            </div>
            <div className="notification">
              <b  style={{color:"blue"}}>{reciever?.Name}</b>
              {checkonline(reciever?.Name)&&<p className="online"></p>} 
            </div>
            </div>
            <div>
                {/* <SearchOutlinedIcon/>
                <FavoriteBorderOutlinedIcon/>
                <NotificationsNoneIcon/> */}
            </div>
          </div>
         
          <div className="messages">
           
          {messages.filter(e=>e.me==me).map((elem)=>{
            return <div className={elem.user==sender.Name?'left':"right"}>
                <div>
                <Avatar sx={{ bgcolor: deepOrange[500] }}>{elem.user[0]}</Avatar>
              </div>
                <p >{elem.message}<br />  <small style={{textAlign:"end"}}>{moment(elem.time).format('MMMM-DD hh:mm a')}</small></p>
              
            </div>
          })}
           <div ref={messageRef}/>    
           
          </div>
          <form style={{height:"15%",width:"100%"}} >
          <div className="form1">
        
            <div>
            <CreateTwoToneIcon/>
            <TextField id="standard-basic" value={msg} onChange={(e)=>setmsg(e.target.value)} required={true} placeholder="Write something" variant="standard" />
            </div>
            <div>
            {/* <AddAPhotoTwoToneIcon style={{background:"blue",color:"white"}}/> */}
             <SentimentSatisfiedAltIcon onClick={()=>setemojipicked(!emojipicked)}/>
           
           <div  className={emojipicked?'block':'none'} ><EmojiPicker  height={500} width={400} onEmojiClick={(e)=>setmsg(msg+e.emoji)} /></div> 
              <button type="submit"  style={{background:"blue",color:"white",height:'30px'}} onClick={(e)=>{e.preventDefault();send()}}> <SendIcon/></button> 
            </div>
          
          </div>
          </form>
        </div>
        {/* <div className="thirdiv">

        </div> */}
      </div>
    </div>
  );
};

export default ChatuiPage;
