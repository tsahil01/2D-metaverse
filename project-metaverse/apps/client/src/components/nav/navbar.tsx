import { Globe2 } from "lucide-react";

export function Navbar() {
    const token = localStorage.getItem("token");

    return (
        <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Globe2 className="h-8 w-8 text-indigo-600" />
                    <span className="text-2xl font-bold text-gray-900">VirtualMeet</span>
                </div>
               
                <button
                onClick={() => {
                    if (token) {
                        localStorage.removeItem("token");
                        window.location.href = "/";
                    } else {
                        window.location.href = "/login";
                    }
                }}
                 className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors">
                    {token ? "Logout" : "Login"}
                </button>
            </div>
        </nav>
    )
}