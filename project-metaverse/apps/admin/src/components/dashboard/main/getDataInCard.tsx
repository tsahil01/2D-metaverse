import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarInterface, ElementInterface, MapInterface } from "@/lib/types";

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
                <Button variant={'outline'}>View</Button>
                <Button variant={'outline'}>Delete</Button>
            </CardFooter>
        </Card>
    )
}


export function ElementCard({ id, width, height, imageUrl, name, static: isStatic }: ElementInterface) {
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
            <CardFooter className="flex justify-between">
                <Button variant={'outline'}>View</Button>
                <Button variant={'outline'}>Delete</Button>
            </CardFooter>
        </Card>
    )
}

export function AvatarCard({ id, name, imageUrl }: AvatarInterface) {
    return (
        <Card key={id}>
            <CardHeader>
                <img className="w-full h-32 object-contain mb-2" src={imageUrl || "https://via.placeholder.com/150"} alt={name} />
            </CardHeader>
            <CardContent>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{id}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant={'outline'}>View</Button>
                <Button variant={'outline'}>Delete</Button>
            </CardFooter>
        </Card>
    )
}