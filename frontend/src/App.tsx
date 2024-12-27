import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { User } from 'firebase/auth'
import { DocumentData } from 'firebase/firestore'
import { auth, db } from "@/pages/firebase.tsx"
import { getDoc, doc } from 'firebase/firestore'
import Base from "@/pages/Base.tsx"
import Login from "@/pages/Login.tsx"
import Locator from "@/pages/Locator.tsx"
import Dashboard from "@/pages/Dashboard.tsx"
import Analytics from "@/pages/Analytics.tsx"
import Admin from "@/pages/Admin.tsx"

interface UserDetails extends DocumentData {
  username: string
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthLoaded, setIsAuthLoaded] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)

  const fetchUserData = async (user: User) => {
    const docRef = doc(db, "Users", user.uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      setUserDetails(docSnap.data() as UserDetails)
    } else {
      console.log("No such user!")
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user)
      setIsAuthLoaded(true)
      if (user) {
        fetchUserData(user)
      }
    })
    return () => unsubscribe()
  }, [])

  if (!isAuthLoaded) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>
  }

  return (
    <Router>
      <Base>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
          <Route path="/locator" element={isAuthenticated ? <Locator /> : <Navigate to="/login" />} />
          <Route path="/admin" element={
            isAuthenticated ? (
              userDetails ? (
                userDetails.username === "admin" ? <Admin /> : <Navigate to="/" />
              ) : <div className="flex items-center justify-center h-screen">Loading user details...</div>
            ) : <Navigate to="/login" />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Base>
    </Router>
  )
}

export default App