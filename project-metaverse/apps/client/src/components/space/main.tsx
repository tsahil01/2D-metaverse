import { BACKEND_URL } from "@/lib/config";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { avatarAtom } from "@/lib/atom/avatarAtom";
import { spaceElementsAtom } from "@/lib/atom/spaceElementsAtom";
import { dimensionsAtom } from "@/lib/atom/dimensionsAtom";
import { tokenAtom } from "@/lib/atom/tokenAtom";
import { userNameAtom } from "@/lib/atom/userNameAtom";
import { MapElementInterface } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { SpaceInit } from "./spaceInit";
import { WebSocketInit } from "./web-socket-init";

export function SpaceMain({ spaceId = "cm628eno4000hk41j471e3kuo" }: { spaceId: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [spaceName, setSpaceName] = useState<string | null>(null);

    const [token, setToken] = useRecoilState(tokenAtom);
    const [avatar, setAvatar] = useRecoilState(avatarAtom);
    const setDimensions = useSetRecoilState(dimensionsAtom);
    const setElements = useSetRecoilState(spaceElementsAtom);

    const [showSpace, setShowSpace] = useState(false);
    const name = useRecoilValue(userNameAtom);

    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            alert("You need to be logged in to access this page");
            navigate("/login");
        } else {
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
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
                console.log(data);
                if (data === null) {
                    alert("Space not found");
                    navigate("/");
                    return;
                }
                setSpaceName(data.name);
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
                navigate("/");
                return;
            }
            setAvatar(data);
        };
        getAvatar();
        getSpace();
        setIsLoading(false);
    }, [token, spaceId]);

    if (isLoading) {
        return <div className="w-screen flex justify-center items-center min-h-screen bg-gradient-to-b from-indigo-100 via-white to-white">
            <div className="text-white">Loading...</div>
        </div>
    }

    function handleClick() {
        if (!name) {
            alert("Please enter your name");
            return;
        } else {
            setShowSpace(true);
        }
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-indigo-300 via-white to-white w-screen">
                <SpaceInit spaceName={spaceName || ""} avatarUrl={avatar?.avatarUrl || ""} handleClick={handleClick} />
                {
                    showSpace &&  <WebSocketInit spaceId= {spaceId} token= {`${token}`} />
                }
               
            </div>
        </>
    )
}