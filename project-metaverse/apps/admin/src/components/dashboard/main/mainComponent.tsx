import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BACKEND_URL } from "@/lib/config";
import { MapInterface, ElementInterface, AvatarInterface } from "@/lib/types";
import { useEffect, useState } from "react";
import { AvatarCard, ElementCard, MapCard } from "./getDataInCard";
import { useNavigate } from "react-router-dom";

export function MainComponent() {
    const [maps, setMaps] = useState<MapInterface[]>([]);
    const [elements, setElements] = useState<ElementInterface[]>([]);
    const [avatars, setAvatars] = useState<AvatarInterface[]>([]);
    const navigate = useNavigate();

    async function getMaps() {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You need to login first");
            return;
        }
        const res = await fetch(`${BACKEND_URL}/admin/map`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        console.log("maps", data);
        setMaps(data);
    }

    async function getElements() {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You need to login first");
            return;
        }
        const res = await fetch(`${BACKEND_URL}/elements`);

        const data = await res.json();
        console.log("elements", data);
        setElements(data.elements);
    }

    async function getAvatars() {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You need to login first");
            return;
        }
        const res = await fetch(`${BACKEND_URL}/avatars`);

        const data = await res.json();
        console.log("avatars", data);
        setAvatars(data.avatars);
    }

    useEffect(() => {
        getMaps();
        getElements();
        getAvatars();
    }, []);

    return (
        <>
            <Card>
                <CardHeader className="border-b bg-primary/5">
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>This is the admin dashboard for the Metaverse project. You can manage users, view statistics, and more.</CardDescription>
                </CardHeader>

                <CardContent className="mt-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-row justify-start items-center space-x-4">
                            <Button variant={"outline"}
                                onClick={() => {
                                    navigate("/create-map");
                                }}
                            >Create new Map</Button>
                            <Button variant={"outline"}
                                onClick={() => {
                                    navigate("/create-element");
                                }}
                            >Add new Element</Button>
                            <Button variant={"outline"}
                                onClick={() => {
                                    navigate("/create-avatar");
                                }}
                            >Add new Avatar</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <Card className="col-span-1 lg:col-span-2">
                                <CardHeader className="bg-primary/5">
                                    <CardTitle>Maps</CardTitle>
                                    <CardDescription>
                                        Maps are the virtual worlds that users can explore and interact with.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {maps.map((map) => (
                                        <MapCard key={map.id} {...map} />
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className="col-span-1">
                                <CardHeader className="bg-primary/5">
                                    <CardTitle>Elements</CardTitle>
                                    <CardDescription>
                                        Elements are the building blocks of maps.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 gap-4 mt-4">
                                    {elements.map((element) => (
                                        <ElementCard key={element.id} {...element} />
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className="col-span-1">
                                <CardHeader className="bg-primary/5">
                                    <CardTitle>Avatars</CardTitle>
                                    <CardDescription>
                                        Avatars are the virtual representations of users.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 gap-4 mt-4">
                                    {avatars.map((avatar) => (
                                        <AvatarCard key={avatar.id} {...avatar} />
                                    ))}
                                </CardContent>
                            </Card>





                        </div>

                    </div>
                </CardContent>
            </Card>
        </>
    )
}