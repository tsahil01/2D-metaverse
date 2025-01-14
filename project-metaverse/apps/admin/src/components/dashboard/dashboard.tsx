import { MainComponent } from "./main/mainComponent";
import { Navbar } from "../nav/navbar";

export function Dashboard() {
    return <>
        <main className="flex flex-col gap-10 h-screen container p-5 mx-auto">
            <Navbar />
            <MainComponent />
        </main>
    </>
}