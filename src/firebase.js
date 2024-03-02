
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getStorage} from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCTBrDV3XOt_5VgpsB12MiR-K4Dhe7Ks50",
  authDomain: "cloud-storage-b3641.firebaseapp.com",
  projectId: "cloud-storage-b3641",
  storageBucket: "cloud-storage-b3641.appspot.com",
  messagingSenderId: "858195956377",
  appId: "1:858195956377:web:95dfaeed425a3d70501e08",
  measurementId: "G-59JC4RPEN7"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage=getStorage(app)