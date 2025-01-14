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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { BACKEND_URL } from "@/lib/config";

export function CreateElement() {
    const [name, setName] = useState("");
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [staticElement, setStaticElement] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    async function handleSubmit() {
        if (!name || !width || !height || !imageUrl) {
            alert("Please fill in all the fields");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/admin/element`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name,
                    width: parseInt(width),
                    height: parseInt(height),
                    static: staticElement,
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
                <CardTitle>Create a new element</CardTitle>
                <CardDescription>
                    Fill in the form below to create a new element
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

                    {/* Width */}
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="width">Width</Label>
                        <Input
                            id="width"
                            placeholder="100"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                        />
                    </div>

                    {/* Height */}
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="height">Height</Label>
                        <Input
                            id="height"
                            placeholder="100"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                        />
                    </div>

                    {/* Static Element */}
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="static">Static</Label>
                        <Select onValueChange={(value) => setStaticElement(value === "true")}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Element is Static or not" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Static</SelectLabel>
                                    <SelectItem value="true">Yes</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
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
                    onClick={handleSubmit}>Create Element</Button>
            </CardFooter>
        </Card>
    );
}
