import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthPage } from "./components/ui/auth/page"
function App() {
  const token = localStorage.getItem("token")
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          token ? <h1>Welcome to Metaverse</h1> : <AuthPage />
        } />
        <Route path="/signup" element={<AuthPage signup={true} />} />
        <Route path="/login" element={<AuthPage signup={false} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
