import React, { useState,useEffect ,useRef, useCallback, useMemo} from "react";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import TextField from "@mui/material/TextField";
import TextsmsIcon from '@mui/icons-material/Textsms';
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
    const [maches, setmaches] = useState(window.matchMedia("(min-width:768px)").matches)
    const [msg,setmsg]=useState('')
    const [msgsent, setmsgsent] = useState(false)
    const [messages,setmessages]=useState([])
    const [onlineusers,setonlineusers] =useState([])
    const [notified,setnotified]=useState([])
    const [emojipicked,setemojipicked]=useState(false)
    const [filtered,setfiltered]=useState([])
    const [searchval, setsearchval] = useState('')
    const navigate=useNavigate()
    let me=(sender.Name+reciever.Name).split('').sort().join(',')
   
    useEffect(() => {
      let user1=localStorage.getItem('user')
  
    if(!user1){
   
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
          socket.current.on('leave',(data)=>{
            const senddata=async()=>{
              try{
                  const res=  await axios.post('https://chatappbackend-3ieq.onrender.com/user/lsupdate',{data})
                  if(res.status==200){
                    console.log(data)
                  }
                   
                   }catch(err){
                     console.log(err)
                   }
           }
           senddata()
            
          })
          return () => {
            socket.current.off('leave')
            
          }
         
        }, [socket.current])
        

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
    console.log(data,'s')
   })

  return () => {
    socket.current.off('member')
    console.log()
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

   method:'get'

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

const formattime=useCallback((time) => {

  const start=moment(time,'D-MM-YYD hh:mm:ss')
  const mintdiff=moment(moment(time)).fromNow()
  console.log(time)
  return mintdiff
},[])

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


useEffect(()=>{
  let arr=[]
  if(searchval!==null||''){
   
    users?.filter(e=>e.Name!==sender.Name)?.forEach((elem)=>{
     
     if(elem.Name?.toLowerCase().search(searchval?.toLowerCase())> -1) {
      arr.push(elem)
    
     }
    }
      )
      if(arr){
        setfiltered(arr)
      }
  
  }else{
setfiltered(users?.filter(e=>e.Name!==sender.Name))
  }
},[searchval,users])
  
    useEffect(() => {
 const fetchdata=async()=>{
    try{
        const res=  await axios.get('https://chatappbackend-3ieq.onrender.com/user/all')
        if(res.status==200){
            setusers(res.data)
        }
         
         }catch(err){
          localStorage.removeItem('user')
          navigate('/login')

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
            {/* <Avatar sx={{ bgcolor: deepOrange[500] }}>{sender?.Name[0]}</Avatar> */}
           {sender.image? <img className="avtar" src={sender.image}  />:<Avatar sx={{ bgcolor: deepOrange[500] }}>{sender?.Name[0]}</Avatar>}
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
              value={searchval}
              onChange={(e)=>setsearchval(e.target.value)}
              color="primary"
              focused
            />
         
          <div>
          {filtered?.map((elem)=>{
            return <div className="user">
                  <div>
                    {elem.image?<img className="avtar" src={elem.image} alt="no" />:<Avatar sx={{ bgcolor: deepOrange[500] }}>{elem?.Name[0]}</Avatar>}
                
            </div>
            <div className={elem.Name==reciever.Name ?'active':'inactive'}>
              <b onClick={()=>{setreciever(elem);clearnotified(elem.Name)}} style={{cursor:"pointer"}} >{elem.Name}</b> 
              
              {!checkonline(elem.Name)&&<p style={{fontSize:"12px"}}>last seen {formattime(elem.Lastseen)}</p>}
            </div>
            <div className="notification">
            {checknewmsg(elem.Name)&&<TextsmsIcon sx={{ color: 'blue'}}/>}
              
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
            {/* <Avatar sx={{ bgcolor: deepOrange[500] }}>{reciever?.Name[0]}</Avatar> */}
            {reciever.image&&  <img className="avtar" src={reciever.image} alt="" />}
            </div>
            <div className="notification">
             {reciever.Occupation&& <b  style={{color:"blue"}}>{reciever?.Name}(<small className="oc">{reciever.Occupation}</small>)</b>}
              {checkonline(reciever?.Name)&&<p className="online"></p>} 
               
             {reciever.Occupation&& !checkonline(reciever.Name)&&<p className="ls" style={{fontSize:"14px"}}>last seen {formattime(reciever.Lastseen)}</p>}
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
            return <div className={elem.user==sender.Name?'right':"left"}>
                <div>
                <Avatar sx={{ bgcolor: deepOrange[500] }}>{elem.user&&elem.user[0]}</Avatar>
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
             {maches&&<SentimentSatisfiedAltIcon onClick={()=>setemojipicked(!emojipicked)}/>}
           
           <div  className={emojipicked?'block':'none'} ><EmojiPicker  height={400} width={400} onEmojiClick={(e)=>setmsg(msg+e.emoji)} /></div> 
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
