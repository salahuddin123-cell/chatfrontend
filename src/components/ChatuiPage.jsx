import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

import Button from "@material-ui/core/Button"
import TextField from "@mui/material/TextField";
import TextsmsIcon from "@mui/icons-material/Textsms";
import CreateTwoToneIcon from "@mui/icons-material/CreateTwoTone";
import Spinner from 'react-bootstrap/Spinner';
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import moment from "moment";
import EmojiPicker from "emoji-picker-react";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Avatar from "@mui/material/Avatar";
import { deepOrange, deepPurple } from "@mui/material/colors";
import io from "socket.io-client";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CancelIcon from '@mui/icons-material/Cancel';

import Peer from "simple-peer"
import { storage } from '../firebase'
import {ref,uploadBytes,getDownloadURL} from 'firebase/storage'
//calling function

// MultiSelectPopover.js

import './MultiSelectPopover.css'; // Import CSS for styling (optional)
import { useStepContext } from "@mui/material";

const MultiSelectPopover = ({ options, onSelect,sender,onClose }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const[gname,setgname]=useState()
  const [err,seterr]=useState(false)
  const popoverRef = useRef(null);

useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        console.log('close')
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item.Name !== option.Name));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleApply = async() => {
    if(!gname){
      seterr(true)
      return
    }
    if(selectedOptions.length==0){
      return
    }
    onSelect(selectedOptions);
    let users=selectedOptions.map(e=>e.Name)
    let ids=selectedOptions.map(e=>e._id)
    let new_users=[...users,sender.Name]
    let new_ids=[...ids,sender._id]
    console.log(gname,selectedOptions)
    try {
      await axios.post('https://chatbackend-n9y2.onrender.com/creategroup',{Name:gname,ids:new_ids,users:new_users})
    } catch (error) {
      console.log(error)
    }
    // You can close the popover or do other actions upon apply
  };

  return (
    <div className="popover"> 
      <div className="popover-content">
        <input type="text" value={gname} placeholder=" group name"  onChange={(e)=>{setgname(e.target.value);seterr(false)}} />
        {err&& <p style={{color:"red",fontSize:"10px",marginBottom:'0'}}>Group name is mandatory</p>}
        <h3>add users</h3>
        <ul>
          {options.filter(e=>e.Name!=sender.Name).map(option => (
            <li key={option}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                {option.Name}
              </label>
            </li>
          ))}
        </ul>
        <div style={{display:'flex',justifyContent:"space-between",padding:"5px"}}>
      <button style={{boder:'none',background:"black",color:"white"}} onClick={handleApply}>Apply</button>
        <CancelIcon onClick={onClose} />
        </div>
       

      </div>
    </div>
  );
};
const MultiSelectPopover2 = ({  setsender,sender,onClose }) => {


  const[name,setname]=useState(sender.Name)
  const[status,setstatus]=useState(sender.Occupation)
  const [err,seterr]=useState(false)







  const handleApply = async() => {
  if(!name|!status){
    seterr(true)
    return
  }
   try {
    const res=await axios.post(`https://chatbackend-n9y2.onrender.com/userupdate/${sender._id}`,{Name:name,status:status})
    
    if(res.status==201){
      setsender({...sender,Name:name,Occupation:status})
      onClose()
    }
   } catch (error) {
    console.log(error)
   }
  };

  return (
    <div className="popover"> 
      <div className="popover-content">
 
        <p style={{fontSize:"12px",marginBottom:'0'}}> status </p>
        <select  value={status} onChange={(e)=>{setstatus(e.target.value);seterr(false)}} >
        <option selected value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Sleeping">Sleeping</option>
                    <option value="In the Gym">In the Gym</option>
        </select>
       
        <div style={{display:'flex',justifyContent:"space-between",padding:"5px"}}>
        {err&& <p style={{color:"red",fontSize:"10px",marginBottom:'0'}}> This field is mandatory</p>}
      <button style={{boder:'none',background:"black",color:"white"}} onClick={handleApply}>update</button>
        <CancelIcon onClick={onClose} />
        </div>
       

      </div>
    </div>
  );
};
const DeletePopover = ({  onClose,deleteUser }) => {



 

  return (
    <div className="popover"> 
      <div className="popover-content">
      <p>Do you really want to delete your account?</p>
      <button style={{boder:'none',background:"black",color:"white" ,marginRight:"20px"}} onClick={deleteUser}>Yes</button>
      <button style={{boder:'none',background:"black",color:"white"}} onClick={onClose}>No</button>
        </div>
       

      </div>
   
  );
};

