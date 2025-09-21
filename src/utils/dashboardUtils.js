// SIEM Dashboard Utilities
// Helper functions for data processing, filtering, and visualization

/**
 * Get severity information including label, colors, and priority
 * @param {number} level - Severity level (0-15+)
 * @returns {Object} Severity info with label, colors, and priority
 */
export const getSeverityInfo = (level) => {
  const numLevel = typeof level === 'string' ? parseInt(level, 10) : level
  
  if (numLevel >= 12) {
    return { 
      label: 'Critical', 
      color: 'bg-red-500', 
      textColor: 'text-red-800',
      borderColor: 'border-red-500',
      chartColor: '#dc3545',
      priority: 4
    }
  }
  if (numLevel >= 7) {
    return { 
      label: 'High', 
      color: 'bg-orange-500', 
      textColor: 'text-orange-800',
      borderColor: 'border-orange-500',
      chartColor: '#fd7e14',
      priority: 3
    }
  }
  if (numLevel >= 4) {
    return { 
      label: 'Medium', 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      chartColor: '#ffc107',
      priority: 2
    }
  }
  return { 
    label: 'Low', 
    color: 'bg-blue-500', 
    textColor: 'text-blue-800',
    borderColor: 'border-blue-500',
    chartColor: '#17a2b8',
    priority: 1
  }
}

/**
 * Get confidence level information with colors and status
 * @param {number} confidence - Confidence score (0.0 to 1.0)
 * @returns {Object} Confidence info with status, colors, and message
 */
export const getConfidenceInfo = (confidence) => {
  const percentage = Math.round(confidence * 100)
  
  if (confidence >= 0.8) {
    return {
      status: 'high',
      label: 'High confidence',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      strokeColor: '#10b981',
      percentage,
      message: 'Query understood clearly'
    }
  }
  if (confidence >= 0.6) {
    return {
      status: 'medium',
      label: 'Medium confidence',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      strokeColor: '#f59e0b',
      percentage,
      message: 'Query mostly understood'
    }
  }
  return {
    status: 'low',
    label: 'Low confidence',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    strokeColor: '#ef4444',
    percentage,
    message: 'May need query refinement'
  }
}

/**
 * Group logs by hour for timeline visualization
 * @param {Array} logs - Array of log objects
 * @returns {Array} Array of hourly data points
 */
export const groupLogsByHour = (logs) => {
  if (!Array.isArray(logs)) return []
  
  const hourGroups = {}
  
  logs.forEach(log => {
    const timestamp = log.timestamp || log['@timestamp']
    if (!timestamp) return
    
    // Round down to the hour
    const date = new Date(timestamp)
    const hour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours())
    const hourKey = hour.toISOString()
    
    if (!hourGroups[hourKey]) {
      hourGroups[hourKey] = {
        hour: hourKey,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 0
      }
    }
    
    const severityInfo = getSeverityInfo(log.level || 0)
    const severityKey = severityInfo.label.toLowerCase()
    
    hourGroups[hourKey][severityKey]++
    hourGroups[hourKey].total++
  })
  
  // Convert to array and sort by hour
  return Object.values(hourGroups).sort((a, b) => new Date(a.hour) - new Date(b.hour))
}

/**
 * Get top agents by log count
 * @param {Array} logs - Array of log objects
 * @param {number} limit - Maximum number of agents to return
 * @returns {Array} Array of agent data sorted by count
 */
