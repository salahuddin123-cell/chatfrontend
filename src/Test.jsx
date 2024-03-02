import React,{useState} from 'react'

import { storage } from './firebase'
import {ref,uploadBytes} from 'firebase/storage'
import * as firebase from "firebase/app";
import { useEffect } from 'react'
const Test = () => {
  const [img,setimg]=useState(null)
  const [image,setimage]=useState(null)

  useEffect(()=>{
   const getImage=async()=>{   
    const starsRef=await storage.ref('images/' + 'blog.jpg');
   
    console.log(starsRef)
    }
    getImage()
  },[])

  const uploadImage=()=>{
     if (img==null) return;
     const imageRef=ref(storage,`images/${img.name}`)
     uploadBytes(imageRef,img).then(()=>{
        alert('iamge uploaded')
     }) 
  }
  return (
    <div>
        <input type="file"  onChange={(e)=>setimg(e.target.files[0])} name="img" accept='image/*' id="" /> <br />
        <button onClick={uploadImage}>upload</button><br />
        <img width={200} height={200} src='https://firebasestorage.googleapis.com/v0/b/cloud-storage-b3641.appspot.com/o/images%2Fblog.jpg?alt=media&token=f3fc4213-e4ce-4cf0-a43d-2a203bc7eb8b' alt="dd" />
    </div>
  )
}

export default Test