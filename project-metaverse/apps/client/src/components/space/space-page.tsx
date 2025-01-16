import { BACKEND_URL } from "@/lib/config";
import { ElementWithPositionInterface, MapElementInterface } from "@/lib/types";
import { useEffect, useState } from "react";
import Phaser from "phaser";

export function SpacePage({ spaceId }: { spaceId: string }) {
    const [elements, setElements] = useState<ElementWithPositionInterface[]>([]);
    const [dimensions, setDimensions] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            window.location.href = "/login";
        } else {
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        if (!token) return;

        const getSpace = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/space/${spaceId}`, {
                    method: "GET",
                    headers: {
                        contentType: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                console.log("data", data);

                setDimensions(data.dimensions || null);
                setElements(
                    data.elements.map((e: MapElementInterface) => ({
                        x: e.x,
                        y: e.y,
                        id: e.element.id,
                        name: e.element.name,
                        imageUrl: e.element.imageUrl,
                        width: e.element.width,
                        height: e.element.height,
                        static: e.element.static,
                    }))
                );
            } catch (error) {
                console.error("Error fetching space data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getSpace();
    }, [token, spaceId]);

    useEffect(() => {
        if (isLoading || !dimensions) return;

        const [width, height] = dimensions.split("x").map(Number);

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width,
            height,
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

            for (let i = 0; i <= width; i += 32) {
                for (let j = 0; j <= height; j += 32) {
                    this.add.image(i, j, "floor");
                }
            }


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
    }, [elements, dimensions, isLoading]);

    return (
        <main className="flex flex-row h-screen w-screen">
            {isLoading ? (
                <div className="flex items-center justify-center w-full h-full">
                    <p>Loading...</p>
                </div>
            ) : (
                <div
                    id="phaser-game"
                    className="absolute inset-0 bg-primary/5"
                ></div>

            )}
        </main>
    );
}
