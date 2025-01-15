import { MapInterface } from "@/lib/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/lib/config";

export function NewSpaceCard() {
    const [maps, setMaps] = useState<MapInterface[]>([]);

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
        setMaps(data);
    }

    useEffect(() => {
        getMaps();
    }, []);

    return <>
        <Card className="mt-9 w-full">
            <CardHeader className="bg-primary/5 flex flex-row justify-between border-b border-primary/10">
                <div>
                    <CardTitle>Existing Maps</CardTitle>
                    <CardDescription>Here are the virtual spaces you have created. You can create new spaces and manage them here.</CardDescription>
                </div>
                <Button
                onClick={() => window.location.href = "/new-space/create"}
                >Start with Empty Space</Button>
            </CardHeader>
            <CardContent className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {
                    maps.length == 0 && (
                        <div className="text-center col-span-3 h-full border-2 border-dashed border-primary-50 rounded-lg p-4">
                            <h2 className="text-primary-50">
                                You have not created any spaces yet.
                            </h2>
                        </div>
                    )
                }
                {maps.map(map => <MapCard {...map} />)}

            </CardContent>
        </Card>
    </>
}

function MapCard({ id, name, thumbnail, height, width, mapElements }: MapInterface) {
    return (
        <Card key={id}>
            <CardHeader className="flex gap-2">
                <img src={thumbnail || ""} alt={name} />
            </CardHeader>
            <CardContent>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{height}x{width}</CardDescription>
            </CardContent>
            <CardFooter>
                <Button className="bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                    onClick={() => window.location.href = `/new-space/${id}`}
                >
                    Use this Map
                </Button>
            </CardFooter>
        </Card>
    )
}