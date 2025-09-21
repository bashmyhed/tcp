import { useMemo } from 'react'
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getTopAgents } from '../utils/dashboardUtils'

function TopAgentsChart({ logs, onAgentClick, selectedAgent }) {
  const chartData = useMemo(() => {
    return getTopAgents(logs, 10)
  }, [logs])
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      return (
        <div className="bg-gray-900 p-3 border border-gray-300 rounded-lg shadow-lg">
          <div className="font-medium text-white mb-2">
            {data.name}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-400">Total Events:</span>
              <span className="text-sm font-medium text-white">{data.count}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-400">IP Address:</span>
              <span className="text-sm font-medium text-white">{data.ip}</span>
            </div>
            <div className="border-t border-gray-700 pt-1 mt-2">
              <div className="text-xs text-gray-400 mb-1">Severity Breakdown:</div>
              {data.critical > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-xs text-red-600">Critical:</span>
                  <span className="text-xs text-gray-700">{data.critical}</span>
                </div>
              )}
              {data.high > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-xs text-orange-600">High:</span>
                  <span className="text-xs text-gray-700">{data.high}</span>
                </div>
              )}
              {data.medium > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-xs text-yellow-600">Medium:</span>
                  <span className="text-xs text-gray-700">{data.medium}</span>
                </div>
              )}
              {data.low > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-xs text-blue-600">Low:</span>
                  <span className="text-xs text-gray-700">{data.low}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Click to filter by this agent
          </div>
        </div>
      )
    }
    return null
  }
  
  const handleClick = (data) => {
    if (onAgentClick) {
      // Toggle selection - if same agent clicked, clear selection
      const newSelection = selectedAgent === data.name ? 'all' : data.name
      onAgentClick(newSelection)
    }
  }
  
  const formatYAxis = (tickItem) => {
    // Truncate long agent names for the Y axis
    return tickItem.length > 15 ? tickItem.substring(0, 12) + '...' : tickItem
  }
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Top Agents
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-lg mb-2">No agent data available</div>
            <div className="text-sm">Logs need valid agent information</div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-transparent p-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Top Agents
        </h3>
        <div className="text-sm text-gray-400">
          Click bars to filter
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickFormatter={formatYAxis}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="#3b82f6"
              onClick={handleClick}
              style={{ cursor: 'pointer' }}
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Bar 
                  key={`cell-${index}`} 
                  fill={selectedAgent === entry.name ? '#1d4ed8' : '#3b82f6'}
                  style={{ 
                    opacity: selectedAgent === 'all' || selectedAgent === entry.name ? 1 : 0.5
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        {selectedAgent !== 'all' && (
          <span>
            Filtered by agent: <span className="font-medium">{selectedAgent}</span>.{' '}
            <button 
              onClick={() => onAgentClick('all')}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Clear filter
            </button>
          </span>
        )}
      </div>
    </div>
  )
}

export default TopAgentsChart
