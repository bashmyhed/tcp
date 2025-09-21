import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-ctp-base text-ctp-text font-mono">
        <Routes>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/" element={<Navigate to="/chat" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
