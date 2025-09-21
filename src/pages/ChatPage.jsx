import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import Sidebar from '../components/Sidebar'

function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, type: 'system', content: 'Terminal Chat ready.' },
  ])

  const [inputValue, setInputValue] = useState('')
  const [activeSession, setActiveSession] = useState('session-1')
  const [chatSessions] = useState([
    { id: 'session-1', title: 'General', messageCount: 1 },
    { id: 'session-2', title: 'Notes', messageCount: 0 },
    { id: 'session-3', title: 'Ideas', messageCount: 0 },
  ])

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // typing state for assistant-like output
  const typingRef = useRef({ active: false, targetId: null, fullText: '', index: 0, timer: null })

  // Auto-scroll to bottom when messages or typing update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Keyboard shortcut for toggling sidebar (Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    return () => {
      if (typingRef.current.timer) clearInterval(typingRef.current.timer)
    }
  }, [])

  const startTyping = (text) => {
    const id = cryptoRandomId()
    // Insert an assistant message placeholder
    setMessages(prev => [...prev, { id, type: 'assistant', content: '' }])

    typingRef.current = { active: true, targetId: id, fullText: text, index: 0, timer: null }

    const speedMs = 12 // typing speed per char
    typingRef.current.timer = setInterval(() => {
      typingRef.current.index += 1
      const next = typingRef.current.fullText.slice(0, typingRef.current.index)

      setMessages(prev => prev.map(m => m.id === id ? { ...m, content: next } : m))
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })

      if (typingRef.current.index >= typingRef.current.fullText.length) {
        clearInterval(typingRef.current.timer)
        typingRef.current.active = false
      }
    }, speedMs)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const text = inputValue
    setInputValue('')

    // Echo the user command (prefixed with >)
    setMessages(prev => [
      ...prev,
      { id: cryptoRandomId(), type: 'user', content: text },
    ])

    // Simulate assistant terminal output with typing animation
    startTyping(`You entered: ${text}\nProcessing...\nDone.`)
  }

  const cryptoRandomId = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

  return (
    <div className={`h-screen bg-black text-white flex flex-col font-mono transition-all duration-300 ease-out ${sidebarOpen ? 'pl-72' : 'pl-0'}`}>
      {/* Header with contextual toggle */}
      <div className="bg-black p-3 flex items-center gap-3">
        {/* Reserved space for toggle button - keeps layout stable */}
        <div className="h-8 w-8">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="h-8 w-8 rounded-md bg-black/60 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Open sidebar (Ctrl+B)"
              aria-controls="history-sidebar"
              title="Open sidebar (Ctrl+B)"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>
        <div className="text-sm text-white/70 truncate flex-1">{activeSession}</div>
      </div>

      {/* Terminal Output + Input (input sits under last response; at top if empty) */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-2">
          {messages.map((m) => (
            <motion.pre
              key={m.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.12 }}
              className="whitespace-pre-wrap break-words leading-6"
            >
              {m.type === 'user' ? (
                <span>
                  <span className="text-white">&gt; </span>
                  <span>{m.content}</span>
                </span>
              ) : m.type === 'system' ? (
                <span className="text-white/60">{m.content}</span>
              ) : (
                <span>{m.content}</span>
              )}
              {m.type === 'assistant' && typingRef.current.active && typingRef.current.targetId === m.id ? (
                <span className="inline-block w-2 ml-0.5 bg-white animate-pulse" style={{ height: '1.1em' }} />
              ) : null}
            </motion.pre>
          ))}

          {/* Input Line under last message */}
          <form onSubmit={handleSubmit} className="pt-2">
            <div className="flex items-center">
              <span className="text-white mr-2">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={messages.length ? 'type a command and press Enter' : 'Start typing to begin a new chat...'}
                className="flex-1 bg-transparent outline-none border-none text-white placeholder-white/40 caret-white"
                autoComplete="off"
              />
            </div>
          </form>
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chatSessions={chatSessions}
        activeSession={activeSession}
        onSessionSelect={setActiveSession}
      />
    </div>
  )
}

export default ChatPage
