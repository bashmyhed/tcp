import { useState, useMemo, useCallback } from 'react'
import QueryStatusHeader from './QueryStatusHeader'
import SummaryMetricsGrid from './SummaryMetricsGrid'
import LogDataTable from './LogDataTable'
import TimelineChart from './TimelineChart'
import SeverityPieChart from './SeverityPieChart'
import TopAgentsChart from './TopAgentsChart'
import AttackSourcesChart from './AttackSourcesChart'
import RuleCategoriesTreemap from './RuleCategoriesTreemap'
import SecurityInsights from './SecurityInsights'
import EmptyStatePanel from './EmptyStatePanel'

function SIEMVisualizationDashboard({ data, onQueryRefine, originalQuery, theme = 'terminal-inline' }) {
  // Filter and sort state
  const [filters, setFilters] = useState({
    severity: 'all',
    agent: 'all',
    search: '',
    attackSource: 'all',
    category: 'all'
  })
  
  const [sortConfig, setSortConfig] = useState({
    field: 'timestamp',
    direction: 'desc'
  })
  
  // Extract logs from the data structure
  const logs = useMemo(() => {
    return data?.data?.logs || []
  }, [data])
  
  // Check if we have logs to display
  const hasLogs = data?.data?.has_logs && logs.length > 0
  
  // Handle chart interactions for filtering
  const handleSeverityClick = useCallback((severity) => {
    setFilters(prev => ({ ...prev, severity }))
  }, [])
  
  const handleAgentClick = useCallback((agent) => {
    setFilters(prev => ({ ...prev, agent }))
  }, [])
  
  const handleAttackSourceClick = useCallback((source) => {
    setFilters(prev => ({ ...prev, attackSource: source }))
  }, [])
  
  const handleCategoryClick = useCallback((category) => {
    setFilters(prev => ({ ...prev, category }))
  }, [])
  
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])
  
  const handleSortChange = useCallback((newSortConfig) => {
    setSortConfig(newSortConfig)
  }, [])
  
  // If no data or error state
  if (!data || !data.success) {
    return (
      <div className="space-y-6">
        <div className="bg-black border border-white/20 p-6 text-center">
          <div className="text-xl text-gray-400 mb-2">Error loading dashboard</div>
          <div className="text-sm text-gray-400">
            {data?.error || 'An unexpected error occurred'}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4" role="main" aria-label="SIEM Dashboard">
      {/* Query Status Header - Always shown */}
      <QueryStatusHeader 
        data={data} 
        originalQuery={originalQuery}
      />
      
      {/* Conditional rendering based on whether we have logs */}
      {hasLogs ? (
        <>
          {/* Summary Metrics Grid */}
          <div role="region" aria-label="Summary Metrics">
            <SummaryMetricsGrid logs={logs} />
          </div>
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Timeline Chart */}
            <div role="region" aria-label="Timeline Analysis">
              <TimelineChart logs={logs} />
            </div>
            
            {/* Severity Distribution */}
            <div role="region" aria-label="Severity Distribution">
              <SeverityPieChart 
                logs={logs}
                onSeverityClick={handleSeverityClick}
                selectedSeverity={filters.severity}
              />
            </div>
            
            {/* Top Agents Chart */}
            <div role="region" aria-label="Top Agents" className="lg:col-span-2">
              <TopAgentsChart
                logs={logs}
                onAgentClick={handleAgentClick}
                selectedAgent={filters.agent}
              />
            </div>
          </div>
          
          {/* Security Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Attack Sources */}
            <div role="region" aria-label="Attack Sources Analysis">
              <AttackSourcesChart
                logs={logs}
                onSourceClick={handleAttackSourceClick}
                selectedSource={filters.attackSource}
              />
            </div>
            
            {/* Rule Categories Treemap */}
            <div role="region" aria-label="Rule Categories">
              <RuleCategoriesTreemap
                logs={logs}
                onCategoryClick={handleCategoryClick}
                selectedCategory={filters.category}
              />
            </div>
          </div>
          
          {/* Security Insights */}
          <div role="region" aria-label="Security Intelligence">
            <SecurityInsights logs={logs} />
          </div>
          
          {/* Interactive Data Table */}
          <div role="region" aria-label="Security Events Table">
            <LogDataTable
              logs={logs}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSortChange={handleSortChange}
              sortConfig={sortConfig}
            />
          </div>
          
          {/* Live region for screen readers to announce filter changes */}
          <div 
            className="sr-only" 
            role="status" 
            aria-live="polite" 
            aria-atomic="true"
          >
            {filters.severity !== 'all' && `Filtered by ${filters.severity} severity. `}
            {filters.agent !== 'all' && `Filtered by agent ${filters.agent}. `}
            {filters.attackSource !== 'all' && `Filtered by attack source ${filters.attackSource}. `}
            {filters.category !== 'all' && `Filtered by category ${filters.category}. `}
            {filters.search && `Searching for ${filters.search}. `}
          </div>
        </>
      ) : (
        /* Empty State Panel */
        <div role="region" aria-label="No Results">
          <EmptyStatePanel 
            data={data}
            originalQuery={originalQuery}
            onQueryRefine={onQueryRefine}
          />
        </div>
      )}
      
      {/* Keyboard shortcuts info (hidden but available for screen readers) */}
      <div className="sr-only">
        <h2>Dashboard Keyboard Shortcuts</h2>
        <ul>
          <li>Tab: Navigate between interactive elements</li>
          <li>Enter or Space: Activate buttons and chart elements</li>
          <li>Arrow keys: Navigate within charts when focused</li>
          <li>Escape: Clear filters or close expanded elements</li>
        </ul>
      </div>
    </div>
  )
}

export default SIEMVisualizationDashboard
