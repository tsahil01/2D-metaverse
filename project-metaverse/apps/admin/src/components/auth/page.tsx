import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BACKEND_URL } from "@/lib/config"
import { LockKeyhole } from "lucide-react"

export function AuthPage({ signup }: { signup?: boolean }) {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (signup) {
            if (username && password) {
                const signupData = await fetch(`${BACKEND_URL}/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, password, type: 'admin' })
                });

                if (signupData.status == 200) {
                    alert("Signup Successful")
                }
            }
        } else {
            if (username && password) {
                const loginData = await await fetch(`${BACKEND_URL}/signin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                });

                const data = await loginData.json();
                console.log(data)
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    window.location.href = "/";
                }


            }
        }
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col  space-y-4 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <LockKeyhole className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Admin Portal
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {signup ? "Create your admin account" : "Sign in to your account"}
                    </p>
                </div>

                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            {
                                signup ? "Signup" : "Login"
                            }
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Username</Label>
                                    <Input id="name" required={true} placeholder="Enter your username" onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" required={true} type="password" placeholder="Enter your Password" onChange={(e) => setPassword(e.target.value)} />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start space-y-2">
                        <Button
                            onClick={(e) => {
                                setLoading(true)
                                handleSubmit(e)
                                setLoading(false)
                            }}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : signup ? "Signup" : "Login"}
                        </Button>
                        <p>
                            {signup ? "Already have an account?" : "Don't have an account?"}{" "}
                            <a href={
                                signup ? "/login" : "/signup"
                            } className="text-blue-500">
                                {signup ? "Login" : "Signup"}
                            </a>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
