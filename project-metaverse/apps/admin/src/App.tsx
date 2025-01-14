import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthPage } from "./components/auth/page"
import { Dashboard } from "./components/dashboard/dashboard"
import { Redirect } from "./components/redirect"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Redirect />} />
        <Route path="/signup" element={<AuthPage signup={true} />} />
        <Route path="/login" element={<AuthPage signup={false} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
