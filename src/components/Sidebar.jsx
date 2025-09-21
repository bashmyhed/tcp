import { motion, AnimatePresence } from 'framer-motion'
import { Plus, PanelLeftClose, Settings } from 'lucide-react'

function Sidebar({ isOpen, onClose, chatSessions, activeSession, onSessionSelect, onNewChat, onReconfigure }) {
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  }

  const backdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ChatGPT-style left sidebar */}
          <motion.div
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 w-72 h-full bg-black/50 backdrop-blur-md border-r border-white/10 z-40 flex flex-col"
            id="history-sidebar"
            role="navigation"
            aria-label="Chat history sidebar"
          >
            {/* Header */}
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                {/* Close button in same position as open button */}
                <div className="h-8 w-8">
                  <button
                    onClick={onClose}
                    aria-label="Close sidebar (Ctrl+B)"
                    title="Close sidebar (Ctrl+B)"
                    className="h-8 w-8 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <PanelLeftClose size={18} />
                  </button>
                </div>
                <h2 className="text-xs uppercase tracking-wider text-white/60 flex-1">Sessions</h2>
              </div>
              
              {/* New Session (like ChatGPT) */}
              <button
                onClick={() => {
                  onNewChat && onNewChat()
                  onClose()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-white/15 text-white/90 hover:bg-white/10 hover:border-white/25 transition-colors text-sm"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-white text-black">
                  <Plus size={14} />
                </span>
                <span className="truncate">New session</span>
              </button>
            </div>

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {chatSessions.length === 0 ? (
                <div className="px-3 py-1.5 text-sm text-white/60">No sessions</div>
              ) : (
                chatSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => {
                      onSessionSelect(session.id)
                      onClose()
                    }}
                    aria-current={activeSession === session.id ? 'page' : undefined}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm truncate transition-colors ${
                      activeSession === session.id
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex-1 truncate">
                      <div className="truncate">{session.title}</div>
                      {session.session_info && (
                        <div className="text-xs text-white/40 truncate">
                          {session.session_info.username} • {session.chat_id ? session.chat_id.substring(0, 8) + '...' : 'No session'}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
            
            {/* Footer with reconfigure option */}
            <div className="border-t border-white/10 p-4">
              <button
                onClick={() => {
                  onReconfigure && onReconfigure()
                  onClose()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-white/15 text-white/90 hover:bg-white/10 hover:border-white/25 transition-colors text-sm"
              >
                <Settings size={16} />
                <span className="truncate">Reconfigure Wazuh</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
