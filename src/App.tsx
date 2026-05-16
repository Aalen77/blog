import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './data/store'
import Home from './components/Home'
import Resume from './components/Resume'
import Admin from './components/Admin'
import ProjectDetail from './components/ProjectDetail'
import Toast from './components/Toast'

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
        </Routes>
        <Toast />
      </StoreProvider>
    </BrowserRouter>
  )
}

export default App
