import { useState } from "react";
import { Navbar } from "../nav/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

import { Input } from "../ui/input";
import { SpaceEditor } from "./SpaceEditor";
import { Label } from "../ui/label";

export function NewEmptySpace() {
    const [name, setName] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [dimension, setDimension] = useState("");


    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
            <header className="relative overflow-hidden">
                <Navbar />
                <div className="container mx-auto px-4 flex flex-row gap-2 lg:px-8">
                    <Card className="mt-9 w-full">
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
                    </div>
                            {
                                !name || !thumbnail || !dimension ? (
                                    <p className="text-red-500 text-sm mt-4">Please fill in all the fields</p>
                                ) : null
                            }

                            {
                                name && thumbnail && dimension ? <SpaceEditor name={name} thumbnail={thumbnail} dimension={dimension} />
                                    : null
                            }

                        </CardContent>
                    </Card>
                </div>
            </header>
        </div>
    )
}