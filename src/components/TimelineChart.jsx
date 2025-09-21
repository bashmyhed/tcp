import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { groupLogsByHour } from '../utils/dashboardUtils'

function TimelineChart({ logs }) {
  const chartData = useMemo(() => {
    return groupLogsByHour(logs)
  }, [logs])
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label)
      const formattedTime = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const total = payload.reduce((sum, entry) => sum + entry.value, 0)
      
      return (
        <div className="bg-gray-900 p-3 border border-gray-300 rounded-lg shadow-lg">
          <div className="font-medium text-white mb-2">
            {formattedTime}
          </div>
          <div className="space-y-1">
            {payload.reverse().map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {entry.dataKey}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  {entry.value}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-700 pt-1 mt-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Total
                </span>
                <span className="text-sm font-bold text-white">
                  {total}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }
  
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit'
    })
  }
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Timeline Analysis
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-lg mb-2">No timeline data available</div>
            <div className="text-sm">Logs need valid timestamps for timeline analysis</div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-transparent p-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Timeline Analysis
        </h3>
        <div className="text-sm text-gray-400">
          Events over time by severity
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <XAxis 
              dataKey="hour"
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px' }}
              iconType="rect"
            />
            
            {/* Stack areas by severity - order matters for visual layering */}
            <Area
              type="monotone"
              dataKey="low"
              stackId="1"
              stroke="#17a2b8"
              fill="#17a2b8"
              fillOpacity={0.7}
              name="Low"
            />
            <Area
              type="monotone"
              dataKey="medium"
              stackId="1"
              stroke="#ffc107"
              fill="#ffc107"
              fillOpacity={0.7}
              name="Medium"
            />
            <Area
              type="monotone"
              dataKey="high"
              stackId="1"
              stroke="#fd7e14"
              fill="#fd7e14"
              fillOpacity={0.7}
              name="High"
            />
            <Area
              type="monotone"
              dataKey="critical"
              stackId="1"
              stroke="#dc3545"
              fill="#dc3545"
              fillOpacity={0.7}
              name="Critical"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        Hover over the chart to see detailed breakdown for each time period
      </div>
    </div>
  )
}

export default TimelineChart
