import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './data/store'
import Home from './components/Home'
import Resume from './components/Resume'
import Admin from './components/Admin'

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  )
}

export default App
