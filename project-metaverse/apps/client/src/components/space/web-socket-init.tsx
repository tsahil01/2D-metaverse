import { avatarAtom } from "@/lib/atom/avatarAtom";
import { otherPlayersAtom } from "@/lib/atom/otherPlayersAtom";
import { playerPositionAtom } from "@/lib/atom/playerPositionAtom";
import { wsAtom } from "@/lib/atom/wsAtom";
import { WS_URL } from "@/lib/config";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export function WebSocketInit({ spaceId, token }: { spaceId: string, token: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);
    const avatar = useRecoilValue(avatarAtom);
    const setWs = useSetRecoilState(wsAtom);
    const setPlayerPosition = useSetRecoilState(playerPositionAtom);
    const setOtherPlayers = useSetRecoilState(otherPlayersAtom);



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
                    const opArray = data.payload.users.map((u: { userId: string, x: number, y: number }) => ({ userId: u.userId, x: u.x, y: u.y }));
                    setOtherPlayers(opArray);
                }

                    break;

                case "user-join":

                    break;

                case "user-move":

                    break;

                case "movement-rejected":

                    break;

                case "user-left":

                    break;

            }
        };

        wsRef.current.onclose = () => {
            console.log("Connection closed");
        };

        return () => {
            wsRef.current?.close();
            setWs(null);
        };
    }, [token, spaceId, avatar]);
    return <>
    </>
}