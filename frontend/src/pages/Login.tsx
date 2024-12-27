import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { auth } from './firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!username || !password) {
        throw new Error("All fields are required.")
      }

      const email = `${username}@greenpmu.com`
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()

      // Make API call to your backend
      const response = await axios.get(`/auth/loginUser`, {
        headers: {
          'Authorization': idToken
        }
      })

      const userData = response.data
      toast.success(`Welcome back, ${userData.name || username}!`, { position: "top-center" })
      navigate('/')
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("auth/invalid-credential")) {
          setError("Incorrect username or password.")
        } else if (error.message === "All fields are required.") {
          setError(error.message)
        } else if (axios.isAxiosError(error) && error.response?.status === 404) {
          setError("User not found. Please check your credentials.")
        } else {
          setError("An unexpected error occurred. Please try again.")
          console.error(error)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] items-center justify-center">
      <Card className="dark w-full max-w-md outline outline-1 outline-[#807668]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : "Let's Go!"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}