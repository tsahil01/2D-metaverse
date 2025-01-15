import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthPage } from "./components/auth/page"
import { Home } from "./components/home"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<AuthPage signup={true} />} />
        <Route path="/login" element={<AuthPage signup={false} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
