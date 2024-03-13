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

import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import moment from "moment";
import EmojiPicker from "emoji-picker-react";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import Avatar from "@mui/material/Avatar";
import { deepOrange, deepPurple } from "@mui/material/colors";
import io from "socket.io-client";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CallModal from "./modal/CallModal";
import Peer from "simple-peer"
//calling function

const ChatuiPage = () => {
  const [users, setusers] = useState(null);
  const [modalState, setmodalState] = useState({ open: false });

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
  const [msgsent, setmsgsent] = useState(false);
  const [messages, setmessages] = useState([]);
  const [onlineusers, setonlineusers] = useState([]);
  const [notified, setnotified] = useState([]);
  const [emojipicked, setemojipicked] = useState(false);
  const [filtered, setfiltered] = useState([]);
  const [searchval, setsearchval] = useState("");
  const navigate = useNavigate();
  let me = (sender.Name + reciever.Name).split("").sort().join(",");
  //calling state
  const [calling, setcalling] = useState(false);
  const [stream, setStream] = useState('');
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const myVideo = useRef({ srcObject: null });
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    socket.current = io.connect("https://chatappbackend-3ieq.onrender.com");
    return () => {
      socket.current.disconnect();
    };
  }, [reciever.Name]);

  //calling function
  useEffect(() => {
   
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
    .then((currentStream) => {
      setStream(currentStream);
      console.log(currentStream)
      if(calling){
        myVideo.current.srcObject = currentStream;
      }
       
    }).catch(error=>console.log(error))
 
   
  }, [calling]);


  const callUser = (ids) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.current.emit("callUser", {
				userToCall: ids,
				signalData: data,
				from: id,
				name: sender.Name
			})
		})
		peer.on("stream", (streamm) => {
			
				userVideo.current.srcObject = streamm
        userVideo.current.play()
			
		})
		socket.current.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	} 

  const answerCall =() =>  {
		setCallAccepted(true)
    setcalling(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.current.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (streamm) => {
			userVideo.current.srcObject = streamm
      userVideo.current.play()
		})

		peer.signal(callerSignal)
    connectionRef.current = peer
		
	}
 
  const leaveCall = () => {
		setCallEnded(true)
    socket.current.emit("callended", { from:id,to:idToCall })
    setcalling(false)
		connectionRef.current.destroy()
	}


  // const handleOpen = () => {
  //   setmodalState({ open: true });
  // };
  // const handleClose = () => setmodalState({ open: false });

  //chatui function
  useEffect(() => {
    let user1 = localStorage.getItem("user");

    if (!user1) {
      navigate('/login')
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
      console.log('calluser',id)
    });
    socket.current.on("callended", (data) => {
      setcalling(false)
		connectionRef.current.destroy()
    }); 
 
  }, [socket.current])

  useEffect(() => {
    socket.current.on("leave", (data) => {
      const senddata = async () => {
        try {
          const res = await axios.post("https://chatappbackend-3ieq.onrender.com/user/lsupdate", {
            data,
          });
          if (res.status == 200) {
            console.log(data);
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
    console.log(sender.Name, reciever.Name);

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
        console.log(el.user,reciever.Name)
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
      console.log(data);
    });

    return () => {
      socket.current.off("notify");
    };
  }, [socket.current]);

  useEffect(() => {
    socket.current.on("sendMessage", (data) => {
      setmessages([...messages, data]);
      setmsgsent(!msgsent);

      console.log(messages);
    });
  }, [msgsent, messages, msg]);

  useEffect(() => {
    fetch("https://chatappbackend-3ieq.onrender.com/chat/all", {
      method: "get",
    })
      .then((data) => data.json())
      .then((res) => {
        let filtered = res.filter((e) => e.room == me);

        setmessages(res);
      });
  }, [reciever.Name]);

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
    const item = notified.filter((e) => e.user !== name);
    setnotified(item);
    console.log(item);
  };

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
        reciever: reciever.Name,
      });

      setmsg("");
      setemojipicked(false);
    }
  };

  const handlelogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
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
        const res = await axios.get("https://chatappbackend-3ieq.onrender.com/user/all");
        if (res.status == 200) {
          setusers(res.data);
        }
      } catch (err) {
        localStorage.removeItem("user");
        navigate("/login");
      }
    };
    fetchdata();
  }, []);

  return (
    <div className="main">
      <div className="chatui">
        <div className="fisrtdiv">
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
              <p>{sender.Occupation}</p>
            </div>
            <div>
              <LogoutIcon onClick={handlelogout} />
            </div>
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
            {filtered?.map((elem) => {
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
                        clearnotified(elem.Name);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {elem.Name}
                    </b>

                    {!checkonline(elem.Name) && (
                      <p style={{ fontSize: "12px" }}>
                        last seen {formattime(elem.Lastseen)}
                      </p>
                    )}
                  </div>
                  <div className="notification">
                    {checknewmsg(elem.Name) && (
                      <TextsmsIcon sx={{ color: "blue" }} />
                    )}

                    {checkonline(elem.Name) && <p className="online"></p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="secondiv">
          <div>
            <div>
              <div>
                {/* <Avatar sx={{ bgcolor: deepOrange[500] }}>{reciever?.Name[0]}</Avatar> */}
                {reciever.image && (
                  <img className="avtar" src={reciever.image} alt="" />
                )}
              </div>
              <div className="notification">
                {reciever.Occupation && (
                  <b style={{ color: "blue" }}>
                    {reciever?.Name}(
                    <small className="oc">{reciever.Occupation}</small>)
                  </b>
                )}
                {checkonline(reciever?.Name) && <p className="online"></p>}

                {reciever.Occupation && !checkonline(reciever.Name) && (
                  <p className="ls" style={{ fontSize: "14px" }}>
                    last seen {formattime(reciever.Lastseen)}
                  </p>
                )}
                
                <VideoCallIcon
                  onClick={()=>{setcalling(true); callUser(idToCall)}}
                />
                 {receivingCall && !callAccepted ? (
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
                ) : null}
              </div>
              <div>
                
              </div>
            </div>
            <div>
              {/* <SearchOutlinedIcon/>
                <FavoriteBorderOutlinedIcon/>
                <NotificationsNoneIcon/> */}
            </div>
          </div>
          {calling ? (
            <div className="container">
              <div className="video-container">
              {myVideo  ?  <div className="video" >
                   <p>My video</p>
                    <video
                      playsInline
                      muted
                      ref={myVideo}
                      autoPlay
                      style={{ width: "300px" }}
                    />
                  
                </div>:'no video'}
                {callAccepted && userVideo && !callEnded &&
                <div className="video">
                   <p>his video</p>
                    <video
                      playsInline
                      ref={userVideo}
                      autoPlay
                      muted
                      style={{ width: "300px" }}
                    />
                  
                </div>}
              </div>
              <div className="call-button">
					{callAccepted && !callEnded && 
						<Button variant="contained" color="secondary" onClick={leaveCall}>
							End Call
						</Button>
			}
				
				</div>
           
            </div>
          ) : (
            <div className="messages">
              {messages
                .filter((e) => e.me == me)
                .map((elem) => {
                  return (
                    <div
                      className={elem.user == sender.Name ? "right" : "left"}
                    >
                      <div>
                        <Avatar sx={{ bgcolor: deepOrange[500] }}>
                          {elem.user && elem.user[0]}
                        </Avatar>
                      </div>
                      <p>
                        {elem.message}
                        <br />{" "}
                        <small style={{ textAlign: "end" }}>
                          {moment(elem.time).format("MMMM-DD hh:mm a")}
                        </small>
                      </p>
                    </div>
                  );
                })}
              <div ref={messageRef} />
            </div>
          )}

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
              </div>
              <div>
                {/* <AddAPhotoTwoToneIcon style={{background:"blue",color:"white"}}/> */}
                {maches && (
                  <SentimentSatisfiedAltIcon
                    onClick={() => setemojipicked(!emojipicked)}
                  />
                )}

                <div className={emojipicked ? "block" : "none"}>
                  <EmojiPicker
                    height={400}
                    width={400}
                    onEmojiClick={(e) => setmsg(msg + e.emoji)}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: "blue", color: "white", height: "30px" }}
                  onClick={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                 
                  <SendIcon />
                </button>
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
