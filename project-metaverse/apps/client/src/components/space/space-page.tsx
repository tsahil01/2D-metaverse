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

    const playerRef = useRef<Phaser.Physics.Arcade.Sprite | null>(null);
    const otherPlayersRef = useRef<OtherUser[]>([]);


    let player: Phaser.Physics.Arcade.Sprite;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    const gameElements: Phaser.Physics.Arcade.Sprite[] = [];
    let lastX: number;
    let lastY: number;


    function updateOtherPlayers(this: Phaser.Scene) {
        otherPlayersRef.current.forEach((otherPlayer) => {
            const existingPlayer = gameElements.find(
                (element) => element.getData("userId") === otherPlayer.userId
            );
    
            if (!existingPlayer) {
                const newPlayer = this.physics.add.sprite(otherPlayer.x, otherPlayer.y, "character");
                newPlayer.setData("userId", otherPlayer.userId);
                newPlayer.setDepth(99998);
                gameElements.push(newPlayer);
            } else {
                existingPlayer.x = otherPlayer.x;
                existingPlayer.y = otherPlayer.y;
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
            // 1. I will get space-join message. having = {type: "space-join", payload: {spawn: {x: 0, y: 0}, users: []}}
            // 2. If another user is already in the space, he will get user-joined message. having = {type: "user-joined", payload: {userId: "1", x: 0, y: 0}}
            // 3. If I move, I will send movement message. having = {type: "movement", payload: {x: 0, y: 0}} and my moves are accecpected, I will get movement-accepted message. having = {type: "movement-accepted", payload: {x: 0, y: 0}}
            // This will be broadcasted to all users in the space except me with user-moved message. having = {type: "user-moved", payload: {userId: "1", x: 0, y: 0}}
            // 4. If my movement is rejected, I will get movement-rejected message. having = {type: "movement-rejected", payload: {x: 0, y: 0}}

            switch (data.type) {
                case "space-join": {
                    setPlayerPosition({ x: data.payload.spawn.x, y: data.payload.spawn.y });
                    otherPlayersRef.current = data.payload.users;
                    break;
                }
                case "user-joined": {
                    otherPlayersRef.current = [...otherPlayersRef.current, { userId: data.payload.userId, x: data.payload.x, y: data.payload.y }];
                    break;
                }
                case "user-moved": {
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

                case "movement-accepted": {
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
        setWs(ws);
    }, [token, spaceId, avatar]);

    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.x = playerPosition.x;
            playerRef.current.y = playerPosition.y;
        }
    }, [playerPosition]);

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
            for (let i = 0; i <= width; i += 32) {
                for (let j = 0; j <= height; j += 32) {
                    this.add.image(i, j, "floor");
                }
            }

            player = this.physics.add.sprite(playerPosition.x, playerPosition.y, "character");
            player.setCollideWorldBounds(true);
            player.setDepth(99999); // this will make sure that the user is rendered on top of all other elements
            playerRef.current = player;


            elements.forEach((item) => {
                const element = this.physics.add.sprite(item.x, item.y, item.name);
                element.setData("static", item.static);

                if (item.static) {
                    element.setImmovable(true);
                }
                element.body.setAllowGravity(false);
                element.setDepth(element.y); // this will make sure that the elements are rendered in the correct order
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

            lastX = player.x;
            lastY = player.y;

        }

        function update(this: Phaser.Scene) {
            let moved = false;
            const speed = 50;
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

            gameElements.forEach((element) => {
                element.setDepth(element.y);
            });

            updateOtherPlayers.call(this);
            if (lastX !== player.x || lastY !== player.y) {
                ws?.send(
                    JSON.stringify({
                        type: "movement",
                        payload: {
                            x: player.x,
                            y: player.y,
                        },
                    })
                );
            }

            lastX = player.x;
            lastY = player.y;
        }


        return () => {
            game.destroy(true);
            ws?.close();
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
                    className="absolute inset-0 bg-primary/5 border"
                ></div>

            )}
        </main>
    );
}

