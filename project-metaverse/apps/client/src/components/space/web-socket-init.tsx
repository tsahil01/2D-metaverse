import { avatarAtom } from "@/lib/atom/avatarAtom";
import { otherPlayersAtom } from "@/lib/atom/otherPlayersAtom";
import { playerPositionAtom } from "@/lib/atom/playerPositionAtom";
import { wsAtom } from "@/lib/atom/wsAtom";
import { WS_URL } from "@/lib/config";
import { OtherUser } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Game } from "./game";

export function WebSocketInit({ spaceId, token }: { spaceId: string, token: string }) {
    const wsRef = useRef<WebSocket | null>(null);
    const avatar = useRecoilValue(avatarAtom);
    const setWs = useSetRecoilState(wsAtom);
    const setPlayerPosition = useSetRecoilState(playerPositionAtom);
    const [otherPlayers, setOtherPlayers] = useRecoilState(otherPlayersAtom);
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
            setSettingWs(false);
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
                    setOtherPlayers(opArray);
                    break;
                }

                case "user-joined": {
                    const newPlayer: OtherUser = {
                        userId: data.payload.userId,
                        x: data.payload.x,
                        y: data.payload.y
                    }
                    setOtherPlayers([...otherPlayers, newPlayer]);
                    break;
                }

                case "user-move": {
                    if (!otherPlayers.find((p) => p.userId === data.payload.userId)) {
                        setOtherPlayers([...otherPlayers, {
                            userId: data.payload.userId,
                            x: data.payload.x,
                            y: data.payload.y
                        }]);
                    }

                    const userIndex = otherPlayers.findIndex((p) => p.userId === data.payload.userId);
                    if (userIndex === -1) {
                        console.log("User not found");
                        return;
                    }
                    otherPlayers[userIndex].x = data.payload.x;
                    otherPlayers[userIndex].y = data.payload.y;
                    break;
                }

                case "movement-rejected": {
                    setPlayerPosition({ x: data.payload.x, y: data.payload.y });
                    break;
                }

                case "user-left": {
                    const findPlayer = otherPlayers.find((p) => p.userId === data.payload.userId);
                    if (!findPlayer) {
                        console.log("User not found");
                        return;
                    }
                    setOtherPlayers(otherPlayers.filter((p) => p.userId !== data.payload.userId));
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
    }, [token, spaceId, avatar]);
    return <>

        {settingWs && <div className="fixed top-0 left-0 w-full h-full bg-black flex justify-center items-center">
            <div className="text-white text-3xl font-bold">Connecting to Space...</div>
        </div>}

        {
            !settingWs && <Game />
        }

    </>
}