import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthPage } from "./components/auth/page"
import { Dashboard } from "./components/dashboard/dashboard"
import { Redirect } from "./components/redirect"
import { Navbar } from "./components/nav/navbar"
import { CreateMap } from "./components/create-map/create-map"
import { CreateElement } from "./components/add-element/add-element"
import { CreateAvatar } from "./components/add-avatar/add-avatar"

function App() {
  return (
    <main className="flex flex-col gap-10 h-screen container p-5 mx-auto">
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Redirect />} />
          <Route path="/signup" element={<AuthPage signup={true} />} />
          <Route path="/login" element={<AuthPage signup={false} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-map" element={<CreateMap />} />
          <Route path="/create-element" element={<CreateElement />} />
          <Route path="/create-avatar" element={<CreateAvatar />} />
        </Routes>
      </BrowserRouter>
    </main>
  )
}

export default App
