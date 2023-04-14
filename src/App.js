import {BrowserRouter as Router,Route,Routes, Link } from 'react-router-dom'
import Register from './components/Register';
import Login from './components/Login';
// import Chat from './components/Chat';
// import Login from './components/Login';
// import FrontPage from './FrontPage'
import ChatuiPage from './components/ChatuiPage';

import './App.css';

function App() {
  
  
  return (
    <div className='App'style={{msOverflowX:"hidden"}}>
   <Router>
     <Routes>
     <Route path='/' element={<Register />}/>
     <Route path='/login' element={<Login />}/>
       <Route path='/chat' element={<ChatuiPage />}/>
      
     </Routes>
   </Router>
</div>
  );
}

export default App;