const ChatuiPage = () => {
  const [users, setusers] = useState(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isPopoverOpen2, setIsPopoverOpen2] = useState(false);
  const [isPopoverOpen3, setIsPopoverOpen3] = useState(false);
  const [sender, setsender] = useState(() => {
    const savedItem = JSON.parse(localStorage.getItem("user"));

    const parsedItem = savedItem ? jwt_decode(savedItem) : "";
    return parsedItem.user || { Name: "" };
  });

  const socket = useRef();
  const messageRef = useRef(null);
  const [reciever, setreciever] = useState({ Name: "You" });
  const [id, setid] = useState("");
  const [maches, setmaches] = useState(
    window.matchMedia("(min-width:768px)").matches
  );
  const [msg, setmsg] = useState("");
  const [group,setgroup]=useState(null)
  const [msgsent, setmsgsent] = useState(false);
  const [messages, setmessages] = useState([]);
  const [onlineusers, setonlineusers] = useState([]);
  const [notified, setnotified] = useState([]);
  const [emojipicked, setemojipicked] = useState(false);
  const [filtered, setfiltered] = useState();
  const [searchval, setsearchval] = useState("");
  const[ groups,setgroups]=useState([])
  const navigate = useNavigate();
  
   let me = group?group.Name:(sender.Name + reciever.Name).split("").sort().join(",");
  //calling state
  const [calling, setcalling] = useState(false);
  const [stream, setStream] = useState('');
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [leavegrp, setleavegrp] = useState(false)
  const [name, setName] = useState("");
  const [options, setoptions] = useState([])
  const myVideo = useRef({ srcObject: null });
  const userVideo = useRef();
  const connectionRef = useRef();
 const [loading,setloading]=useState(true)
 // const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

  const handleSelect = (options) => {
    setSelectedOptions(options);
    setIsPopoverOpen(false);
  };

  useEffect(() => {
    socket.current = io.connect("https://chatbackend-n9y2.onrender.com");
    return () => {
      socket.current.disconnect();
    };
  }, [reciever.Name]);

  //calling function
  // useEffect(() => {
   
  //   navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
  //   .then((currentStream) => {
  //     setStream(currentStream);
  //     //console.log(currentStream)
  //     if(calling){
        
  //       myVideo.current.srcObject = currentStream;
  //     }
       
  //   }).catch(error=>console.log(error))
 
   
  // }, [calling]);


  // const callUser = (ids) => {
	// 	const peer = new Peer({
	// 		initiator: true,
	// 		trickle: false,
	// 		stream: stream
	// 	})
	// 	peer.on("signal", (data) => {
	// 		socket.current.emit("callUser", {
	// 			userToCall: ids,
	// 			signalData: data,
	// 			from: id,
	// 			name: sender.Name
	// 		})
	// 	})
	// 	peer.on("stream", (streamm) => {
			
	// 			userVideo.current.srcObject = streamm
  //       userVideo.current.play()
			
	// 	})
	// 	socket.current.on("callAccepted", (signal) => {
	// 		setCallAccepted(true)
	// 		peer.signal(signal)
	// 	})

	// 	connectionRef.current = peer
	// } 

  // const answerCall =() =>  {
	// 	setCallAccepted(true)
  //   setcalling(true)
	// 	const peer = new Peer({
	// 		initiator: false,
	// 		trickle: false,
	// 		stream: stream
	// 	})
	// 	peer.on("signal", (data) => {
	// 		socket.current.emit("answerCall", { signal: data, to: caller })
	// 	})
	// 	peer.on("stream", (streamm) => {
	// 		userVideo.current.srcObject = streamm
  //     userVideo.current.play()
	// 	})

	// 	peer.signal(callerSignal)
  //   connectionRef.current = peer
		
	// }
 
  // const leaveCall = () => {
	// 	setCallEnded(true)
  //   socket.current.emit("callended", { from:id,to:me })
  //   setcalling(false)
  //   setCallAccepted(false) 
  //   setReceivingCall(false)
   
    
	// 	// connectionRef.current.destroy()
    
	// }


  // const handleOpen = () => {
  //   setmodalState({ open: true });
  // };
  // const handleClose = () => setmodalState({ open: false });

  //chatui function
  useEffect(() => {
    let user1 = localStorage.getItem("user");

    if (!user1) {
      navigate('/')
    }
  }, [localStorage.getItem("user")]);



  useEffect(() => {
    if(!calling){
    messageRef.current.scrollIntoView();
    }
  }, [messages]);

  useEffect(() => {
    socket.current.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
      //console.log('calluser',id)
    });
    socket.current.on("callended", (data) => {
      setCallEnded(true)
      setcalling(false)
      setCallAccepted(false) 
      setReceivingCall(false)
      window.document.reload()

  
   
    
    }); 
 
  }, [socket.current])

  useEffect(() => {
    socket.current.on("leave", (data) => {
      const senddata = async () => {
        try {
          const res = await axios.post("https://chatbackend-n9y2.onrender.com/user/lsupdate", {
            data,
          });
          if (res.status == 200) {
            console.log('leave');
          }
        } catch (err) {
          console.log(err);
        }
      };
      senddata();
    });
    return () => {
      socket.current.off("leave");
    };
  }, [socket.current]);

  useEffect(() => {
   // console.log(sender.Name, reciever.Name);

    socket.current.on("connect", () => {
      setid(socket.current.id);

      socket.current.emit("getname", { User: sender.Name });

      socket.current.emit("joined", { room: me, user: sender.Name });
    });
  }, [sender.Name, socket.current, reciever.Name]);

  useEffect(() => {
    socket.current.on("member", (data) => {
      setonlineusers(data.users2);
      (data.users2).forEach((el)=>{
        //console.log(el.user,reciever.Name)
        if(el.user==reciever.Name){
          setIdToCall(el.id)
        }
      })
    });

    return () => {
      socket.current.off("member");
      
    };
  }, [socket.current,reciever]);

  useEffect(() => {
    socket.current.on("notify", (data) => {
      setnotified((prev) => [...prev, data]);
    //  console.log(data);
    });

    return () => {
      socket.current.off("notify");
    };
  }, [socket.current]);

  useEffect(() => {
    socket.current.on("sendMessage", (data) => {
      setmessages([...messages, data]);
      setmsgsent(!msgsent);

      //console.log(messages);
    });
  }, [msgsent, messages, msg]);

  useEffect(() => {
const fetchchats=async()=>{

  try {
    const res=await axios.post("https://chatbackend-n9y2.onrender.com/chat/all", {room:me})
   //console.log(res.data)
    setmessages(res.data);
  
  } catch (error) {
    console.log(error)
  }
}
 fetchchats()   
   
  }, [reciever]);

  useEffect(() => {
    const fetchchats=async()=>{
    
      try {
        const res=await axios.post("https://chatbackend-n9y2.onrender.com/getgroup", {_id:sender._id})
      // console.log(res.data)
        setgroups(res.data);
      
      } catch (error) {
        console.log(error)
      }
    }
     fetchchats()   
       
      }, [sender,isPopoverOpen,leavegrp]);

  const checkonline = useCallback(
    (name) => {
      const online = onlineusers.find((e) => e.user == name);
      if (online) {
        return true;
      } else {
        return false;
      }
    },
    [onlineusers]
  );
  const checknewmsg = useCallback(
    (name) => {
      const notify = notified.find((e) => e.user == name);
      const isnotgrp=notified.some((e) => e.me == name);
      console.log(isnotgrp,notified,name)

      if ( !isnotgrp && notify && name != reciever.Name ) {
        return true;
      } else {
        return false;
      }
    },
    [notified, sender.Name]
  );
  const checknewmsggrp = useCallback(
    (name) => {
      const notify = notified.find((e) => e.me == name);

      if (notify && name != reciever.Name) {
        return true;
      } else {
        return false;
      }
    },
    [notified, sender.Name]
  );

  const formattime = useCallback((time) => {
    const start = moment(time, "D-MM-YYD hh:mm:ss");
    const mintdiff = moment(moment(time)).fromNow();
   
    return mintdiff;
  }, []);

  const clearnotified = (name) => {
    const item = notified.filter((e) => e.me !== name);
    setnotified(item);
    //console.log(item);
  };
  const clearnotified2 = (name) => {
    const item = notified.filter((e) => e.user !== name);
    setnotified(item);
    //console.log(item);
  }
  const leavegroup=async(elem)=>{
    let new_users=(elem.users).filter(e=>e!=sender.Name)
    let new_ids=(elem.ids).filter(e=>e!=sender._id)
    try {
      await axios.post('https://chatbackend-n9y2.onrender.com/groupupdate',{Name:elem.Name,users:new_users,ids:new_ids})
      .then(data=>setleavegrp(!leavegrp))
    } catch (error) {
      console.log(error)
    }
  }

  const send = (e) => {
    if (!msg.length > 0) {
      e.preventDefault();
    } else {
      let time = new Date().getTime();
      socket.current.emit("message", {
        msg,
        id,
        me,
        time,
        image:null,
        reciever: reciever.Name,
      });

      setmsg("");
      setemojipicked(false);
    }
  };

  const handlelogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    let arr = [];
    if (searchval !== null || "") {
      users
        ?.filter((e) => e.Name !== sender.Name)
        ?.forEach((elem) => {
          if (elem.Name?.toLowerCase().search(searchval?.toLowerCase()) > -1) {
            arr.push(elem);
          }
        });
      if (arr) {
        setfiltered(arr);
      }
    } else {
      setfiltered(users?.filter((e) => e.Name !== sender.Name));
    }
  }, [searchval, users]);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await axios.get("https://chatbackend-n9y2.onrender.com/user/all")
        if (res.status == 200) {
          setusers(res.data);
          setoptions(res.data)
        }
        if (res.status == 404) {
          console.log('5')
         
        }
      } catch (err) {
        console.log('4')
       
      }
    };
    fetchdata();
  }, []);
  const handleClosePopover = () => {
    setIsPopoverOpen(false);
  };
  const handleClosePopover2 = () => {
    setIsPopoverOpen2(false);
  };
  const handleClosePopover3 = () => {
    setIsPopoverOpen3(false);
  };
