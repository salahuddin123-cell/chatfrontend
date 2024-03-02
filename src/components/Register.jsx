import React ,{useContext, useState}from "react";
import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Link } from 'react-router-dom'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoginLayout from "./LoginLayout";
import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const { register, handleSubmit,reset } = useForm();
  const [image,setimage]=useState('')
  const navigate=useNavigate()
 
  const convertTobase64=(e)=>{
    
    var reader=new FileReader();
    reader.readAsDataURL(e.target.files[0])
    reader.onload=()=>{
      setimage(reader.result)
    }
    reader.onerror=(error)=>{
      console.log(error)
    }
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
   console.log(res.status)
    }catch(err){
      console.log(err.response?.data?.error?.code)
     
      if(err?.response?.status==403){
        if(err.response?.data?.error?.code==11000){
          toast("User email already exist")
        }else{
        toast("User email is required")
        }
      }
    
      else{
        toast("Image size is too large ")
        navigate('/login')
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
              
              <input type="file"  accept="image/*" onChange={convertTobase64} name="file" id="" />
              {image&&<img src={image} alt="" />}
    
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