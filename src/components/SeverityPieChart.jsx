import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { calculateSummaryStats, getSeverityInfo } from '../utils/dashboardUtils'

function SeverityPieChart({ logs, onSeverityClick, selectedSeverity }) {
  const chartData = useMemo(() => {
    const stats = calculateSummaryStats(logs)
    
    return [
      { name: 'Critical', value: stats.critical, level: 'critical', color: '#dc3545' },
      { name: 'High', value: stats.high, level: 'high', color: '#fd7e14' },
      { name: 'Medium', value: stats.medium, level: 'medium', color: '#ffc107' },
      { name: 'Low', value: stats.low, level: 'low', color: '#17a2b8' },
    ].filter(item => item.value > 0) // Only show segments with data
  }, [logs])
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const total = chartData.reduce((sum, item) => sum + item.value, 0)
      const percentage = total > 0 ? Math.round((data.value / total) * 100) : 0
      
      return (
        <div className="bg-gray-900 p-3 border border-gray-300 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-sm" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium text-white">
              {data.name} Severity
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-400">Count:</span>
              <span className="text-sm font-medium text-white">{data.value}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-400">Percentage:</span>
              <span className="text-sm font-medium text-white">{percentage}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }
  
  const handleClick = (data) => {
    if (onSeverityClick) {
      // Toggle selection - if same severity clicked, clear selection
      const newSelection = selectedSeverity === data.level ? 'all' : data.level
      onSeverityClick(newSelection)
    }
  }
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    // Only show label if segment is large enough
    const total = chartData.reduce((sum, item) => sum + item.value, 0)
    const percentage = total > 0 ? (value / total) * 100 : 0
    
    if (percentage < 5) return null // Don't show labels for small segments
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {value}
      </text>
    )
  }
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Severity Distribution
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-lg mb-2">No severity data available</div>
            <div className="text-sm">All logs have unknown severity levels</div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-transparent p-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Severity Distribution
        </h3>
        <div className="text-sm text-gray-400">
          Click segments to filter
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={selectedSeverity === entry.level ? '#1f2937' : 'none'}
                  strokeWidth={selectedSeverity === entry.level ? 3 : 0}
                  style={{ 
                    filter: selectedSeverity === 'all' || selectedSeverity === entry.level 
                      ? 'none' 
                      : 'opacity(0.5)'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px' }}
              iconType="rect"
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        {selectedSeverity !== 'all' && (
          <span>
            Filtered by {selectedSeverity} severity. Click chart or{' '}
            <button 
              onClick={() => onSeverityClick('all')}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              clear filter
            </button>
          </span>
        )}
      </div>
    </div>
  )
}

export default SeverityPieChart
