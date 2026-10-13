import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import './App.css'
import Registration from './auth/Signup'
import Signin from './auth/Signin';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import Account from './pages/Profile';
import ToastContainer from './components/Toast';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ToastContainer />
      <Header/>
      <Routes>
        <Route path='/sign-up/' element={<Registration/>}/>
        <Route path="/sign-in" element={<Signin/>}/>
        <Route path='/' element={<Home/>}/>
        <Route path='/profile' element={<Account/>}/>
      </Routes>
      <Footer/>
    </>
  )
}

export default App
