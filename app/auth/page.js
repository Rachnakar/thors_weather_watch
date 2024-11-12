"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { auth, googleProvider } from "../config/firebase"

import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"



const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const signupSchema = loginSchema.extend({
  username: z.string()
    .min(2, { message: "Username must be at least 2 characters" })
    .regex(/^[a-z0-9_]+$/, { message: "Username can only contain lowercase letters, numbers, and underscores" }),
})

export default function AuthPage() {
  const [tab, setTab] = useState("login")

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
  })

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
  })

  const handleLoginSubmit = (data) => {
    console.log("Login Data:", data)
  }

  const handleSignupSubmit = async (data) => {
    console.log("Signup Data:", data)

    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password)
    } catch (error) {
      console.error("Error signing up:", error)
    }}
  
    const handleSigninWithGoogle = async () => {
      try {
        await signInWithPopup(auth, googleProvider)
      } catch (error) {
        console.error("Error signing in with Google:", error)
      }
    }

  return (
    <Card className="shadow-red-300 w-96 m-auto mt-4">
      <CardHeader className="text-center">
        <CardTitle>Authentication</CardTitle>
        <CardDescription>Login or Register to continue</CardDescription>
      </CardHeader>
      <CardContent className="">
        <Tabs defaultValue="login" value={tab} onValueChange={setTab} className="">
          <TabsList className="flex">
            <TabsTrigger className="w-full" value="login">Login</TabsTrigger>
            <TabsTrigger className="w-full" value="signup">Signup</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-8">
                <FormField
                  className="w-auto"
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Login</Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="signup">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-8">
                <FormField
                  control={signupForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Signup</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
    <Button onClick={handleSigninWithGoogle} className="my-8 w-full">Sign in with Google</Button>
      </CardContent>
      <CardFooter>
        <p>All rights reserved.</p>
      </CardFooter>
    </Card>
  )
}
