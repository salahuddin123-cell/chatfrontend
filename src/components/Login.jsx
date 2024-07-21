import React ,{useContext}from "react";
import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import LoginLayout from "./LoginLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate=useNavigate()
 
  const onSubmit =async (data) => {
    try{
      const res=  await axios.post('https://chatbackend-n9y2.onrender.com/login',data)
      if(res.status==200){
        console.log(res.data.user)
        localStorage.setItem("user",JSON.stringify(res.data.token))
        navigate('/chat')
      }
      else{
       
        Promise.reject()
      }
    
    }catch(err){
      if(err.response?.status==400){
        toast("Invalid credential")
      }
      if(err.response?.status==403){
        toast("Pssword does not match")
      }else{
        console.log(err)
      }
    }
   }
   const dummylogin=async()=>{
    try{
      const res=  await axios.post('https://chatbackend-n9y2.onrender.com/login',{Email:'hr@gmail.com',Password:'123456'})
      if(res.status==200){
        console.log(res.data.user)
        localStorage.setItem("user",JSON.stringify(res.data.token))
        navigate('/chat')
      }
      else{
       
        Promise.reject()
      }
    
    }catch(err){
      if(err.response.status==400){
        toast("Invalid credential")
      }
      if(err.response.status==403){
        toast("Pssword does not match")
      }else{
        console.log(err.response)
      }
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
                "@media (max-width: 1020px)": {
                  width: "35ch",
                },
                "@media (max-width: 520px)": {
                  width: "28ch",
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
              type="email"
            />
            <TextField
              id="filled-basic"
              {...register("Password")}
              label="Password"
              type="password"
              variant="outlined"
              size="small"
            />
       

    
          </Box>
          <div className="loginsubmit">
          <input className="submit" value="Submit" type="submit" />
        <ToastContainer />
          </div>
          
        </form>
      <p>For dummy login <button onClick={dummylogin}>click here</button></p>

    </LoginLayout>
    </>

  )
}

export default Login