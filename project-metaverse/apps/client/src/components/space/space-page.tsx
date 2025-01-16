import { BACKEND_URL } from "@/lib/config";
import { AvatarInterface, ElementWithPositionInterface, MapElementInterface } from "@/lib/types";
import { useEffect, useState } from "react";
import Phaser from "phaser";

export function SpacePage({ spaceId }: { spaceId: string }) {
    const [elements, setElements] = useState<ElementWithPositionInterface[]>([]);
    const [dimensions, setDimensions] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [avatar, setAvatar] = useState<AvatarInterface>();


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

        const getAvatar = async () => {
            const res = await fetch(`${BACKEND_URL}/user/metadata`, {
                method: "GET",
                headers: {
                    contentType: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            console.log("avatar", data);
            setAvatar(data);
        }
        getAvatar();
        getSpace();
    }, [token, spaceId]);

    useEffect(() => {
        if (isLoading || !dimensions || !avatar?.avatarUrl) return;
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
                update,
            },
            pixelArt: true,
        };
    
        const game = new Phaser.Game(config);
        let player: Phaser.Physics.Arcade.Sprite;
        let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
        let gameElements: Phaser.Physics.Arcade.Sprite[] = [];
    
        function preload(this: Phaser.Scene) {
            // Load character sprite or fallback avatar
            const characterSprite = avatar?.avatarUrl || "/assets/default-avatar.png";
            this.load.spritesheet("character", characterSprite, {
                frameWidth: 32,
                frameHeight: 64,
            });
    
            // Load floor and other elements
            this.load.image("floor", "/assets/floor.png");
            elements.forEach((item) => {
                this.load.image(item.name, item.imageUrl);
            });
        }
    
        function create(this: Phaser.Scene) {
            // Add floor
            for (let i = 0; i <= width; i += 32) {
                for (let j = 0; j <= height; j += 32) {
                    this.add.image(i, j, "floor");
                }
            }
        
            // Add game elements
            elements.forEach((item) => {
                const element = this.physics.add.sprite(item.x, item.y, item.name);
                element.setData("static", item.static);
        
                if (item.static) {
                    element.setImmovable(true);
                }
                element.body.setAllowGravity(false);
                element.setDepth(item.y);
                gameElements.push(element);
            });
        
            // Create player
            player = this.physics.add.sprite(
                Phaser.Math.Between(5, width - 5),
                Phaser.Math.Between(5, height - 5),
                "character"
            );
        
            player.setCollideWorldBounds(true);
            player.body.setAllowGravity(false);
            player.setDepth(99999);
        
            // Make the camera follow the player
            this.cameras.main.startFollow(player, true);
            this.cameras.main.setZoom(1); // Adjust zoom level if needed
        
            // Create animations
            [
                { key: "stand-front", start: 0, end: 0 },
                { key: "walk-front", start: 1, end: 2 },
                { key: "stand-back", start: 6, end: 6 },
                { key: "walk-back", start: 7, end: 8 },
                { key: "stand-left", start: 3, end: 3 },
                { key: "walk-left", start: 4, end: 5 },
                { key: "stand-right", start: 9, end: 9 },
                { key: "walk-right", start: 10, end: 11 },
                { key: "say-hi-right", start: 12, end: 12 },
                { key: "say-hi-left", start: 15, end: 15 },
            ].forEach(({ key, start, end }) => {
                this.anims.create({
                    key,
                    frames:
                        start === end
                            ? [{ key: "character", frame: start }]
                            : this.anims.generateFrameNumbers("character", { start, end }),
                    frameRate: 10,
                    repeat: start === end ? 0 : -1,
                });
            });
        
            player.play("stand-front");
            cursors = this.input.keyboard.createCursorKeys()!;
        
            // Add collisions with game elements
            gameElements.forEach((element) => {
                if (element.getData("static")) {
                    this.physics.add.collider(player, element);
                }
            });
        }
        
        
        function update() {
            let moved = false;
            const speed = 100;
        
            player.setVelocity(0);
        
            if (cursors.left?.isDown) {
                player.setVelocityX(-speed);
                player.play("walk-left", true);
                moved = true;
            } else if (cursors.right?.isDown) {
                player.setVelocityX(speed);
                player.play("walk-right", true);
                moved = true;
            }
        
            // Allow movement in Y-axis only if not moving in X-axis
            if (!moved) {
                if (cursors.up?.isDown) {
                    player.setVelocityY(-speed);
                    player.play("walk-back", true);
                    moved = true;
                } else if (cursors.down?.isDown) {
                    player.setVelocityY(speed);
                    player.play("walk-front", true);
                    moved = true;
                }
            }
        
            // If no movement keys are pressed, play stand animation based on last direction
            if (!moved && player.anims.currentAnim) {
                const animKey = player.anims.currentAnim.key;
                if (animKey.startsWith("walk")) {
                    const direction = animKey.split("-")[1];
                    player.play(`stand-${direction}`);
                }
            }
        
            // Example of triggering an action with spacebar
            if (Phaser.Input.Keyboard.JustDown(cursors.space!)) {
                player.play("say-hi-right");
            }
        
            // Set depth based on Y position
            player.setDepth(player.y);
            gameElements.forEach((element) => {
                element.setDepth(element.y);
            });
        
            // Ensure the camera stays within the world bounds
            this.cameras.main.setBounds(0, 0, width, height);
        }
        
        return () => {
            game.destroy(true);
        };
    }, [elements, dimensions, isLoading, avatar]);
    

    return (
        <main className="flex flex-row h-full w-screen">
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