const deleteUser=async()=>{
 try {
 const res= await axios.post(`https://chatbackend-n9y2.onrender.com/deleteuser/${sender._id}`)
  if(res.status==201){
    alert('your account has been deleted succesfuly')
    navigate('/')
  }
 } catch (error) {
  console.log(error)
 }
}
const handleImageChange=async(e)=>{

 let img=e.target.files[0]
 try {
  setloading(true)
  if(img){
    const imageRef=ref(storage,`images/${img.name}`)
    await uploadBytes(imageRef,img).then((snapshot)=>{
      getDownloadURL(snapshot.ref).then(url=>{
      
      
    if(url){
          let time = new Date().getTime();
          socket.current.emit("message", {
            msg:url,
            id,
            me,
            image:url,
            time,
            reciever: reciever.Name,
          })}
  
          setloading(false)
          setmsg("");
          setemojipicked(false);
           
  
      })
      
    }) 

  
   }
 } catch (error) {
  
 }
 
}
  return (
    <div className="main">
      <div className="chatui" >
        <div className="fisrtdiv" style={{height:!maches?reciever.Name=='You'?'100%':'35%':"100%"}} >
          <div>
            <div>
              {/* <Avatar sx={{ bgcolor: deepOrange[500] }}>{sender?.Name[0]}</Avatar> */}
              {sender.image ? (
                <img className="avtar" src={sender.image} />
              ) : (
                <Avatar sx={{ bgcolor: deepOrange[500] }}>
                  {sender?.Name[0]}
                </Avatar>
              )}
            </div>
            <div>
              <b style={{ color: "blue" }}>{sender?.Name}</b>
              <p style={{cursor:"pointer",textTransform:"lowercase",color:"blue"}} onClick={()=>setIsPopoverOpen2(!isPopoverOpen2)}>{sender.Occupation}</p>
            </div>
            <div>
              
              {/* <Tooltip title="edit detail"><EditIcon /></Tooltip> */}
              {/* <Tooltip title="update status" placement="top" onClick={()=>setIsPopoverOpen2(!isPopoverOpen2)}>
              <EditIcon />
          </Tooltip> */}
          <Tooltip title="delete account" placement="top-end">
            
            <DeleteIcon onClick={()=>setIsPopoverOpen3(!isPopoverOpen3)}/>
          </Tooltip>
          {isPopoverOpen3 && (
        <DeletePopover
         deleteUser={deleteUser}
          sender={sender}
          onClose={handleClosePopover3}
          setsender={setsender}
        /> )}
             <Tooltip title="logout"><LogoutIcon onClick={handlelogout} style={{marginLeft:"20px"}}/></Tooltip> 
            </div>
            {isPopoverOpen2 && (
        <MultiSelectPopover2
         
          sender={sender}
          onClose={handleClosePopover2}
          setsender={setsender}
        /> )}
          </div>
       
          <TextField
            placeholder="search user"
            size="small"
            variant="standard"
            value={searchval}
            onChange={(e) => setsearchval(e.target.value)}
            color="primary"
            focused
          />


          <div>
            <p>groups <a style={{marginLeft:"40px"}}>
            <a style={{border:"none",color:"#0000FF",fontSize:"15px"}} onClick={() => setIsPopoverOpen(!isPopoverOpen)}>create group</a>
      {isPopoverOpen && (
        <MultiSelectPopover
          options={options}
          sender={sender}
          onClose={handleClosePopover}
          onSelect={handleSelect}
        /> )}
              </a>
              
              </p>
          {
            groups?.map(elem=>{
              return (
                <div className="user">
                <div >
                
                    <Avatar sx={{ bgcolor: deepOrange[500] }}>
                      {elem.Name[0]}
                    </Avatar>
                  
                </div>
                <div
                  className={elem._id == reciever._id ? "active" : "inactive"}
                >
                  <b 
                    onClick={() => {
                      setreciever(elem);
                      clearnotified(elem.Name);
                      setgroup(elem)
                    }}
                    style={{ cursor: "pointer" ,fontSize:"14px"}}
                  >
                    {elem.Name}
                  </b>

                </div>
                <div className="notification">
                  {checknewmsggrp(elem.Name) && (
                    <TextsmsIcon sx={{ color: "blue" }} />
                  )}

                 
                </div>
                <a style={{border:"none",color:"#0000FF",fontSize:"15px"}} onClick={()=>leavegroup(elem)}>leave</a>
              </div>
              )
            })
           }
           <p>users</p>
            {filtered?filtered.map((elem) => {
              return (
                <div className="user">
                  <div>
                    {elem.image ? (
                      <img className="avtar" src={elem.image} alt="no" />
                    ) : (
                      <Avatar sx={{ bgcolor: deepOrange[500] }}>
                        {elem?.Name[0]}
                      </Avatar>
                    )}
                  </div>
                  <div
                    className={elem._id == reciever._id ? "active" : "inactive"}
                  >
                    <b 
                      onClick={() => {
                        setreciever(elem);
                        clearnotified2(elem.Name);
                        setgroup(null)
                      }}
                      style={{ cursor: "pointer",fontFamily:"monospace",fontSize:"15px" }}
                    >
                      {(elem.Name)[0].toUpperCase()+(elem.Name).slice(1)}
                    </b>

                    {!checkonline(elem.Name) && (
                      <p style={{ fontSize: "12px" }}>
                        last seen {formattime(elem.Lastseen)}
                      </p>
                    )}
                  </div>
                  <div className="notification">
                    {!group && checknewmsg(elem.Name) && (
                      <TextsmsIcon sx={{ color: "blue" }} />
                    )}

                    {checkonline(elem.Name) && <p className="online"></p>}
                  </div>
                </div>
              );
            }):<Spinner animation="border" />}
          </div>
        </div>
        <div className="secondiv" style={{height:!maches?reciever.Name=='You'?'0px':'65%':"100%",display:!maches&&reciever.Name=='You'?'none':''}} >
        {reciever.Name!='You'&&
          <div>
            
            <div>
              <div>
                {/* <Avatar sx={{ bgcolor: deepOrange[500] }}>{reciever?.Name[0]}</Avatar> */}
                {reciever.image && (
                  <img className="avtar" src={reciever.image} alt="" />
                )}
              </div>
              <div className="notification">
                
                  <b style={{ color: "blue" }}>
                    {(reciever.Name)?.[0].toUpperCase()+(reciever.Name)?.slice(1)}
                      {reciever.Occupation && (   <small className="oc">{(reciever.Occupation).toLowerCase()}</small>) }
                  </b>
               
                {checkonline(reciever?.Name) && <p className="online"></p>}

                {reciever.Occupation && !checkonline(reciever.Name) && (
                  <p className="ls" style={{ fontSize: "14px" }}>
                    last seen {formattime(reciever.Lastseen)}
                  </p>
                )}
                
                {/* <VideoCallIcon
                  onClick={()=>{setcalling(true); callUser(idToCall)}}
                /> */}
                 {/* {receivingCall && !callAccepted ? (
                  <div className="caller">
                    <p>{name} is calling...</p>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={answerCall}
                    >
                      Answer
                    </Button>
                  </div>
                ) : null} */}
              </div>
              <div>
                
              </div>
            </div>
            <div>
              {/* <SearchOutlinedIcon/>
                <FavoriteBorderOutlinedIcon/>
                <NotificationsNoneIcon/> */}
            </div>
          </div>}
        
            <div className="messages" onClick={() => setemojipicked(false)}>
              {reciever.Name!='You'?messages?.map((elem) => {
                  return (
                    <div
                      className={elem.user == sender.Name ? "right" : "left"}
                    >
                      <div>
                       
                        {group && elem.user != sender.Name && <b style={{background:"black",color:"aqua",fontSize:"10px",padding:"2px"}}>{elem.user && elem.user}</b>}
                      </div>
                     {!elem.image && !(elem.message).includes('https://firebasestorage.googleapis.com') &&<p>
                        { elem.message}
                        <br />{" "}
                        <small style={{ textAlign: "end",fontSize:'10px' }}>
                          {moment(elem.time).format("MMMM-DD hh:mm a")}
                        </small>
                      </p>}
                      {elem.image&&
                      <div style={{display:'flex',flexDirection:'column'}}>
                      <img className="msgimg" src={elem.image} alt="image loading.."/>
                     
                      <small className={elem.user == sender.Name ? "rightimg" : "leftimg"} >
                        {moment(elem.time).format("MMMM-DD hh:mm a")}
                      </small></div>
                      
                    }
                      
                    </div>
                  );
                })
                :<img className="img2n"  src="image/back.jpg"/>
                }
              <div ref={messageRef} />
           
            </div>
        
          {reciever.Name!='You'&&
          <form style={{ height: "15%", width: "100%" }}>
            <div className="form1">
              <div>
                <CreateTwoToneIcon />
                <TextField
                  id="standard-basic"
                  value={msg}
                  onChange={(e) => setmsg(e.target.value)}
                  required={true}
                  placeholder="Write something"
                  variant="standard"
                />
                     {maches && (
                  <SentimentSatisfiedAltIcon
                    onClick={() => setemojipicked(!emojipicked)}
                  />
                )}
                 <input name="file" type="file" id='file' className="file" accept="image/*" onChange={handleImageChange} />
                 <label htmlFor="file">< CameraAltIcon /></label>
              </div>

              <div className="imgpick">
              <div className={emojipicked ? "block" : "none"} >
                  <EmojiPicker
                    height={300}
                    width={300}
                    onEmojiClick={(e) => setmsg(msg + e.emoji)}
                  />
                </div>
             
              </div>
              <div>
                {/* <AddAPhotoTwoToneIcon style={{background:"blue",color:"white"}}/> */}
           

         
                <button
                  type="submit"
                  style={{ background: "none",color:"blue", border:'none', height: "30px" }}
                  onClick={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                 
                  <SendIcon/>
                </button>
              </div>
            </div>
          </form>
      }       
        </div>
        {/* <div className="thirdiv">

        </div> */}
      </div>
    </div>
  );
};

export default ChatuiPage;
