import { BACKEND_URL } from "@/lib/config";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { useRecoilState, useSetRecoilState } from "recoil";
import { avatarAtom } from "@/lib/atom/avatarAtom";
import { spaceElementsAtom } from "@/lib/atom/spaceElementsAtom";
import { dimensionsAtom } from "@/lib/atom/dimensionsAtom";
import { tokenAtom } from "@/lib/atom/tokenAtom";
import { userNameAtom } from "@/lib/atom/userNameAtom";

export function GettingSpace({ spaceId }: { spaceId: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [spaceName, setSpaceName] = useState<string | null>(null);

    const [token, setToken] = useRecoilState(tokenAtom);
    const [avatar, setAvatar] = useRecoilState(avatarAtom);
    const setDimensions = useSetRecoilState(dimensionsAtom);
    const setElements = useSetRecoilState(spaceElementsAtom);
    const setName = useSetRecoilState(userNameAtom);


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
                    window.location.href = "/";
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
                window.location.href = "/";
                return;
            }
            setAvatar(data);
        };
        getAvatar();
        getSpace();
        setIsLoading(false);
    }, [token, spaceId]);

    if (isLoading) {
        return <div className="h-screen w-screen bg-gray-800 flex justify-center items-center">
            <div className="text-white">Loading...</div>
        </div>
    }

    return (
        <>
            <div className="h-screen w-screen flex flex-col gap-4 space-y-6 justify-center items-center container mx-auto">
                <div className="text-3xl font-bold">
                    Welcome to `{spaceName}`
                </div>
                <div className="flex flex-row max-w-lg mx-auto justify-center w-full gap-10">
                    <div
                        className="w-[32px] h-[64px] my-auto bg-no-repeat bg-[length:512px_64px] scale-150 origin-top-left mx-auto mb-9"
                        style={{
                            backgroundImage: `url(${avatar?.avatarUrl})`,
                            backgroundPosition: "0px 0px",
                        }}
                    ></div>
                    <div className="grid w-full items-center gap-4 my-auto">
                        <div className="flex flex-col space-y-1.5">
                            <Input id="name" placeholder="Enter Your Name" onChange={(e) => setName(e.target.value)} />
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}