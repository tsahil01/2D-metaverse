import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from ".";
import { RoomManager } from "./RoomManager";
import client from "@repo/db/client";
import { WebSocket } from 'ws';


function getRandomId() {
    return Math.random().toString(36).substring(4);
}

export class User {
    public id: string;
    public userId?: string;
    public spaceId?: string;
    public ws: WebSocket;
    public x: number;
    public y: number;


    constructor(ws: WebSocket) {
        this.id = getRandomId();
        this.x = 0;
        this.y = 0;
        this.ws = ws;
        this.initHandlers();
    }

    initHandlers() {
        this.ws.on('message', async (data) => {
            const parseData = await JSON.parse(data.toString());
            console.log("PARSED DATA", parseData)

            switch (parseData.type) {
                case 'join': {
                    const spaceId = parseData.payload.spaceId;
                    const token = parseData.payload.token;
                    const userId = (jwt.verify(token, JWT_SECRET) as JwtPayload).userId;
                    if (!userId) {
                        this.ws.close()
                        return;
                    };
                    this.userId = userId;
                    console.log("USER ID", userId);

                    const space = await client.space.findFirst({
                        where: {
                            id: spaceId
                        }
                    });

                    if (!space) {
                        this.ws.close()
                        return;
                    }
                    this.spaceId = spaceId;

                    RoomManager.getInstance().addUserToRoom(this, spaceId);
                    console.log("USER JOINED", this.id, spaceId);
                    console.log("SPACE", space);
                    console.log("ROOMS", RoomManager.getInstance().rooms);
                    console.log("USERS in room", RoomManager.getInstance().rooms.get(spaceId));
                    this.x = Math.floor(Math.random() * space?.width)
                    this.y = Math.floor(Math.random() * space?.height)

                    this.send({
                        type: "space-join",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y
                            },
                            users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x => x.id !== this.id)?.map((u) => ({ id: u.id, userId: u.userId })) ?? []
                        }
                    });

                    RoomManager.getInstance().broadcast({
                        type: "user-joined",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y
                        }
                    }, this, this.spaceId!);
                    break;
                }
                case 'movement': {
                    const moveX = parseData.payload.x;
                    const moveY = parseData.payload.y;

                    const xDisplacement = Math.abs(this.x - moveX)
                    const yDisplacement = Math.abs(this.y - moveY)

                    if ((xDisplacement <= 50 && yDisplacement === 0) || (yDisplacement <= 50 && xDisplacement === 0)) {
                        this.x = moveX;
                        this.y = moveY;

                        RoomManager.getInstance().broadcast({
                            type: 'user-moved',
                            payload: {
                                x: this.x,
                                y: this.y,
                                userId: this.userId
                            },
                        }, this, this.spaceId!)

                        this.send({
                            type: "movement-accepted",
                            payload: {
                                x: this.x,
                                y: this.y
                            }
                        })
                        return;
                    };

                    this.send({
                        type: "movement-rejected",
                        payload: {
                            x: this.x,
                            y: this.y
                        }
                    })
                    break;
                }
            }
        })
    }

    send(payload: any) {
        this.ws.send(JSON.stringify(payload))
    }

    destroy() {
        RoomManager.getInstance().broadcast({
            type: "user-left",
            payload: {
                userId: this.userId
            }
        }, this, this.spaceId!);
        RoomManager.getInstance().removeUserFromRoom(this, this.spaceId!);
    }

}