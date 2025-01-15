import { ElementWithPositionInterface, MapElementInterface } from "@/lib/types";
import { useEffect, useState } from "react";
import Phaser from "phaser";
import { BACKEND_URL } from "@/lib/config";
import { Navbar } from "../nav/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function MapViaId({ id }: { id: string }) {
    const [elements, setElements] = useState<ElementWithPositionInterface[]>([]);
    const [dimension, setDimension] = useState("");
    const [name, setName] = useState("");
    const [thumbnail, setThumbnail] = useState("");

    const fetchMap = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/admin/map/${id}`, {
                headers: {
                    content: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            setElements(data.mapElements.map((element: MapElementInterface) => ({
                ...element.element,
                x: element.x,
                y: element.y,
            })));
            setDimension(`${data.height}x${data.width}`);
            setThumbnail(data.thumbnail);
        } catch (error) {
            console.error("Failed to fetch map:", error);
        }
    };

    async function createSpace() {
        const res = await fetch(`${BACKEND_URL}/space`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                name,
                dimension,
                mapId: id,
                thumbnail,
            }),
        });

        const data = await res.json();

        console.log(data);

        if (data.spaceId) {
            alert("Space created successfully");
        } else {
            alert("Failed to create space");
        }
    }

    useEffect(() => {
        fetchMap();
    }, []);

    useEffect(() => {
        if (!dimension) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: parseInt(dimension.split("x")[0]),
            height: parseInt(dimension.split("x")[1]),
            parent: "phaser-game",
            physics: {
                default: "arcade",
                arcade: { debug: false },
            },
            scene: {
                preload,
                create,
            },
        };

        const game = new Phaser.Game(config);

        function preload(this: Phaser.Scene) {
            this.load.image("floor", "/assets/floor.png");
            elements.forEach((item) => {
                this.load.image(item.name, item.imageUrl);
            });
        }

        function create(this: Phaser.Scene) {
            const width = config.width as number;
            const height = config.height as number;

            // Add floor tiles
            for (let i = 0; i <= width; i += 32) {
                for (let j = 0; j <= height; j += 32) {
                    this.add.image(i, j, "floor");
                }
            }

            // Display elements
            elements.forEach((item) => {
                const element = this.physics.add.sprite(item.x, item.y, item.name);
                element.setImmovable(true);
                element.body.setAllowGravity(false);
                element.setDepth(item.y);
            });
        }

        return () => {
            game.destroy(true);
        };
    }, [elements, dimension]);

    const isButtonDisabled = !name || !dimension || !thumbnail;

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
            <header className="relative overflow-hidden">
                <Navbar />
                <div className="container mx-auto px-4 flex flex-row gap-2 lg:px-8">
                    <Card className="mt-9 w-full">
                        <CardHeader className="border-b bg-primary/5">
                            <CardTitle>View Map</CardTitle>
                            <CardDescription>Enter the map name to save</CardDescription>
                        </CardHeader>
                        <CardContent className="my-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Map Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter map name (e.g., New Map)"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div
                                    id="phaser-game"
                                    className="p-3bg-primary/5 rounded-lg overflow-scroll border border-gray-300 w-full"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={createSpace}
                                disabled={isButtonDisabled}
                                className={`w-full ${isButtonDisabled
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-500 hover:bg-blue-600 text-white"
                                    }`}
                            >
                                Create Space
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </header>
        </div>
    );
}
