import React, { useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const LoginLayout = ({children}) => {
    const [login,setlogin]=useState(true)
    const navigate=useNavigate()
  return (
    <div className="register">
     <div>
     <Stack spacing={2} direction="row">
     
      <Button variant="contained" color={'primary'} onClick={()=>{setlogin(true);navigate("/")}}>Login</Button>
      <Button variant="contained" color={'secondary'} onClick={()=>{setlogin(false);navigate("/register")}}>Register</Button>
    </Stack>
     </div>
     <div className="form">
        {children}
     </div>
    </div>
  )
}

export default LoginLayout