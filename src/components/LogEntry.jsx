import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, Copy, ExternalLink } from 'lucide-react'
import { formatTimestamp, getSeverityColor, getSeverityLabel, highlightSearchTerm } from '../utils/siemUtils'

function LogEntry({ log, searchTerm, isExpanded, onToggleExpand, index }) {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)
  
  const handleCopyLog = async (data, type = 'full') => {
    let textToCopy = ''
    
    switch (type) {
      case 'rule':
        textToCopy = `${log.rule?.id || 'N/A'}: ${log.rule?.description || 'No description'}`
        break
      case 'source':
        textToCopy = log.agent?.name || log.host?.name || 'unknown'
        break
      case 'full':
      default:
        textToCopy = JSON.stringify(log, null, 2)
        break
    }
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setShowCopyFeedback(true)
      setTimeout(() => setShowCopyFeedback(false), 1000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  const timestamp = formatTimestamp(log.timestamp || log['@timestamp'], 'medium')
  const severityLevel = log.level || 0
  const severityLabel = getSeverityLabel(severityLevel)
  const severityColor = getSeverityColor(severityLevel)
  const source = log.agent?.name || log.host?.name || 'unknown'
  const ruleId = log.rule?.id || 'N/A'
  const description = log.rule?.description || log.full_log || 'No description available'
  
  const expandIcon = isExpanded ? ChevronDown : ChevronRight
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="border-b border-white/10 hover:bg-gray-900/5 transition-colors group"
    >
      {/* Main log line */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer font-mono text-sm"
        onClick={onToggleExpand}
      >
        {/* Expand icon */}
        <button className="text-white/60 hover:text-white transition-colors p-0.5">
          <ChevronRight 
            size={14} 
            className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>
        
        {/* Timestamp */}
        <div className="text-white/60 w-20 text-xs shrink-0">
          {formatTimestamp(log.timestamp || log['@timestamp'], 'short')}
        </div>
        
        {/* Severity badge */}
        <div className={`${severityColor} w-12 text-xs font-bold shrink-0 text-center`}>
          {severityLabel}
        </div>
        
        {/* Source */}
        <div className="text-blue-400 w-24 text-xs shrink-0 truncate">
          {highlightSearchTerm(source, searchTerm).map((part, idx) => 
            part.highlight ? (
              <span key={idx} className="bg-yellow-400 text-black px-0.5">{part.text}</span>
            ) : (
              <span key={idx}>{part.text}</span>
            )
          )}
        </div>
        
        {/* Rule ID */}
        <div className="text-cyan-400 w-16 text-xs shrink-0 truncate">
          {highlightSearchTerm(ruleId, searchTerm).map((part, idx) => 
            part.highlight ? (
              <span key={idx} className="bg-yellow-400 text-black px-0.5">{part.text}</span>
            ) : (
              <span key={idx}>{part.text}</span>
            )
          )}
        </div>
        
        {/* Description */}
        <div className="text-white flex-1 truncate">
          {highlightSearchTerm(description.slice(0, 120), searchTerm).map((part, idx) => 
            part.highlight ? (
              <span key={idx} className="bg-yellow-400 text-black px-0.5">{part.text}</span>
            ) : (
              <span key={idx}>{part.text}</span>
            )
          )}
          {description.length > 120 && '...'}
        </div>
        
        {/* Action buttons (show on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCopyLog(log, 'full')
            }}
            className="text-white/60 hover:text-white p-1 rounded transition-colors"
            title="Copy full log"
          >
            {showCopyFeedback ? (
              <span className="text-green-400 text-xs">✓</span>
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
      </div>
      
      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-black/20 p-4 mx-3 mb-2 rounded border border-white/10 font-mono text-xs">
              {/* Expanded header with full timestamp */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <span className="text-white/60">
                    {formatTimestamp(log.timestamp || log['@timestamp'], 'full')}
                  </span>
                  <span className={`${severityColor} font-bold`}>
                    Level {severityLevel} ({severityLabel})
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyLog(log, 'rule')}
                    className="text-white/60 hover:text-white px-2 py-1 rounded border border-white/20 transition-colors"
                    title="Copy rule info"
                  >
                    Copy Rule
                  </button>
                  <button
                    onClick={() => handleCopyLog(log, 'full')}
                    className="text-white/60 hover:text-white px-2 py-1 rounded border border-white/20 transition-colors"
                    title="Copy full JSON"
                  >
                    Copy All
                  </button>
                </div>
              </div>
              
              {/* Key-value pairs */}
              <div className="space-y-2">
                {[
                  { label: 'Rule ID', value: log.rule?.id },
                  { label: 'Rule Description', value: log.rule?.description },
                  { label: 'Source Agent', value: log.agent?.name },
                  { label: 'Host', value: log.host?.name },
                  { label: 'Location', value: log.location },
                  { label: 'Groups', value: Array.isArray(log.rule?.groups) ? log.rule.groups.join(', ') : log.rule?.groups },
                ].filter(item => item.value).map(({ label, value }) => (
                  <div key={label} className="flex">
                    <div className="text-white/60 w-32 shrink-0">{label}:</div>
                    <div className="text-white flex-1 break-words">
                      {highlightSearchTerm(value, searchTerm).map((part, idx) => 
                        part.highlight ? (
                          <span key={idx} className="bg-yellow-400 text-black px-0.5">{part.text}</span>
                        ) : (
                          <span key={idx}>{part.text}</span>
                        )
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Full log message if available */}
                {log.full_log && (
                  <div className="mt-4 p-3 bg-black/40 rounded border border-white/10">
                    <div className="text-white/60 text-xs mb-2">Raw Log:</div>
                    <div className="text-white whitespace-pre-wrap break-words text-xs leading-relaxed">
                      {highlightSearchTerm(log.full_log, searchTerm).map((part, idx) => 
                        part.highlight ? (
                          <span key={idx} className="bg-yellow-400 text-black px-0.5">{part.text}</span>
                        ) : (
                          <span key={idx}>{part.text}</span>
                        )
                      )}
                    </div>
                  </div>
                )}
                
                {/* Additional fields (decoder, predecoder, etc.) */}
                {Object.entries(log).filter(([key]) => 
                  !['timestamp', '@timestamp', 'rule', 'agent', 'host', 'level', 'location', 'full_log'].includes(key)
                ).length > 0 && (
                  <details className="mt-4">
                    <summary className="text-white/60 cursor-pointer hover:text-white text-xs">
                      Additional Fields ({Object.keys(log).length - 8}+)
                    </summary>
                    <div className="mt-2 p-3 bg-black/40 rounded border border-white/10 max-h-60 overflow-auto">
                      <pre className="text-xs text-white/80 whitespace-pre-wrap">
                        {JSON.stringify(
                          Object.fromEntries(
                            Object.entries(log).filter(([key]) => 
                              !['timestamp', '@timestamp', 'rule', 'agent', 'host', 'level', 'location', 'full_log'].includes(key)
                            )
                          ), 
                          null, 
                          2
                        )}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default LogEntry
