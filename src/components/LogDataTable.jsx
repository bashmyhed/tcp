import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, ChevronUp, Search, Filter, Copy, ExternalLink } from 'lucide-react'
import { filterLogs, sortLogs, getSeverityInfo, formatNumber, debounce } from '../utils/dashboardUtils'

function LogDataTable({ logs, filters, onFiltersChange, onSortChange, sortConfig }) {
  const [expandedRow, setExpandedRow] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  
  // Debounced search update
  const debouncedSearch = useMemo(
    () => debounce((term) => {
      onFiltersChange({ ...filters, search: term })
      setCurrentPage(1) // Reset to first page on search
    }, 300),
    [filters, onFiltersChange]
  )
  
  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }
  
  // Process logs with current filters and sorting
  const processedLogs = useMemo(() => {
    const filtered = filterLogs(logs, filters)
    return sortLogs(filtered, sortConfig)
  }, [logs, filters, sortConfig])
  
  // Pagination
  const totalPages = Math.ceil(processedLogs.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedLogs = processedLogs.slice(startIndex, startIndex + pageSize)
  
  // Get unique agents for filter dropdown
  const uniqueAgents = useMemo(() => {
    const agents = new Set()
    logs.forEach(log => {
      const agent = log.agent?.name || log.host?.name || 'Unknown'
      agents.add(agent)
    })
    return Array.from(agents).sort()
  }, [logs])
  
  const handleSort = (field) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    onSortChange({ field, direction })
  }
  
  const handleCopyLog = async (log) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(log, null, 2))
      // Could show toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  const SortIcon = ({ field }) => {
    if (sortConfig.field !== field) {
      return <ChevronUp size={14} className="opacity-30" />
    }
    return sortConfig.direction === 'desc' ? 
      <ChevronDown size={14} /> : 
      <ChevronUp size={14} />
  }
  
  if (processedLogs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Security Events
        </h3>
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg mb-2">No events match your filters</div>
          <div className="text-sm">Try adjusting your search criteria</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header with Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Security Events
          </h3>
          <div className="text-sm text-gray-500">
            {formatNumber(processedLogs.length)} events
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Severity Filter */}
          <select
            value={filters.severity || 'all'}
            onChange={(e) => onFiltersChange({ ...filters, severity: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          {/* Agent Filter */}
          <select
            value={filters.agent || 'all'}
            onChange={(e) => onFiltersChange({ ...filters, agent: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Agents</option>
            {uniqueAgents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-4 py-3"></th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center gap-1">
                  Time
                  <SortIcon field="timestamp" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('severity')}
              >
                <div className="flex items-center gap-1">
                  Severity
                  <SortIcon field="severity" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('agent')}
              >
                <div className="flex items-center gap-1">
                  Agent
                  <SortIcon field="agent" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rule')}
              >
                <div className="flex items-center gap-1">
                  Rule Description
                  <SortIcon field="rule" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLogs.map((log, index) => {
              const globalIndex = startIndex + index
              const isExpanded = expandedRow === globalIndex
              const severityInfo = getSeverityInfo(log.level || 0)
              
              return (
                <React.Fragment key={globalIndex}>
                  {/* Main Row */}
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedRow(isExpanded ? null : globalIndex)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp || log['@timestamp']).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityInfo.color} ${severityInfo.textColor}`}>
                        {severityInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.agent?.name || log.host?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-md truncate">
                      {log.rule?.description || log.full_log || 'No description'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyLog(log)
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Copy log JSON"
                      >
                        <Copy size={16} />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 bg-gray-50">
                        <div className="space-y-4">
                          {/* Key Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
                              <dl className="space-y-1 text-sm">
                                <div>
                                  <dt className="text-gray-500 inline">Rule ID:</dt>
                                  <dd className="text-gray-900 inline ml-2">{log.rule?.id || 'N/A'}</dd>
                                </div>
                                <div>
                                  <dt className="text-gray-500 inline">Level:</dt>
                                  <dd className="text-gray-900 inline ml-2">{log.level || 0}</dd>
                                </div>
                                <div>
                                  <dt className="text-gray-500 inline">Location:</dt>
                                  <dd className="text-gray-900 inline ml-2">{log.location || 'N/A'}</dd>
                                </div>
                                {log.rule?.groups && (
                                  <div>
                                    <dt className="text-gray-500 inline">Groups:</dt>
                                    <dd className="text-gray-900 inline ml-2">
                                      {Array.isArray(log.rule.groups) ? log.rule.groups.join(', ') : log.rule.groups}
                                    </dd>
                                  </div>
                                )}
                              </dl>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Source Information</h4>
                              <dl className="space-y-1 text-sm">
                                {log.agent && (
                                  <>
                                    <div>
                                      <dt className="text-gray-500 inline">Agent:</dt>
                                      <dd className="text-gray-900 inline ml-2">{log.agent.name}</dd>
                                    </div>
                                    {log.agent.ip && (
                                      <div>
                                        <dt className="text-gray-500 inline">Agent IP:</dt>
                                        <dd className="text-gray-900 inline ml-2">{log.agent.ip}</dd>
                                      </div>
                                    )}
                                  </>
                                )}
                                {log.host && (
                                  <div>
                                    <dt className="text-gray-500 inline">Host:</dt>
                                    <dd className="text-gray-900 inline ml-2">{log.host.name}</dd>
                                  </div>
                                )}
                                {log.data?.srcip && (
                                  <div>
                                    <dt className="text-gray-500 inline">Source IP:</dt>
                                    <dd className="text-gray-900 inline ml-2">{log.data.srcip}</dd>
                                  </div>
                                )}
                              </dl>
                            </div>
                          </div>
                          
                          {/* Full Log Message */}
                          {log.full_log && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Raw Log</h4>
                              <pre className="bg-white p-3 rounded border text-xs text-gray-700 whitespace-pre-wrap break-words">
                                {log.full_log}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, processedLogs.length)} of {processedLogs.length} results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LogDataTable
