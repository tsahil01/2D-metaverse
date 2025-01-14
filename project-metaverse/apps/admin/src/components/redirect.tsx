export function Redirect() {
    const token = localStorage.getItem("token")
    return (
        <>
            {
                token ? window.location.href = "/dashboard" : window.location.href = "/login"
            }
        </>


    )
}