export const getTopAgents = (logs, limit = 10) => {
  if (!Array.isArray(logs)) return []
  
  const agentCounts = {}
  
  logs.forEach(log => {
    const agentName = log.agent?.name || log.host?.name || 'Unknown'
    const agentIp = log.agent?.ip || log.host?.ip || log.data?.srcip || 'N/A'
    
    if (!agentCounts[agentName]) {
      agentCounts[agentName] = {
        name: agentName,
        count: 0,
        ip: agentIp,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    }
    
    agentCounts[agentName].count++
    
    const severityInfo = getSeverityInfo(log.level || 0)
    const severityKey = severityInfo.label.toLowerCase()
    agentCounts[agentName][severityKey]++
  })
  
  // Convert to array, sort by count, and take top N
  return Object.values(agentCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Get rule categories for treemap visualization
 * @param {Array} logs - Array of log objects
 * @returns {Array} Array of category data for treemap
 */
export const getRuleCategories = (logs) => {
  if (!Array.isArray(logs)) return []
  
  const categories = {}
  
  logs.forEach(log => {
    // Use first group as category, fallback to 'uncategorized'
    const category = log.rule?.groups?.[0] || 'uncategorized'
    
    if (!categories[category]) {
      categories[category] = {
        name: category,
        count: 0,
        totalSeverity: 0,
        avgSeverity: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    }
    
    const level = log.level || 0
    categories[category].count++
    categories[category].totalSeverity += level
    
    const severityInfo = getSeverityInfo(level)
    const severityKey = severityInfo.label.toLowerCase()
    categories[category][severityKey]++
  })
  
  // Calculate average severity and add colors
  return Object.values(categories).map(category => {
    category.avgSeverity = category.totalSeverity / category.count
    category.color = getSeverityInfo(category.avgSeverity).chartColor
    return category
  }).sort((a, b) => b.count - a.count)
}

/**
 * Calculate summary statistics from logs
 * @param {Array} logs - Array of log objects
 * @returns {Object} Summary statistics
 */
export const calculateSummaryStats = (logs) => {
  if (!Array.isArray(logs)) {
    return {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      uniqueAgents: 0,
      uniqueRules: 0,
      timeRange: null
    }
  }
  
  const stats = {
    total: logs.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    uniqueAgents: new Set(),
    uniqueRules: new Set(),
    timestamps: []
  }
  
  logs.forEach(log => {
    // Count by severity
    const severityInfo = getSeverityInfo(log.level || 0)
    const severityKey = severityInfo.label.toLowerCase()
    stats[severityKey]++
    
    // Track unique agents and rules
    const agent = log.agent?.name || log.host?.name
    if (agent) stats.uniqueAgents.add(agent)
    
    const ruleId = log.rule?.id
    if (ruleId) stats.uniqueRules.add(ruleId)
    
    // Collect timestamps
    const timestamp = log.timestamp || log['@timestamp']
    if (timestamp) stats.timestamps.push(new Date(timestamp))
  })
  
  // Calculate time range
  if (stats.timestamps.length > 0) {
    stats.timestamps.sort((a, b) => a - b)
    stats.timeRange = {
      start: stats.timestamps[0],
      end: stats.timestamps[stats.timestamps.length - 1],
      duration: stats.timestamps[stats.timestamps.length - 1] - stats.timestamps[0]
    }
  }
  
  return {
    ...stats,
    uniqueAgents: stats.uniqueAgents.size,
    uniqueRules: stats.uniqueRules.size
  }
}

/**
 * Filter logs based on multiple criteria
 * @param {Array} logs - Array of log objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered logs
 */
export const filterLogs = (logs, filters) => {
  if (!Array.isArray(logs)) return []
  
  return logs.filter(log => {
    // Severity filter
    if (filters.severity && filters.severity !== 'all') {
      const severityInfo = getSeverityInfo(log.level || 0)
      if (severityInfo.label.toLowerCase() !== filters.severity) {
        return false
      }
    }
    
    // Agent filter
    if (filters.agent && filters.agent !== 'all') {
      const agent = log.agent?.name || log.host?.name || 'Unknown'
      if (agent !== filters.agent) {
        return false
      }
    }
    
    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      const searchableText = [
        log.rule?.description,
        log.full_log,
        log.agent?.name,
        log.host?.name,
        log.rule?.id,
        log.location
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (!searchableText.includes(searchLower)) {
        return false
      }
    }
    
    return true
  })
}

/**
 * Sort logs by specified field and direction
 * @param {Array} logs - Array of log objects
 * @param {Object} sortConfig - Sort configuration
 * @returns {Array} Sorted logs
 */
export const sortLogs = (logs, sortConfig) => {
  if (!Array.isArray(logs)) return []
  
  const { field, direction } = sortConfig
  
  return [...logs].sort((a, b) => {
    let aVal, bVal
    
    switch (field) {
      case 'timestamp':
        aVal = new Date(a.timestamp || a['@timestamp'] || 0)
        bVal = new Date(b.timestamp || b['@timestamp'] || 0)
        break
        
      case 'severity':
        aVal = parseInt(a.level || 0, 10)
        bVal = parseInt(b.level || 0, 10)
        break
        
      case 'agent':
        aVal = (a.agent?.name || a.host?.name || 'unknown').toLowerCase()
        bVal = (b.agent?.name || b.host?.name || 'unknown').toLowerCase()
        break
        
      case 'rule':
        aVal = (a.rule?.description || '').toLowerCase()
        bVal = (b.rule?.description || '').toLowerCase()
        break
        
      default:
        return 0
    }
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Format duration in human readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`
}

/**
 * Format large numbers with appropriate units
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  return `${(num / 1000000).toFixed(1)}M`
}

/**
 * Debounce function for search input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
