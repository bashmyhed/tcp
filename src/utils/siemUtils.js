// SIEM Log Utilities
// Functions for processing, formatting, and filtering SIEM log data

/**
 * Formats timestamps for display
 * @param {string} timestamp - ISO timestamp string
 * @param {string} format - 'short' | 'medium' | 'full'
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (timestamp, format = 'medium') => {
  if (!timestamp) return 'N/A'
  
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return 'Invalid Date'
  
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  switch (format) {
    case 'short':
      if (diffMins < 1) return 'just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    
    case 'medium':
      return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    
    case 'full':
      return date.toISOString()
    
    default:
      return date.toLocaleString()
  }
}

/**
 * Gets color class for severity level
 * @param {string|number} level - Severity level
 * @returns {string} Tailwind color class
 */
export const getSeverityColor = (level) => {
  const numLevel = typeof level === 'string' ? parseInt(level, 10) : level
  
  if (numLevel >= 10) return 'text-term-red' // Critical
  if (numLevel >= 7) return 'text-red-400'   // High
  if (numLevel >= 4) return 'text-yellow-400' // Medium
  if (numLevel >= 2) return 'text-blue-400'   // Low
  return 'text-white/60' // Info
}

/**
 * Gets human-readable severity label
 * @param {string|number} level - Severity level
 * @returns {string} Severity label
 */
export const getSeverityLabel = (level) => {
  const numLevel = typeof level === 'string' ? parseInt(level, 10) : level
  
  if (numLevel >= 10) return 'CRITICAL'
  if (numLevel >= 7) return 'HIGH'
  if (numLevel >= 4) return 'MEDIUM'
  if (numLevel >= 2) return 'LOW'
  return 'INFO'
}

/**
 * Highlights search terms in text - returns structured data for React rendering
 * @param {string} text - Text to highlight
 * @param {string} searchTerm - Search term to highlight
 * @returns {Array} Array of text parts with highlight info
 */
export const highlightSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return [{ text: text, highlight: false }]
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return parts
    .filter(part => part) // Remove empty strings
    .map((part, index) => ({
      text: part,
      highlight: regex.test(part),
      key: index
    }))
}

/**
 * Filters SIEM logs based on criteria
 * @param {Array} logs - Array of log objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered logs
 */
export const filterLogs = (logs, filters) => {
  if (!Array.isArray(logs)) return []
  
  return logs.filter(log => {
    // Severity filter
    if (filters.minSeverity !== undefined) {
      const logLevel = parseInt(log.level || 0, 10)
      if (logLevel < filters.minSeverity) return false
    }
    
    // Log type filter
    if (filters.logTypes && filters.logTypes.length > 0) {
      if (!filters.logTypes.includes(log.agent?.name || log.rule?.type || 'unknown')) {
        return false
      }
    }
    
    // Source filter
    if (filters.sources && filters.sources.length > 0) {
      const source = log.agent?.name || log.host?.name || 'unknown'
      if (!filters.sources.includes(source)) return false
    }
    
    // Time range filter
    if (filters.timeRange) {
      const logTime = new Date(log.timestamp || log['@timestamp'])
      if (isNaN(logTime.getTime())) return false
      
      const now = new Date()
      const timeDiff = now - logTime
      
      switch (filters.timeRange) {
        case '1h':
          if (timeDiff > 3600000) return false
          break
        case '24h':
          if (timeDiff > 86400000) return false
          break
        case '7d':
          if (timeDiff > 604800000) return false
          break
        case '30d':
          if (timeDiff > 2592000000) return false
          break
      }
    }
    
    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      const searchableText = [
        log.rule?.description,
        log.full_log,
        log.agent?.name,
        log.rule?.id,
        log.location
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (!searchableText.includes(searchLower)) return false
    }
    
    return true
  })
}

/**
 * Sorts SIEM logs
 * @param {Array} logs - Array of log objects
 * @param {string} sortBy - Sort field ('timestamp', 'severity', 'source')
 * @param {string} sortOrder - Sort order ('asc' | 'desc')
 * @returns {Array} Sorted logs
 */
export const sortLogs = (logs, sortBy = 'timestamp', sortOrder = 'desc') => {
  if (!Array.isArray(logs)) return []
  
  return [...logs].sort((a, b) => {
    let aVal, bVal
    
    switch (sortBy) {
      case 'timestamp':
        aVal = new Date(a.timestamp || a['@timestamp'] || 0)
        bVal = new Date(b.timestamp || b['@timestamp'] || 0)
        break
      
      case 'severity':
        aVal = parseInt(a.level || 0, 10)
        bVal = parseInt(b.level || 0, 10)
        break
        
      case 'source':
        aVal = (a.agent?.name || a.host?.name || 'unknown').toLowerCase()
        bVal = (b.agent?.name || b.host?.name || 'unknown').toLowerCase()
        break
        
      default:
        return 0
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Extracts unique values for filter options
 * @param {Array} logs - Array of log objects
 * @param {string} field - Field to extract ('sources', 'logTypes')
 * @returns {Array} Array of unique values
 */
export const extractFilterOptions = (logs, field) => {
  if (!Array.isArray(logs)) return []
  
  const values = new Set()
  
  logs.forEach(log => {
    let value
    switch (field) {
      case 'sources':
        value = log.agent?.name || log.host?.name || 'unknown'
        break
      case 'logTypes':
        value = log.agent?.name || log.rule?.type || 'unknown'
        break
      default:
        return
    }
    values.add(value)
  })
  
  return Array.from(values).sort()
}

/**
 * Exports logs to different formats
 * @param {Array} logs - Array of log objects
 * @param {string} format - Export format ('json' | 'csv' | 'txt')
 * @returns {string} Exported data
 */
export const exportLogs = (logs, format = 'json') => {
  if (!Array.isArray(logs)) return ''
  
  switch (format) {
    case 'json':
      return JSON.stringify(logs, null, 2)
    
    case 'csv':
      if (logs.length === 0) return ''
      
      const headers = ['timestamp', 'severity', 'source', 'rule_id', 'description', 'location']
      const rows = logs.map(log => [
        log.timestamp || log['@timestamp'] || '',
        log.level || '',
        log.agent?.name || log.host?.name || '',
        log.rule?.id || '',
        (log.rule?.description || '').replace(/"/g, '""'),
        (log.location || '').replace(/"/g, '""')
      ])
      
      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
    
    case 'txt':
      return logs.map(log => {
        const timestamp = formatTimestamp(log.timestamp || log['@timestamp'], 'medium')
        const severity = getSeverityLabel(log.level)
        const source = log.agent?.name || log.host?.name || 'unknown'
        const rule = log.rule?.id || 'N/A'
        const description = log.rule?.description || 'No description'
        
        return `[${timestamp}] ${severity} ${source} Rule:${rule} - ${description}`
      }).join('\n')
    
    default:
      return JSON.stringify(logs, null, 2)
  }
}
