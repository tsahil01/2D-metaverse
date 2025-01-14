import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthPage } from "./components/auth/page"
import { Dashboard } from "./components/dashboard/dashboard"

function App() {
  const token = localStorage.getItem("token")
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          token ? <Dashboard /> : <AuthPage />
        } />
        <Route path="/signup" element={<AuthPage signup={true} />} />
        <Route path="/login" element={<AuthPage signup={false} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
