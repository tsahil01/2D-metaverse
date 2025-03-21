import { User } from "./User";

export class RoomManager {
    rooms: Map<string, User[]> = new Map();
    static instance: RoomManager;

    private constructor() {
        this.rooms = new Map();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }

    public addUserToRoom(user: User, spaceId: string) {
        console.log("Adding user to room", user.id, spaceId);
        if (!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId, [user]);
            return;
        }
        this.rooms.set(spaceId, [...(this.rooms.get(spaceId) ?? []), user]);
    };

    public removeUserFromRoom(user: User, spaceId: string) {
        if (!this.rooms.has(spaceId)) {
            return;
        }
        this.rooms.set(spaceId, (this.rooms.get(spaceId)?.filter((u) => u.id !== user.id)) ?? []);
        if (this.rooms.get(spaceId)?.length === 0) {
            this.rooms.delete(spaceId);
        }
    }

    public broadcast(message: any, user: User, roomId: string) {
        if (!this.rooms.has(roomId)) {
            return;
        }
        this.rooms.get(roomId)?.forEach((u) => {
            if (u.id !== user.id) {
                u.send(message);
            }
        });
    }

    public sendToUsers(message: any, roomId: string, to: string) {
        if (!this.rooms.has(roomId)) return;
        const user = this.rooms.get(roomId)?.find((u) => u.userId === to);
        if (user) {
            user.send(message);
        }
    }
}