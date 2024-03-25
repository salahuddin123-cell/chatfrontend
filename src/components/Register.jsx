import React ,{useContext, useState}from "react";
import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import FormControl from "@mui/material/FormControl";

import Spinner from 'react-bootstrap/Spinner';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoginLayout from "./LoginLayout";
import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import { storage } from '../firebase'
import {ref,uploadBytes,getDownloadURL} from 'firebase/storage'

const Register = () => {
  const { register, handleSubmit,reset } = useForm();
  const [image,setimage]=useState('')
  const navigate=useNavigate()
 
  const handleImageChange=(e)=>{
    
    const img=e.target.files[0]
    if (img==null) return;
    const imageRef=ref(storage,`images/${img.name}`)
    uploadBytes(imageRef,img).then((snapshot)=>{
      getDownloadURL(snapshot.ref).then(url=>{
        console.log(url)
        setimage(url)
      })
      
    }) 
  }


  const onSubmit =async (data) => {
    try{
    const newdata={...data,image,Lastseen:new Date().getTime()}
   const res=  await axios.post('https://chatappbackend-3ieq.onrender.com/register/new',newdata)
   
   if(res.status==201){
    localStorage.setItem("user",JSON.stringify(res.data.token))
    navigate('/chat')
   }
   else Promise.reject()
  
    }catch(err){
      // console.log(err.response?.data?.error?.code)
     
      if(err?.response?.status==403){
        if(err.response?.data?.error?.code==11000){
          toast("User email already exist")
        }else{
        toast("User email is required")
        }
      }
     if(err?.response?.status==413){
      toast("Image size is too large ")
      reset();
     }
      else{
        toast("There is an error ")
       
        reset();
      }
    }
   
    
 
  }
  return (
    <>
    <LoginLayout>
     
        
        <form onSubmit={handleSubmit(onSubmit)}>
            <h3>Register here </h3>
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
              {...register("Name")}
              label="Name"
              variant="outlined"
              size="small"
            />
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
              type="password"
              variant="outlined"
              size="small"
            />
       
                  <FormControl   >
               <div className="select-wrapper">
               <select 
              placeholder="Sex"
              
                  {...register("Occupation", { required: "This field is required" })} >
                    <option selected value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Sleeping">Sleeping</option>
                    <option value="In the Gym">In the Gym</option>
                  </select>
                  <label>Status</label>
               </div>
             
             
           
              </FormControl>
              
              <input type="file"  accept="image/*" onChange={handleImageChange} name="file" id="" />
              
              {image?<img className="regimg" src={image} alt="" />: <Spinner animation="border" />}
    
          </Box>
          <div className="loginsubmit">
          <input className="submit" value="Submit" type="submit" />
        
          </div>
          <ToastContainer />
        </form>
        </LoginLayout>
   
  
    </>

  )
}

export default Register