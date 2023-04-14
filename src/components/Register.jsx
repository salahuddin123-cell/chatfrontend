import React ,{useContext}from "react";
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


const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate=useNavigate()
 
  const onSubmit =async (data) => {
    try{
   const res=  await axios.post('https://chatappbackend-3ieq.onrender.com/register/new',data)
   if(res.status==200){
    navigate('/login')
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
                    <option selected value="Student">Student</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Developer">Developer</option>
                    <option value="Business man">Business man</option>
                  </select>
                  <label>Occupation</label>
               </div>
             
           
           
              </FormControl>

    
          </Box>
          <div className="loginsubmit">
          <input className="submit" value="Submit" type="submit" />
        
          </div>
          
        </form>
        </LoginLayout>
   
  
    </>

  )
}

export default Register