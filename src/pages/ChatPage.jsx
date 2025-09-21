import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import Sidebar from '../components/Sidebar'

// Setup wizard states
const SETUP_STATES = {
  ASK_USERNAME: 'ask_username',
  ASK_PASSWORD: 'ask_password', 
  ASK_RULES_FILE: 'ask_rules_file',
  ASK_EXTEND_OR_NEW: 'ask_extend_or_new',
  ASK_WHICH_SESSION: 'ask_which_session',
  COMPLETED: 'completed'
}

// API endpoints (use Vite dev proxy in development)
const API_BASE = '/api'
const API_ENDPOINTS = {
  SESSIONS: `${API_BASE}/sessions`,
  QUERY: `${API_BASE}/query`
}

function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [setupState, setSetupState] = useState(SETUP_STATES.ASK_USERNAME)
  const [tempUsername, setTempUsername] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [isAwaitingFile, setIsAwaitingFile] = useState(false)
  const [hasOpenedFilePicker, setHasOpenedFilePicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [inputValue, setInputValue] = useState('')
  const [activeSession, setActiveSession] = useState('chat-1')
  const [chatSessions, setChatSessions] = useState([
    { id: 'chat-1', title: 'New Chat', messageCount: 0, chat_id: null, session_info: null },
  ])
  
  // Store all created sessions for reuse
  const [availableSessions, setAvailableSessions] = useState([])

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  // typing state for assistant-like output
  const typingRef = useRef({ active: false, targetId: null, fullText: '', index: 0, timer: null })

  // API functions
  const createSession = async (username, password, rulesData, chatName = 'Security Investigation') => {
    try {
      setIsLoading(true)
      console.log('Creating session with:', { username, chatName, rulesCount: Array.isArray(rulesData) ? rulesData.length : 'Not array' })
      
      const requestBody = {
        admin_username: username,
        admin_password: password,
        chat_name: chatName,
        rules: rulesData
      }
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2))
      
      const response = await fetch(API_ENDPOINTS.SESSIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', response.status, response.statusText)
      
      const result = await response.json()
      console.log('Response body:', result)
      
      if (response.ok && result.success) {
        return { success: true, chat_id: result.chat_id, message: result.message }
      } else {
        // Handle different error scenarios
        let errorMessage = 'Session creation failed'
        if (result.detail) {
          // Pydantic validation errors
          errorMessage = result.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
        } else if (result.error) {
          errorMessage = result.error
        } else if (!response.ok) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('API Error (createSession):', error)
      return { success: false, error: `Network error: ${error?.message || 'Unknown error'}` }
    } finally {
      setIsLoading(false)
    }
  }

  const sendQuery = async (query, chatId) => {
    try {
      setIsLoading(true)
      const response = await fetch(API_ENDPOINTS.QUERY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nl_query: query,
          chat_id: chatId
        })
      })
      
      const result = await response.json()
      if (result.success) {
        return { success: true, data: result }
      } else {
        return { success: false, error: result.error || 'Query failed' }
      }
    } catch (error) {
      console.error('Query Error (sendQuery):', error)
      return { success: false, error: `Network error: ${error?.message || 'Unknown error'}` }
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize setup or check for existing sessions
  useEffect(() => {
    const storedSessions = localStorage.getItem('availableSessions')
    if (storedSessions) {
      try {
        const sessions = JSON.parse(storedSessions)
        setAvailableSessions(sessions)
        
        if (sessions.length > 0) {
          // Ask if user wants to extend existing session or create new
          setSetupState(SETUP_STATES.ASK_EXTEND_OR_NEW)
          setMessages([{ 
            id: cryptoRandomId(), 
            type: 'system', 
            content: `Welcome back to Wazuh Terminal Chat!\n\nYou have ${sessions.length} existing session(s).\n\nType "extend" to use an existing session or "new" to create a new session:` 
          }])
          return
        }
      } catch (error) {
        localStorage.removeItem('availableSessions')
      }
    }
    
    // Start setup wizard for new user
    setMessages([{ 
      id: cryptoRandomId(), 
      type: 'system', 
      content: 'Welcome to Wazuh Terminal Chat.\nTo get started, I need to collect some configuration information.\n\nPlease enter your Wazuh username:' 
    }])
  }, [])

  // Auto-scroll to bottom when messages or typing update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-focus input when appropriate
  useEffect(() => {
    if (setupState === SETUP_STATES.COMPLETED || setupState === SETUP_STATES.ASK_USERNAME || setupState === SETUP_STATES.ASK_PASSWORD) {
      inputRef.current?.focus()
    }
  }, [setupState])

  // Auto-open file picker once when entering rules step
  useEffect(() => {
    if (setupState === SETUP_STATES.ASK_RULES_FILE && !hasOpenedFilePicker) {
      setHasOpenedFilePicker(true)
      setIsAwaitingFile(true)
      // Small delay to let the message render first
      setTimeout(() => {
        fileInputRef.current?.click()
      }, 500)
    }
  }, [setupState, hasOpenedFilePicker])

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) {
      addSystemMessage('No file selected. Please select a rules.json file.')
      return
    }
    
    if (!file.name.toLowerCase().endsWith('.json')) {
      addSystemMessage('Invalid file type. Please select a .json file.')
      return
    }
    
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target.result
        const rulesJson = JSON.parse(content) // Validate and parse JSON format
        
        console.log('Original rules JSON:', rulesJson)
        
        // Convert rules to the format expected by API (array of rule objects)
        let rulesData = []
        
        if (Array.isArray(rulesJson)) {
          // Already in array format
          rulesData = rulesJson
        } else if (rulesJson.rules && typeof rulesJson.rules === 'object') {
          // Nested structure - convert to array
          for (const [category, categoryRules] of Object.entries(rulesJson.rules)) {
            for (const [ruleName, ruleData] of Object.entries(categoryRules)) {
              rulesData.push({
                id: rulesData.length + 1, // Generate sequential IDs
                description: ruleData.description,
                type: category,
                level: ruleData.level,
                groups: ruleData.groups || []
              })
            }
          }
        } else {
          // Try to use as-is
          rulesData = rulesJson
        }
        
        // Ensure rules are an array; wrap single rule objects
        if (!Array.isArray(rulesData) && rulesData && typeof rulesData === 'object') {
          rulesData = [rulesData]
        }

        // Sanitize and keep only fields expected by API
        rulesData = (rulesData || []).map((r, idx) => ({
          id: r.id ?? (idx + 1),
          description: r.description,
          type: r.type,
          level: r.level,
          ...(r.groups ? { groups: r.groups } : {})
        }))

        console.log('Converted rules data (sanitized array):', rulesData)
        
        addSystemMessage('Creating Wazuh session...')
        
        // Create session via API
        const sessionResult = await createSession(tempUsername, tempPassword, rulesData)
        
        if (sessionResult.success) {
          // Session created successfully
          const newSession = {
            id: Date.now().toString(),
            username: tempUsername,
            password: tempPassword, // Store for extending sessions
            rulesData: rulesData,
            chat_id: sessionResult.chat_id,
            title: `${tempUsername}'s Session`,
            created_at: new Date().toISOString()
          }
          
          // Update available sessions
          const updatedSessions = [...availableSessions, newSession]
          setAvailableSessions(updatedSessions)
          localStorage.setItem('availableSessions', JSON.stringify(updatedSessions))
          
          // Update current chat session
          setChatSessions(prev => prev.map(session => 
            session.id === activeSession 
              ? { ...session, chat_id: sessionResult.chat_id, session_info: newSession }
              : session
          ))
          
          setSetupState(SETUP_STATES.COMPLETED)
          setIsAwaitingFile(false)
          setHasOpenedFilePicker(false)
          addSystemMessage(`✓ ${sessionResult.message}\nConnected as: ${tempUsername}\nSession ID: ${sessionResult.chat_id}\nReady for security analysis.`)
          
        } else {
          addSystemMessage(`❌ Session creation failed: ${sessionResult.error}\nPlease check your credentials and try again.`)
          // Stay in rules step to allow retry
          setIsAwaitingFile(false)
        }
        
      } catch (err) {
        addSystemMessage(`Invalid JSON file format: ${err.message}\nPlease select a valid rules.json file.`)
      }
    }
    reader.onerror = () => {
      addSystemMessage('Error reading file. Please try again.')
      setIsAwaitingFile(false)
    }
    reader.readAsText(file)
    
    // Reset file input value but don't toggle awaiting flag here
    e.target.value = ''
  }

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

  const cryptoRandomId = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

  const addSystemMessage = (content) => {
    setMessages(prev => [...prev, { id: cryptoRandomId(), type: 'system', content }])
  }

  const addUserMessage = (content) => {
    setMessages(prev => [...prev, { id: cryptoRandomId(), type: 'user', content }])
  }

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

  const handleReconfigure = () => {
    // Clear all sessions and restart setup
    localStorage.removeItem('availableSessions')
    setAvailableSessions([])
    setChatSessions([{ id: 'chat-1', title: 'New Chat', messageCount: 0, chat_id: null, session_info: null }])
    setActiveSession('chat-1')
    setSetupState(SETUP_STATES.ASK_USERNAME)
    setTempUsername('')
    setTempPassword('')
    setIsAwaitingFile(false)
    setHasOpenedFilePicker(false)
    setMessages([{ 
      id: cryptoRandomId(), 
      type: 'system', 
      content: 'All sessions cleared.\nPlease enter your Wazuh username:' 
    }])
  }

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`
    const newChat = { id: newChatId, title: 'New Chat', messageCount: 0, chat_id: null, session_info: null }
    
    setChatSessions(prev => [...prev, newChat])
    setActiveSession(newChatId)
    
    // Check if we have existing sessions to offer extension
    if (availableSessions.length > 0) {
      setSetupState(SETUP_STATES.ASK_EXTEND_OR_NEW)
      setMessages([{ 
        id: cryptoRandomId(), 
        type: 'system', 
        content: `New chat created!\n\nYou have ${availableSessions.length} existing session(s).\n\nType "extend" to use an existing session or "new" to create a new session:` 
      }])
    } else {
      setSetupState(SETUP_STATES.ASK_USERNAME)
      setMessages([{ 
        id: cryptoRandomId(), 
        type: 'system', 
        content: 'New chat created!\n\nPlease enter your Wazuh username:' 
      }])
    }
    
    // Reset temp states
    setTempUsername('')
    setTempPassword('')
    setIsAwaitingFile(false)
    setHasOpenedFilePicker(false)
  }

  const handleSessionSelect = (sessionId) => {
    const targetSession = chatSessions.find(s => s.id === sessionId)
    if (targetSession) {
      setActiveSession(sessionId)
      // Load messages for this session (could be stored in localStorage per session)
      // For now, just show a simple message
      if (targetSession.chat_id) {
        setMessages([{
          id: cryptoRandomId(),
          type: 'system',
          content: `Switched to ${targetSession.title}\nSession ID: ${targetSession.chat_id}\nReady for security analysis.`
        }])
        setSetupState(SETUP_STATES.COMPLETED)
      } else {
        setMessages([{
          id: cryptoRandomId(),
          type: 'system', 
          content: 'Switched to new chat. Please complete setup to begin analysis.'
        }])
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const text = inputValue.trim()
    setInputValue('')

    // Add user message
    addUserMessage(text)

    // Handle extend or new session choice
    if (setupState === SETUP_STATES.ASK_EXTEND_OR_NEW) {
      if (text.toLowerCase() === 'extend') {
        if (availableSessions.length === 1) {
          // Only one session, use it directly
          const session = availableSessions[0]
          setChatSessions(prev => prev.map(chat => 
            chat.id === activeSession 
              ? { ...chat, chat_id: session.chat_id, session_info: session, title: `${session.username}'s Chat` }
              : chat
          ))
          setSetupState(SETUP_STATES.COMPLETED)
          addSystemMessage(`✓ Using existing session for ${session.username}\nSession ID: ${session.chat_id}\nReady for security analysis.`)
        } else {
          // Multiple sessions, ask which one
          setSetupState(SETUP_STATES.ASK_WHICH_SESSION)
          let sessionList = availableSessions.map((session, index) => 
            `${index + 1}. ${session.username}'s Session (${session.chat_id.substring(0, 8)}...)`
          ).join('\n')
          addSystemMessage(`Select a session to extend:\n\n${sessionList}\n\nEnter the number (1-${availableSessions.length}):`)
        }
      } else if (text.toLowerCase() === 'new') {
        setSetupState(SETUP_STATES.ASK_USERNAME)
        addSystemMessage('Creating new session.\n\nPlease enter your Wazuh username:')
      } else {
        addSystemMessage('Please type "extend" to use an existing session or "new" to create a new session.')
      }
      return
    }

    // Handle session selection
    if (setupState === SETUP_STATES.ASK_WHICH_SESSION) {
      const sessionIndex = parseInt(text) - 1
      if (sessionIndex >= 0 && sessionIndex < availableSessions.length) {
        const session = availableSessions[sessionIndex]
        setChatSessions(prev => prev.map(chat => 
          chat.id === activeSession 
            ? { ...chat, chat_id: session.chat_id, session_info: session, title: `${session.username}'s Chat` }
            : chat
        ))
        setSetupState(SETUP_STATES.COMPLETED)
        addSystemMessage(`✓ Using ${session.username}'s session\nSession ID: ${session.chat_id}\nReady for security analysis.`)
      } else {
        addSystemMessage(`Invalid selection. Please enter a number between 1 and ${availableSessions.length}.`)
      }
      return
    }

    // Handle setup wizard
    if (setupState === SETUP_STATES.ASK_USERNAME) {
      setTempUsername(text)
      setSetupState(SETUP_STATES.ASK_PASSWORD)
      addSystemMessage(`Username set to: ${text}\n\nNow please enter your Wazuh password:`)
      return
    }
    
    if (setupState === SETUP_STATES.ASK_PASSWORD) {
      setTempPassword(text)
      setSetupState(SETUP_STATES.ASK_RULES_FILE)
      addSystemMessage('Password confirmed.\n\nNow I need your rules.json file.\nThe file picker will open automatically...')
      return
    }
    
    // If file picker is awaiting, remind user
    if (setupState === SETUP_STATES.ASK_RULES_FILE) {
      if (isAwaitingFile) {
        addSystemMessage('Please select your rules.json file using the file picker, or type "retry" to open it again.')
      } else if (text.toLowerCase() === 'retry') {
        addSystemMessage('Opening file picker...')
        setTimeout(() => fileInputRef.current?.click(), 500)
        setIsAwaitingFile(true)
      } else {
        addSystemMessage('Please use the file picker to select your rules.json file, or type "retry" to reopen it.')
      }
      return
    }

    // Normal chat mode - send actual query
    if (setupState === SETUP_STATES.COMPLETED) {
      const currentChatSession = chatSessions.find(s => s.id === activeSession)
      if (!currentChatSession?.chat_id) {
        addSystemMessage('❌ No active session found. Please restart the setup process.')
        return
      }

      addSystemMessage('Analyzing query...')
      const queryResult = await sendQuery(text, currentChatSession.chat_id)
      
      if (queryResult.success) {
        // Show raw JSON response for now
        startTyping(JSON.stringify(queryResult.data, null, 2))
      } else {
        addSystemMessage(`❌ Query failed: ${queryResult.error}`)
      }
    }
  }

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
              {isLoading && <span className="text-yellow-400 mr-2">[Loading...]</span>}
              <input
                ref={inputRef}
                type={setupState === SETUP_STATES.ASK_PASSWORD ? "password" : "text"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  setupState === SETUP_STATES.ASK_USERNAME ? 'Enter your Wazuh username...' :
                  setupState === SETUP_STATES.ASK_PASSWORD ? 'Enter your Wazuh password...' :
                  setupState === SETUP_STATES.ASK_RULES_FILE ? 'Use file picker above or type "retry"...' :
                  setupState === SETUP_STATES.ASK_EXTEND_OR_NEW ? 'Type "extend" or "new"...' :
                  setupState === SETUP_STATES.ASK_WHICH_SESSION ? 'Enter session number...' :
                  'Type a command and press Enter...'
                }
                className="flex-1 bg-transparent outline-none border-none text-white placeholder-white/40 caret-white"
                autoComplete="off"
                disabled={(setupState === SETUP_STATES.ASK_RULES_FILE && isAwaitingFile) || isLoading}
              />
            </div>
          </form>
          
          {/* Hidden file input for rules.json */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chatSessions={chatSessions}
        activeSession={activeSession}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onReconfigure={handleReconfigure}
      />
    </div>
  )
}

export default ChatPage
