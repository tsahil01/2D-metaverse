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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function AuthPage({ signup }: { signup?: boolean }) {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [userType, setUserType] = React.useState<'admin' | 'user'>("user");
    const [loading, setLoading] = React.useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (signup) {
            console.log("Signup", { username, password, userType })
        } else {
            console.log("Login", { username, password })
        }
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex items-center justify-center">

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
                                {signup && (
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="usertype">User Type</Label>
                                        <Select required={true}>
                                            <SelectTrigger>
                                                <SelectValue>{'user'}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="User" onClick={() => setUserType("user")}>User</SelectItem>
                                                <SelectItem value="Admin" onClick={() => setUserType("admin")}>Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
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
