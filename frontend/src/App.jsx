import React, { useState, useEffect } from "react";
import Base from "./components/Base.jsx";
import Login from "./components/Login.jsx";
import { auth, db } from "./components/firebase.jsx";
import {getDoc, doc} from 'firebase/firestore';
import Locator from "./components/Locator.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Analytics from "./components/Analytics.jsx";
import Admin from "./components/Admin.jsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  const [userDetails, setUserDetails] =useState(null)
  const fetchUserData = async() =>{
    auth.onAuthStateChanged(async(user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          console.log("No such user!");
        }
      }
    });
  }  
  
  useEffect(()=>{
    fetchUserData()
  },[])
  const username = userDetails ? userDetails.username : "";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
      setIsAuthLoaded(true);
    });
    return () => unsubscribe();
  }, []);
  if (!isAuthLoaded) {
    return null;
  }
  
  return (
    <Router>
      <Base>
        <Routes>
          <Route exact path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route exact path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route exact path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
          <Route exact path="/locator" element={isAuthenticated ? <Locator /> : <Navigate to="/login" />} />
          <Route exact path="/admin" element={isAuthenticated ? (userDetails ? (username === "admin") ? <Admin /> : <Navigate to="/login" /> : <></>) : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Base>
    </Router>
  );
}

export default App;