import { useSetRecoilState } from "recoil";
import { Input } from "../ui/input";
import { userNameAtom } from "@/lib/atom/userNameAtom";

interface SpaceInitProps {
    spaceName: string;
    avatarUrl: string;
    handleClick: () => void;
}



export function SpaceInit({ spaceName, avatarUrl, handleClick }: SpaceInitProps) {
    const setName = useSetRecoilState(userNameAtom);

    return (
        <div className="flex flex-col gap-4 space-y-6 h-screen justify-center items-center mx-auto">
            <div className="text-3xl font-bold text-center">
                Welcome to {" "}
                <div className="text-3xl font-bold text-indigo-600 text-center">
                    {spaceName}
                </div>
            </div>
            <div className="flex flex-col max-w-lg mx-auto justify-center w-full gap-">
                <div
                    className="w-[32px] h-[64px] my-auto bg-no-repeat bg-[length:512px_64px] scale-150 mx-auto mb-9"
                    style={{
                        backgroundImage: `url(${avatarUrl})`,
                        backgroundPosition: "0px 0px",
                    }}
                ></div>
                <div className="grid w-full items-center gap-4 my-auto">
                    <div className="flex flex-col space-y-1.5">
                        <Input id="name" placeholder="Enter Your Name" className="p-6 bg-slate-300 font-bold text-center" onChange={(e) => setName(e.target.value)} />
                    </div>
                    <button className="inline-flex font-bold items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transform hover:-translate-y-0.5 transition-all duration-200"
                        onClick={handleClick}>
                        {"Join Space"}
                    </button>
                </div>
            </div>
        </div>
    )
}