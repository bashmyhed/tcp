import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Search, Download, ChevronDown } from 'lucide-react'
import { exportLogs, extractFilterOptions } from '../utils/siemUtils'

function LogFilters({ 
  logs, 
  filters, 
  onFiltersChange, 
  totalLogs, 
  filteredLogs,
  onExport 
}) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.searchText || '')
  
  // Update search input when filters change externally
  useEffect(() => {
    setSearchInput(filters.searchText || '')
  }, [filters.searchText])
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, searchText: searchInput })
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchInput])
  
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }
  
  const handleMultiSelectChange = (key, value, checked) => {
    const currentValues = filters[key] || []
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value)
    
    handleFilterChange(key, newValues)
  }
  
  const clearFilters = () => {
    setSearchInput('')
    onFiltersChange({
      minSeverity: undefined,
      timeRange: undefined,
      logTypes: [],
      sources: [],
      searchText: ''
    })
  }
  
  const hasActiveFilters = () => {
    return filters.minSeverity !== undefined ||
           filters.timeRange !== undefined ||
           (filters.logTypes && filters.logTypes.length > 0) ||
           (filters.sources && filters.sources.length > 0) ||
           (filters.searchText && filters.searchText.length > 0)
  }
  
  const handleExport = (format) => {
    if (onExport) {
      onExport(format)
    }
  }
  
  // Extract options for multi-selects
  const sourceOptions = extractFilterOptions(logs, 'sources')
  const logTypeOptions = extractFilterOptions(logs, 'logTypes')
  
  return (
    <div className="bg-black/40 border-b border-white/10 p-3 font-mono">
      {/* Filter header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1 rounded border transition-colors ${
              showFilters 
                ? 'border-white/30 bg-white/10 text-white' 
                : 'border-white/20 hover:border-white/30 text-white/80 hover:text-white'
            }`}
          >
            <Filter size={14} />
            <span className="text-sm">Filters</span>
            {hasActiveFilters() && (
              <div className="bg-blue-400 text-black rounded-full w-2 h-2" />
            )}
          </button>
          
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white transition-colors"
            >
              <X size={12} />
              Clear
            </button>
          )}
          
          {/* Log count */}
          <div className="text-sm text-white/60">
            {filteredLogs.toLocaleString()} of {totalLogs.toLocaleString()} logs
            {hasActiveFilters() && (
              <span className="text-blue-400 ml-1">(filtered)</span>
            )}
          </div>
        </div>
        
        {/* Export controls */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1 rounded border border-white/20 hover:border-white/30 text-white/80 hover:text-white transition-colors text-sm">
              <Download size={14} />
              <span>Export</span>
              <ChevronDown size={12} />
            </button>
            
            {/* Export dropdown */}
            <div className="absolute right-0 top-full mt-1 bg-black/90 border border-white/20 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="py-1 min-w-32">
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-3 py-1 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-3 py-1 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="w-full text-left px-3 py-1 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Text
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
        <input
          type="text"
          placeholder="Search logs (rule description, source, rule ID, location...)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full bg-black/60 border border-white/20 rounded pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      {/* Filter controls */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pt-3 border-t border-white/10">
              {/* Severity filter */}
              <div>
                <label className="block text-xs text-white/60 mb-2">Min Severity</label>
                <select
                  value={filters.minSeverity || ''}
                  onChange={(e) => handleFilterChange('minSeverity', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
                >
                  <option value="">All levels</option>
                  <option value="2">Low (2+)</option>
                  <option value="4">Medium (4+)</option>
                  <option value="7">High (7+)</option>
                  <option value="10">Critical (10+)</option>
                </select>
              </div>
              
              {/* Time range filter */}
              <div>
                <label className="block text-xs text-white/60 mb-2">Time Range</label>
                <select
                  value={filters.timeRange || ''}
                  onChange={(e) => handleFilterChange('timeRange', e.target.value || undefined)}
                  className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
                >
                  <option value="">All time</option>
                  <option value="1h">Last hour</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
              
              {/* Sources filter */}
              <div>
                <label className="block text-xs text-white/60 mb-2">Sources ({sourceOptions.length})</label>
                <div className="bg-black/60 border border-white/20 rounded px-3 py-2 max-h-24 overflow-y-auto">
                  {sourceOptions.length > 0 ? (
                    <div className="space-y-1">
                      {sourceOptions.slice(0, 8).map(source => (
                        <label key={source} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={(filters.sources || []).includes(source)}
                            onChange={(e) => handleMultiSelectChange('sources', source, e.target.checked)}
                            className="w-3 h-3 accent-blue-400"
                          />
                          <span className="text-white/80 truncate">{source}</span>
                        </label>
                      ))}
                      {sourceOptions.length > 8 && (
                        <div className="text-xs text-white/40">+{sourceOptions.length - 8} more...</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-white/40">No sources available</div>
                  )}
                </div>
              </div>
              
              {/* Log types filter */}
              <div>
                <label className="block text-xs text-white/60 mb-2">Types ({logTypeOptions.length})</label>
                <div className="bg-black/60 border border-white/20 rounded px-3 py-2 max-h-24 overflow-y-auto">
                  {logTypeOptions.length > 0 ? (
                    <div className="space-y-1">
                      {logTypeOptions.slice(0, 8).map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={(filters.logTypes || []).includes(type)}
                            onChange={(e) => handleMultiSelectChange('logTypes', type, e.target.checked)}
                            className="w-3 h-3 accent-blue-400"
                          />
                          <span className="text-white/80 truncate">{type}</span>
                        </label>
                      ))}
                      {logTypeOptions.length > 8 && (
                        <div className="text-xs text-white/40">+{logTypeOptions.length - 8} more...</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-white/40">No types available</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LogFilters
