import React ,{useContext}from "react";
import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import LoginLayout from "./LoginLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate=useNavigate()
 
  const onSubmit =async (data) => {
    try{
      const res=  await axios.post('https://chatappbackend-3ieq.onrender.com/login',data)
      if(res.status==200){
        console.log(res.data.user)
        localStorage.setItem("user",JSON.stringify(res.data.token))
        navigate('/chat')
      }
      else Promise.reject()
    
    }catch(err){
      console.log(err)
    }
   
    
 
  }
  return (
    <>
    <LoginLayout>
    
    
        
        <form onSubmit={handleSubmit(onSubmit)}>
            <h3>Login here </h3>
          <Box
            component="form"
            sx={{
              "& > :not(style)": {
                m: 1,
                width: "50ch",
                "@media (max-width: 820px)": {
                  width: "35ch",
                },
              },
            }}
            noValidate
            autoComplete="off"
          >
       
            <TextField
              id="outlined-basic"
              {...register("Email")}
              label="Email"
              variant="outlined"
              size="small"
            />
            <TextField
              id="filled-basic"
              {...register("Password")}
              label="Password"
              variant="outlined"
              size="small"
            />
       

    
          </Box>
          <div className="loginsubmit">
          <input className="submit" value="Submit" type="submit" />
       
          </div>
          
        </form>
      

    </LoginLayout>
    </>

  )
}

export default Login