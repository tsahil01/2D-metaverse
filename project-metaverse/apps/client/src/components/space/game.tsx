import { avatarAtom } from "@/lib/atom/avatarAtom";
import { dimensionsAtom } from "@/lib/atom/dimensionsAtom";
import { playerPositionAtom } from "@/lib/atom/playerPositionAtom";
import { spaceElementsAtom } from "@/lib/atom/spaceElementsAtom";
import { userNameAtom } from "@/lib/atom/userNameAtom";
import { wsAtom } from "@/lib/atom/wsAtom";
import { OtherUser } from "@/lib/types";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";

export function Game({ otherPlayersRef }: { otherPlayersRef: React.RefObject<OtherUser[]> }) {

    const avatar = useRecoilValue(avatarAtom);
    const dimensions = useRecoilValue(dimensionsAtom);
    const elements = useRecoilValue(spaceElementsAtom);
    const playerPosition = useRecoilValue(playerPositionAtom);
    const userName = useRecoilValue(userNameAtom) || "Unknown";

    const width = parseInt(dimensions?.split("x")[0] || "0");
    const height = parseInt(dimensions?.split("x")[1] || "0");

    const playerRef = useRef<Phaser.Physics.Arcade.Sprite | null>(null);
    const cursorsRef = useRef<Phaser.Types.Input.Keyboard.CursorKeys | null>(null);
    const gameElements: Phaser.Physics.Arcade.Sprite[] = [];
    const ws = useRecoilValue(wsAtom);

    const lastXRef = useRef<number>(0);
    const lastYRef = useRef<number>(0);

    function updateOtherPlayers(this: Phaser.Scene) {
        if (!otherPlayersRef.current) return;
        otherPlayersRef.current.forEach((op) => {
            const existingPlayer = gameElements.find((e) => e.getData("userId") === op.userId);
            if (!existingPlayer) {
                console.log("Creating new player", op);
    
                const newPlayer = this.physics.add.sprite(op.x, op.y, "character");
                newPlayer.setData("userId", op.userId);
    
                const usernameText = this.add.text(op.x, op.y - 10, op.userName || "Unknown", {
                    fontSize: '10px',
                    color: 'white',
                    padding: { x: 2, y: 2 },
                    resolution: 20,
                    align: 'center',
                });
                usernameText.setOrigin(0.5, 0.5);
                usernameText.setDepth(99999);
    
                newPlayer.setData("usernameText", usernameText);
                newPlayer.setDepth(99999);
    
                gameElements.push(newPlayer);
            } else {
                const oldX = existingPlayer.x;
                const oldY = existingPlayer.y;
    
                existingPlayer.setPosition(op.x, op.y);
                const usernameText = existingPlayer.getData("usernameText");
                if (usernameText) {
                    usernameText.setPosition(op.x, op.y - 18);
                }
    
                if (oldX !== op.x) {
                    if (oldX > op.x) {
                        existingPlayer.play("walk-left", true);
                    } else {
                        existingPlayer.play("walk-right", true);
                    }
                } else if (oldY !== op.y) {
                    if (oldY > op.y) {
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
    


    useEffect(() => {
        if (playerRef.current) {
            playerRef.current?.setPosition(playerPosition.x, playerPosition.y);
        }
    }, [playerPosition])

    useEffect(() => {
        if (!dimensions || !avatar?.avatarUrl || !playerPosition || !ws) return;

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
            pixelArt: false,
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

            playerRef.current = this.physics.add.sprite(playerPosition.x, playerPosition.y, "character");
            (playerRef.current).setCollideWorldBounds(true);
            (playerRef.current).setDepth(99999);

            const usernameText = this.add.text(playerPosition.x, playerPosition.y - 18, userName, {
                fontSize: '10px',
                color: 'grey',
                padding: { x: 2, y: 2 },
                resolution: 20,
                align: 'center',
            });
            usernameText.setOrigin(0.5, 0.5);
            usernameText.setDepth(99999);

            (this as any).usernameText = usernameText;

            mainCamera.startFollow(playerRef.current, true, 0.5, 0.5);
            mainCamera.setZoom(1);

            this.input.keyboard?.addKey('Q').on('down', () => {
                mainCamera.setZoom(Math.max(0.5, mainCamera.zoom - 0.1));
            });

            this.input.keyboard?.addKey('E').on('down', () => {
                mainCamera.setZoom(Math.min(2, mainCamera.zoom + 0.1));
            });
            mainCamera.setZoom(4);
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

            playerRef.current.play("stand-front");
            if (this.input.keyboard) {
                cursorsRef.current = this.input.keyboard.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
            }

            gameElements.forEach((element) => {
                if (element.getData("static") && playerRef.current) {
                    this.physics.add.collider(playerRef.current, element);
                }
            });

            lastXRef.current = 0;
            lastYRef.current = 0;

        }

        function update(this: Phaser.Scene) {
            const player = playerRef.current!;
            const cursors = cursorsRef.current!;
            const usernameText = (this as any).usernameText;
            let moved = false;
            const speed = 100;

            if (usernameText) {
                usernameText.setPosition(player.x, player.y - 18);
            }

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
            console.log("Game destroyed");

        };

    }, []);

    return <>
        <main className="w-screen h-screen overflow-hidden">
            <div
                id="phaser-game"
                className="w-full h-full"
            ></div>
        </main>
    </>
}