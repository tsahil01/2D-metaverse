import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { BACKEND_URL } from "@/lib/config";

export function CreateAvatar() {
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    async function handleSubmit() {
        if (!name || !imageUrl) {
            alert("Please fill in all the fields");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/admin/avatar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name,
                    imageUrl,
                }),
            });
            const data = await response.json();
            console.log(data);
            alert("Element created successfully");

        } catch (error) {
            console.error("Failed to create element:", error);
            alert("Failed to create element");
        }
    }


    return (
        <Card>
            <CardHeader className="border-b bg-primary/5">
                <CardTitle>Create a new Avatar</CardTitle>
                <CardDescription>
                    Fill in the form below to create a new avatar
                </CardDescription>
            </CardHeader>
            <CardContent className="my-4">
                <div className="grid grid-cols-3 w-full items-center gap-4">
                    {/* Element Name */}
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Element Name</Label>
                        <Input
                            id="name"
                            placeholder="New Element"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Image URL */}
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                            id="imageUrl"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleSubmit}>Create Avatar</Button>
            </CardFooter>
        </Card>
    );
}
