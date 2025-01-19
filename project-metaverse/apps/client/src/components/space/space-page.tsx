import { BACKEND_URL, WS_URL } from "@/lib/config";
import { AvatarInterface, ElementWithPositionInterface, MapElementInterface } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";


interface OtherUser {
    userId: string;
    x: number;
    y: number
}

export function SpacePage({ spaceId }: { spaceId: string }) {
    const [elements, setElements] = useState<ElementWithPositionInterface[]>([]);
    const [dimensions, setDimensions] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [avatar, setAvatar] = useState<AvatarInterface>();
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [playerPosition, setPlayerPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const wsRef = useRef<WebSocket | null>(null);

    const playerRef = useRef<Phaser.Physics.Arcade.Sprite | null>(null);
    const otherPlayersRef = useRef<OtherUser[]>([]);
    let player: Phaser.Physics.Arcade.Sprite;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    const gameElements: Phaser.Physics.Arcade.Sprite[] = [];
    const lastXRef = useRef<number>(0);
    const lastYRef = useRef<number>(0);


    function updateOtherPlayers(this: Phaser.Scene) {
        otherPlayersRef.current.forEach((otherPlayer) => {
            const existingPlayer = gameElements.find(
                (element) => element.getData("userId") === otherPlayer.userId
            );

            if (!existingPlayer) {
                const newPlayer = this.physics.add.sprite(otherPlayer.x, otherPlayer.y, "character");
                newPlayer.setData("userId", otherPlayer.userId);
                newPlayer.setDepth(99999);
                gameElements.push(newPlayer);
            } else {
                const oldX = existingPlayer.x;
                const oldY = existingPlayer.y;
                existingPlayer.x = otherPlayer.x;
                existingPlayer.y = otherPlayer.y;

                if (oldX !== otherPlayer.x) {
                    if (oldX > otherPlayer.x) {
                        existingPlayer.play("walk-left", true);
                    } else {
                        existingPlayer.play("walk-right", true);
                    }
                }
                else if (oldY !== otherPlayer.y) {
                    if (oldY > otherPlayer.y) {
                        existingPlayer.play("walk-back", true);
                    } else {
                        existingPlayer.play("walk-front", true);
                    }
                } else {
                    const animKey = existingPlayer.anims.currentAnim?.key;
                    if (animKey?.startsWith("walk")) {
                        const direction = animKey.split("-")[1];
                        existingPlayer.play(`stand-${direction}`);
                    }
                }
            }
        });
    }


    // TODO: Implement this function
    // async function getAvatarUsingUserId(userId: string) { };


    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            alert("You need to be logged in to access this page");
            window.location.href = "/login";
        } else {
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        if (!token) return;
        async function getSpace() {
            try {
                const res = await fetch(`${BACKEND_URL}/space/${spaceId}`, {
                    method: "GET",
                    headers: {
                        contentType: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (data === null) {
                    alert("Space not found");
                    window.location.href = "/";
                    return;
                }
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

        async function getAvatar() {
            const res = await fetch(`${BACKEND_URL}/user/metadata`, {
                method: "GET",
                headers: {
                    contentType: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data === null) {
                alert("Avatar not found");
                window.location.href = "/";
                return;
            }
            setAvatar(data);
        };
        getAvatar();
        getSpace();
    }, [token, spaceId]);

    useEffect(() => {
        if (!token || !spaceId || !avatar) return;
        const ws = new WebSocket(`${WS_URL}`);
        ws.onopen = () => {
            console.log("Connected to WS");
            ws.send(
                JSON.stringify({
                    type: "join",
                    payload: {
                        spaceId,
                        token
                    },
                })
            );
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WS message", data);
            switch (data.type) {
                case "space-join": {
                    setPlayerPosition({ x: data.payload.spawn.x, y: data.payload.spawn.y });
                    const opArray = data.payload.users.map((u: { userId: string, x: number, y: number }) => ({ userId: u.userId, x: u.x, y: u.y }));
                    otherPlayersRef.current = opArray;


                    break;
                }
                case "user-joined": {
                    otherPlayersRef.current = [...otherPlayersRef.current, { userId: data.payload.userId, x: data.payload.x, y: data.payload.y }];
                    break;
                }
                case "user-moved": {
                    if (!otherPlayersRef.current.find((u) => u.userId === data.payload.userId)) {
                        otherPlayersRef.current.push({ userId: data.payload.userId, x: data.payload.x, y: data.payload.y });
                    }

                    const userIndex = otherPlayersRef.current.findIndex((u) => u.userId === data.payload.userId);
                    if (userIndex !== -1) {
                        otherPlayersRef.current[userIndex] = { userId: data.payload.userId, x: data.payload.x, y: data.payload.y };
                    }
                    break;
                }
                case "movement-rejected": {
                    setPlayerPosition({ x: data.payload.x, y: data.payload.y });
                    break;
                }

                case "user-left": {
                    otherPlayersRef.current = otherPlayersRef.current.filter((u) => u.userId !== data.payload.userId);
                    break;
                }
            }
        };
        ws.onclose = () => {
            console.log("Disconnected from WS");
        };

        wsRef.current = ws;
        setWs(ws);

        return () => {
            if (wsRef.current) {
                wsRef.current.close(); // Clean up WebSocket when the component unmounts or changes
                wsRef.current = null;
            }
        };

    }, [token, spaceId, avatar]);

    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.x = playerPosition.x;
            playerRef.current.y = playerPosition.y;
        }
    }, [playerPosition]);

    useEffect(() => {
        if (isLoading || !dimensions || !avatar?.avatarUrl || !playerPosition) return;
        const width = parseInt(dimensions.split("x")[0]);
        const height = parseInt(dimensions.split("x")[1]);

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.RESIZE,
                parent: 'phaser-game',
                width: "100%",
                height: "100%",
            },
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
        let mainCamera: Phaser.Cameras.Scene2D.Camera;

        function preload(this: Phaser.Scene) {
            const characterSprite = avatar?.avatarUrl || "/assets/default-avatar.png";
            this.load.spritesheet("character", characterSprite, {
                frameWidth: 32,
                frameHeight: 64,
            });

            this.load.image("floor", "/assets/floor.png");
            elements.forEach((item) => {
                this.load.image(item.name, item.imageUrl);
            });

        }

        function create(this: Phaser.Scene) {
            this.physics.world.setBounds(0, 0, width, height);

            for (let i = 0; i <= width; i += 32) {
                for (let j = 0; j <= height; j += 32) {
                    this.add.image(i, j, "floor");
                }
            }

            mainCamera = this.cameras.main;
            mainCamera.setBounds(0, 0, width, height);

            player = this.physics.add.sprite(playerPosition.x, playerPosition.y, "character");
            player.setCollideWorldBounds(true);
            player.setDepth(99999);
            playerRef.current = player;

            mainCamera.startFollow(player, true, 0.5, 0.5);
            mainCamera.setZoom(1);

            // Set up zoom controls
            this.input.keyboard?.addKey('Q').on('down', () => {
                mainCamera.setZoom(Math.max(0.5, mainCamera.zoom - 0.1));
            });

            this.input.keyboard?.addKey('E').on('down', () => {
                mainCamera.setZoom(Math.min(2, mainCamera.zoom + 0.1));
            });
            mainCamera.setZoom(4); // Clamp between 0.5 and 2
            elements.forEach((item) => {
                const element = this.physics.add.sprite(item.x, item.y, item.name);
                element.setData("static", item.static);

                if (item.static) {
                    element.setImmovable(true);
                }
                element.body.setAllowGravity(false);
                element.setDepth(element.y);
                gameElements.push(element);
            });
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
            if (this.input.keyboard) {
                cursors = this.input.keyboard.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
            }

            gameElements.forEach((element) => {
                if (element.getData("static")) {
                    this.physics.add.collider(player, element);
                }
            });

            lastXRef.current = 0;
            lastYRef.current = 0;

        }

        function update(this: Phaser.Scene) {
            let moved = false;
            const speed = 100;
            player.setVelocity(0);

            if (cursors.left?.isDown) {
                player.play("walk-left", true);
                player.setVelocityX(-speed);
                moved = true;
            } else if (cursors.right?.isDown) {
                player.setVelocityX(speed);
                player.play("walk-right", true);
                moved = true;
            }

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

            if (!moved && player.anims.currentAnim) {
                const animKey = player.anims.currentAnim.key;
                if (animKey.startsWith("walk")) {
                    const direction = animKey.split("-")[1];
                    player.play(`stand-${direction}`);
                }
            }

            if (Phaser.Input.Keyboard.JustDown(cursors.space!)) {
                player.play("say-hi-right");
            }

            // gameElements.forEach((element) => {
            //     element.setDepth(element.y);
            // });

            updateOtherPlayers.call(this);
            if (lastXRef.current !== player.x || lastYRef.current !== player.y) {
                ws?.send(
                    JSON.stringify({
                        type: "movement",
                        payload: {
                            x: Math.round(player.x),
                            y: Math.round(player.y),
                        },
                    })
                );
            }

            lastXRef.current = player.x;
            lastYRef.current = player.y;

            if (player && player.body && (player.body.velocity.x !== 0 || player.body.velocity.y !== 0)) {
                mainCamera.stopFollow();
                const targetX = player.x;
                const targetY = player.y;
                mainCamera.pan(targetX, targetY, 200);
            }
        }


        return () => {
            game.destroy(true);
            ws?.close();

        };
    }, [elements, dimensions, isLoading, avatar]);

    return (
        <main className="w-screen h-screen overflow-hidden">
            {isLoading ? (
                <div className="flex items-center justify-center w-full h-full">
                    <p>Loading...</p>
                </div>
            ) : (
                <div
                    id="phaser-game"
                    className="w-full h-full"
                ></div>
            )}
        </main>
    );
}

