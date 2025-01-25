import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthPage } from "./components/auth/page"
import { Home } from "./components/home"
import { Dashboard } from "./components/dashboard/dashboard"
import { CreateNewSpace } from "./components/new-space/create-new-space"
import { MapViaId } from "./components/new-space/new-space-via-mapId"
import { NewEmptySpace } from "./components/new-space/new-empty-space"
import { SpaceMain } from "./components/space/main"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<AuthPage signup={true} />} />
        <Route path="/login" element={<AuthPage signup={false} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-space" element={<CreateNewSpace />} />
        <Route path="/new-space/create" element={<NewEmptySpace />} />
        <Route path="/new-space/:mapId" element={<MapViaId id={window.location.pathname.split("/").pop() || ""} />} />
        <Route path="/space/:spaceId" element={<SpaceMain spaceId={window.location.pathname.split("/").pop() || ""} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
