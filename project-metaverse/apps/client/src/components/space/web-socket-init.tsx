import { avatarAtom } from "@/lib/atom/avatarAtom";
import { playerPositionAtom } from "@/lib/atom/playerPositionAtom";
import { wsAtom } from "@/lib/atom/wsAtom";
import { WS_URL } from "@/lib/config";
import { OtherUser } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Game } from "./game";

export function WebSocketInit({ spaceId, token }: { spaceId: string, token: string }) {
    const wsRef = useRef<WebSocket | null>(null);
    const avatar = useRecoilValue(avatarAtom);
    const setWs = useSetRecoilState(wsAtom);
    const setPlayerPosition = useSetRecoilState(playerPositionAtom);
    const otherPlayersRef = useRef<OtherUser[]>([]);
    const [settingWs, setSettingWs] = useState(true);

    useEffect(() => {
        if (!token || !spaceId || !avatar) {
            alert("Invalid token or spaceId or avatar");
            return;
        };

        wsRef.current = new WebSocket(`${WS_URL}`);
        setWs(wsRef.current);

        wsRef.current.onopen = () => {
            console.log("Connected to websocket");
            wsRef.current?.send(JSON.stringify({
                type: "join",
                payload: {
                    spaceId,
                    token,
                    avatar,
                }
            }));
        };

        wsRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("Received message", data);
            switch (data.type) {
                case "space-join": {
                    setPlayerPosition({ x: data.payload.spawn.x, y: data.payload.spawn.y, });
                    const opArray = data.payload.users.map((u: OtherUser) => (
                        {
                            userId: u.userId,
                            x: u.x,
                            y: u.y
                        }
                    ));
                    otherPlayersRef.current = opArray;
                    setSettingWs(false);
                    break;
                }

                case "user-joined": {
                    const newPlayer: OtherUser = {
                        userId: data.payload.userId,
                        x: data.payload.x,
                        y: data.payload.y
                    }
                    otherPlayersRef.current.push(newPlayer);
                    break;
                }

                case "user-moved": {
                    const findPlayer = otherPlayersRef.current.find((p) => p.userId === data.payload.userId);
                    if (!findPlayer) {
                        console.log("User not found");
                        return;
                    }
                    findPlayer.x = data.payload.x;
                    findPlayer.y = data.payload.y;
                    break;
                }

                case "movement-rejected": {
                    setPlayerPosition({ x: data.payload.x, y: data.payload.y });
                    break;
                }

                case "user-left": {
                    const index = otherPlayersRef.current.findIndex((p) => p.userId === data.payload.userId);
                    if (index < 0) {
                        console.log("User not found");
                        return;
                    }
                    otherPlayersRef.current.splice(index, 1);
                    break;
                }
            }
        };

        wsRef.current.onclose = () => {
            console.log("Connection closed");
        };

        wsRef.current.onerror = (e) => {
            console.log("Error", e);
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.onmessage = null;
                wsRef.current.close();
                wsRef.current = null;
            }
            setWs(null);
        };
    }, []);
    return <>

        {settingWs && <div className="fixed top-0 left-0 w-full h-full bg-black flex justify-center items-center">
            <div className="text-white text-3xl font-bold">Connecting to Space...</div>
        </div>}

        {
            !settingWs && <Game otherPlayersRef={otherPlayersRef} />
        }

    </>
}