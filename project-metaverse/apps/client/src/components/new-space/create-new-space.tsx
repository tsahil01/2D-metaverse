import { Navbar } from "../nav/navbar";
import { NewSpaceCard } from "./new-space";


export function CreateNewSpace() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
            <header className="relative overflow-hidden">
                <Navbar />
                <div className="container mx-auto px-4 flex flex-row gap-2 lg:px-8">
                    <NewSpaceCard />
                </div>
            </header>
        </div>
    );
}