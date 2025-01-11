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


    constructor(private wss: WebSocket) {
        this.id = getRandomId();
        this.x = 0;
        this.y = 0;
        this.ws = wss;
        this.initHandlers();
    }

    initHandlers() {
        this.ws.on('message', (data) => {
            const parseData = JSON.parse(data.toString());

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

                    const space = client.space.findFirst({
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
                    this.x = Math.floor(Math.random() * space?.width)
                    this.y = Math.floor(Math.random() * space?.height)

                    this.send({
                        type: "space-join",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y
                            },
                            users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x => x.id !== this.id)?.map((u) => ({ id: u.id })) ?? []
                        }
                    });

                    RoomManager.getInstance().broadcast({
                        type: "user-joined",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y
                        },
                    }, this, this.spaceId!);

                    break;
                }
                case 'movement': {
                    const moveX = parseData.payload.x;
                    const moveY = parseData.payload.y;

                    const xDisplacement = Math.abs(this.x - moveX)
                    const yDisplacement = Math.abs(this.y - moveY)

                    if ((xDisplacement == 1 && yDisplacement == 0) || (xDisplacement == 0 || yDisplacement == 1)) {
                        this.x = moveX;
                        this.y = moveY;

                        RoomManager.getInstance().broadcast({
                            type: 'movement',
                            payload: {
                                x: this.x,
                                y: this.y,
                            },
                        }, this, this.spaceId!)
                        return;
                    };
                    this.send({
                        type: "movement-regected",
                        payload: {
                            x: this.x,
                            y: this.y
                        }
                    })
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