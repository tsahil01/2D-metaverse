import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "../ui/button";
import { MapEditor } from "./mapEditor";

export function CreateMap() {
    const [name, setName] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [dimension, setDimension] = useState("");

    return (
        <>
            <Card>
                <CardHeader className="border-b bg-primary/5">
                    <CardTitle>Create a new map</CardTitle>
                    <CardDescription>Fill in the form below to create a new map</CardDescription>
                </CardHeader>
                <CardContent className="my-4">
                    <div className="grid grid-cols-3 w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Map Name</Label>
                            <Input id="name" placeholder="New Map" onChange={
                                (e) => setName(e.target.value)
                            } />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="thumbnail">Thumbnail</Label>
                            <Input id="thumbnail" placeholder="https://example.com/image.jpg" onChange={
                                (e) => setThumbnail(e.target.value)
                            } />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="dimension">Dimension</Label>
                            <Input id="dimension" placeholder="100x100" onChange={
                                (e) => setDimension(e.target.value)
                            } />
                        </div>

                        <div className="flex">
                            <Button variant={"outline"} disabled={
                                !name || !thumbnail || !dimension

                            }>Open Map Editor</Button>
                        </div>
                    </div>
                    {
                        !name || !thumbnail || !dimension ? (
                            <p className="text-red-500 text-sm mt-4">Please fill in all the fields</p>
                        ) : null
                    }

                    {
                         <MapEditor name={name} thumbnail={thumbnail} dimension={dimension} />
                            
                    }

                </CardContent>
            </Card>
        </>
    )
}