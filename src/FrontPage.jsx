import React, { useState } from 'react'
import { useNavigate} from 'react-router-dom'

let user;
let room;


const FrontPage = ({socket}) => {
    const [input,setInput]=useState({});
    const navigate=useNavigate()
    const changleHnadler=(e)=>{
        const name=e.target.name;
        const value=e.target.value;
        setInput(values =>({
            ...values, [name]:value
        }))
    }
    const sendUser=(e)=>{
        if(!input.name || !input.room){
            e.preventDefault()
        }
        if(input.name.length<6 || input.room.length<2){
            
            e.preventDefault()
            alert('name is too short, it must contain 6 character')
        }
        else{
            user=input.name;
            room=input.room;
            if (room !== "") {
                socket.emit("join_room",{room,user} );
             }
             localStorage.setItem('curUser',JSON.stringify({user,room}))
            navigate('/chat')
        }
     
     
      
    }
    return (
      <div className='front'>
      <img style={{height:120}} src="img/sssk.png" alt="no found" />
      <h2>Enter the chat</h2>
      <input className='input1' onChange={changleHnadler} value={input.name||''} name="name" type="text" placeholder='Enter username..' />
      <input className='input1' onChange={changleHnadler}  value={input.room||''} name="room" placeholder='Enter Room..' />
      <a  onClick={sendUser} className='entry' >Enter chatroom </a>
  </div>
  )
}

export default FrontPage


export {user}
export {room}