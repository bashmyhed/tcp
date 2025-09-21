import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, RotateCcw, AlertTriangle, Database } from 'lucide-react'
import LogEntry from './LogEntry'
import LogFilters from './LogFilters'
import { filterLogs, sortLogs, exportLogs } from '../utils/siemUtils'

function LogViewer({ logs = [], searchTerm = '', onStatusChange }) {
  const [filters, setFilters] = useState({
    minSeverity: undefined,
    timeRange: undefined,
    logTypes: [],
    sources: [],
    searchText: searchTerm
  })
  const [sortBy, setSortBy] = useState('timestamp')
  const [sortOrder, setSortOrder] = useState('desc')
  const [expandedLogs, setExpandedLogs] = useState(new Set())
  const [isVirtualized, setIsVirtualized] = useState(true)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 })
  
  const containerRef = useRef(null)
  const [containerHeight, setContainerHeight] = useState(600)
  
  // Sync external search term with internal filters
  useEffect(() => {
    setFilters(prev => ({ ...prev, searchText: searchTerm }))
  }, [searchTerm])
  
  // Process logs: filter then sort
  const filteredLogs = filterLogs(logs, filters)
  const sortedLogs = sortLogs(filteredLogs, sortBy, sortOrder)
  
  // Notify parent of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({
        total: logs.length,
        filtered: filteredLogs.length,
        displayed: isVirtualized ? Math.min(visibleRange.end - visibleRange.start, filteredLogs.length) : filteredLogs.length
      })
    }
  }, [logs.length, filteredLogs.length, visibleRange, isVirtualized, onStatusChange])
  
  // Container height observer for virtualization
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerHeight(rect.height)
      }
    }
    
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])
  
  // Virtual scrolling logic
  const ITEM_HEIGHT = 48 // Approximate height per log entry
  const BUFFER_SIZE = 10  // Extra items to render above/below viewport
  
  const updateVisibleRange = useCallback(() => {
    if (!isVirtualized || !containerRef.current) return
    
    const scrollTop = containerRef.current.scrollTop
    const viewportHeight = containerRef.current.clientHeight
    
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
    const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT)
    const end = Math.min(sortedLogs.length, start + visibleCount + (BUFFER_SIZE * 2))
    
    setVisibleRange({ start, end })
  }, [isVirtualized, sortedLogs.length])
  
  // Handle scroll for virtualization
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isVirtualized) return
    
    const handleScroll = () => updateVisibleRange()
    container.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial calculation
    updateVisibleRange()
    
    return () => container.removeEventListener('scroll', handleScroll)
  }, [updateVisibleRange, isVirtualized])
  
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(newSortBy)
      setSortOrder(newSortBy === 'timestamp' ? 'desc' : 'asc')
    }
  }
  
  const handleToggleExpand = (index) => {
    const logIndex = isVirtualized ? visibleRange.start + index : index
    setExpandedLogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(logIndex)) {
        newSet.delete(logIndex)
      } else {
        newSet.add(logIndex)
      }
      return newSet
    })
  }
  
  const handleExpandAll = () => {
    if (sortedLogs.length > 100) {
      // Safety check for performance
      const confirmed = confirm(`This will expand ${sortedLogs.length} log entries. This might affect performance. Continue?`)
      if (!confirmed) return
    }
    
    const allIndices = new Set(Array.from({ length: sortedLogs.length }, (_, i) => i))
    setExpandedLogs(allIndices)
  }
  
  const handleCollapseAll = () => {
    setExpandedLogs(new Set())
  }
  
  const handleExport = (format) => {
    try {
      const dataToExport = isVirtualized ? sortedLogs : sortedLogs
      const exportData = exportLogs(dataToExport, format)
      
      // Create and trigger download
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv' : format === 'json' ? 'application/json' : 'text/plain' 
      })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `siem-logs-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }
  
  // Determine which logs to render
  const logsToRender = isVirtualized 
    ? sortedLogs.slice(visibleRange.start, visibleRange.end)
    : sortedLogs
  
  const totalHeight = isVirtualized ? sortedLogs.length * ITEM_HEIGHT : 'auto'
  const offsetY = isVirtualized ? visibleRange.start * ITEM_HEIGHT : 0
  
  if (!Array.isArray(logs) || logs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black/20 border border-white/10 rounded">
        <div className="text-center text-white/60 font-mono">
          <Database size={48} className="mx-auto mb-4 opacity-50" />
          <div className="text-lg mb-2">No SIEM logs available</div>
          <div className="text-sm">Query results will appear here</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col bg-black/20 border border-white/10 rounded overflow-hidden">
      {/* Filters */}
      <LogFilters
        logs={logs}
        filters={filters}
        onFiltersChange={setFilters}
        totalLogs={logs.length}
        filteredLogs={filteredLogs.length}
        onExport={handleExport}
      />
      
      {/* Controls bar */}
      <div className="bg-black/40 border-b border-white/10 px-3 py-2 flex items-center justify-between font-mono text-sm">
        <div className="flex items-center gap-4">
          {/* Sort controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/60">Sort by:</span>
            {['timestamp', 'severity', 'source'].map((field) => (
              <button
                key={field}
                onClick={() => handleSortChange(field)}
                className={`px-2 py-1 rounded transition-colors ${
                  sortBy === field 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {sortBy === field && (
                  sortOrder === 'desc' ? <ChevronDown size={12} className="inline ml-1" /> : <ChevronUp size={12} className="inline ml-1" />
                )}
              </button>
            ))}
          </div>
          
          {/* Expand/collapse controls */}
          <div className="flex items-center gap-2 text-xs border-l border-white/10 pl-4">
            <button
              onClick={handleExpandAll}
              className="text-white/60 hover:text-white transition-colors"
              disabled={sortedLogs.length > 1000}
            >
              Expand All
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={handleCollapseAll}
              className="text-white/60 hover:text-white transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
        
        {/* Performance controls */}
        <div className="flex items-center gap-4 text-xs">
          {sortedLogs.length > 100 && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-white/60">
                <input
                  type="checkbox"
                  checked={isVirtualized}
                  onChange={(e) => setIsVirtualized(e.target.checked)}
                  className="w-3 h-3 accent-blue-400"
                />
                Virtual scrolling
              </label>
            </div>
          )}
          
          {filteredLogs.length !== logs.length && (
            <div className="flex items-center gap-1 text-yellow-400">
              <AlertTriangle size={12} />
              <span>{logs.length - filteredLogs.length} filtered</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Log entries */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{ height: isVirtualized ? containerHeight : 'auto' }}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-white/60 font-mono text-sm">
            <div className="text-center">
              <AlertTriangle size={24} className="mx-auto mb-2 opacity-50" />
              <div>No logs match the current filters</div>
              <button
                onClick={() => setFilters({
                  minSeverity: undefined,
                  timeRange: undefined,
                  logTypes: [],
                  sources: [],
                  searchText: ''
                })}
                className="mt-2 text-blue-400 hover:text-blue-300 underline"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              <AnimatePresence mode="popLayout">
                {logsToRender.map((log, index) => {
                  const globalIndex = isVirtualized ? visibleRange.start + index : index
                  return (
                    <LogEntry
                      key={`${log.id || globalIndex}-${globalIndex}`}
                      log={log}
                      searchTerm={filters.searchText}
                      isExpanded={expandedLogs.has(globalIndex)}
                      onToggleExpand={() => handleToggleExpand(index)}
                      index={index}
                    />
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with stats */}
      {filteredLogs.length > 0 && (
        <div className="bg-black/40 border-t border-white/10 px-3 py-2 flex items-center justify-between text-xs font-mono text-white/60">
          <div>
            Showing {isVirtualized ? `${visibleRange.start + 1}-${Math.min(visibleRange.end, filteredLogs.length)}` : 'all'} of {filteredLogs.length.toLocaleString()} logs
            {logs.length !== filteredLogs.length && <span className="text-yellow-400"> (filtered from {logs.length.toLocaleString()})</span>}
          </div>
          
          <div className="flex items-center gap-4">
            <div>{expandedLogs.size} expanded</div>
            {isVirtualized && <div className="text-green-400">Virtual scrolling enabled</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default LogViewer
