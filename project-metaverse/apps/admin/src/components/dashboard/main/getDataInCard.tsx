import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BACKEND_URL } from "@/lib/config";
import { AvatarInterface, ElementInterface, MapInterface } from "@/lib/types";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";

export function MapCard({ id, name, thumbnail, height, width, mapElements }: MapInterface) {
    return (
        <Card key={id}>
            <CardHeader className="flex gap-2">
                <img src={thumbnail || ""} alt={name} />
            </CardHeader>
            <CardContent>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{height}x{width}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant={'outline'}
                    onClick={() => {
                        window.location.href = `/map/${id}`;
                    }}
                >View</Button>
                <Button variant={'outline'}>Delete</Button>
            </CardFooter>
        </Card>
    )
}


export function ElementCard({ id, width, height, imageUrl, name, static: isStatic }: ElementInterface) {
    const [newImgUrl, setNewImgUrl] = useState<string>("");
    const [update, setUpdate] = useState<boolean>(false);

    async function UpdateElement() {
        if (newImgUrl === "") return;

        const res = await fetch(`${BACKEND_URL}/admin/element/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                imageUrl: newImgUrl,
            }),
        });
        if (res.ok) {
            alert("Element Updated")
        } else {
            alert("Failed to update element")
        }
    }
    return (
        <Card key={id}>
            <CardHeader>
                <img className="w-full h-32 object-contain mb-2" src={imageUrl ||
                    "https://via.placeholder.com/150"} alt={id} />
            </CardHeader>
            <CardContent>
                <CardTitle>{name}</CardTitle>
                <CardDescription>
                    {width}x{height} {isStatic ? "Static" : "Dynamic"}
                </CardDescription>
            </CardContent>
            <CardFooter className="flex flex-col space-y-1.5 justify-between items-start">
                {
                    update && (
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="imgUrl"> New Image: </Label>
                            <Input id="imgUrl" placeholder="https://exampleImgUrl.com/150" onChange={
                                (e) => setNewImgUrl(e.target.value)
                            } value={newImgUrl} />

                        </div>
                    )
                }
                <Button variant={'outline'}
                    onClick={() => {
                        if (!update) {
                            setUpdate(true);
                        } else if (newImgUrl) {
                            UpdateElement();
                            setUpdate(false);
                        }
                    }}
                >
                    {update ? (newImgUrl ? "Save" : "Enter Image Url") : "Update"}
                </Button>
            </CardFooter>
        </Card>
    )
}

export function AvatarCard({ id, name, imageUrl }: AvatarInterface) {
    return (
        <Card key={id}>
            <CardHeader>
                <div
                    className="w-full h-32 bg-no-repeat bg-cover mb-2"
                    style={{
                        backgroundImage: `url(${imageUrl || "https://via.placeholder.com/150"})`,
                        backgroundPosition: '32 0',
                        backgroundSize: 'cover',
                    }}
                ></div>
            </CardHeader>
            <CardContent>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{id}</CardDescription>
            </CardContent>
        </Card>
    );
}
