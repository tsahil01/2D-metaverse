import { Button } from "../ui/button";

export function Dashboard() {
    return <>
        Hello there
        <br />
        <br />
        {
            // localStorage.getItem("token")
           localStorage
        }
        <Button onClick={() => {
            localStorage.removeItem("token")
            window.location.reload()
        }}>Logout</Button>
    </>
}