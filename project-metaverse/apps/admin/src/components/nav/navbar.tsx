import { LockKeyhole } from 'lucide-react';
import { Button } from "../ui/button";


export function Navbar() {

    return (
        <nav className="flex flex-col lg:flex-row justify-between p-4 rounded-2xl border bg-primary/5 shadow-lg top-0 z-50">
            <div className="flex flex-row justify-between items-center w-full lg:w-auto">
                <div className="flex items-center gap-2">
                    <LockKeyhole className="h-8 w-8 my-auto" />
                    <span className="text-xl font-bold my-auto">
                        Admin Portal
                    </span>
                </div>
            </div>

            <div className="hidden lg:flex flex-row items-center gap-4 mt-4 lg:mt-0">
                <Button variant={"outline"} className="flex-row gap-2 text-white"
                    onClick={() => {
                        localStorage.removeItem("token")
                        window.location.href = "/"
                    }}>
                    Logout
                </Button>
            </div>
        </nav>
    );
}

