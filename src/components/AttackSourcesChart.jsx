import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getSeverityInfo } from '../utils/dashboardUtils'

const AttackSourcesChart = ({ logs, onSourceClick, selectedSource, theme = 'light' }) => {
  // Process attack sources data
  const attackSourcesData = useMemo(() => {
    if (!Array.isArray(logs)) return []

    const sourcesMap = {}

    logs.forEach(log => {
      // Only count actual attacks, not all logs
      if (!log.rule?.groups?.some(group => 
        ['attacks', 'malware', 'intrusion_detection', 'brute_force', 'sql_injection', 'privilege_escalation'].includes(group)
      )) return

      const sourceIP = log.data?.srcip
      if (!sourceIP) return

      if (!sourcesMap[sourceIP]) {
        sourcesMap[sourceIP] = {
          ip: sourceIP,
          count: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          // Simulate geolocation (in real app, this would come from GeoIP)
          country: getCountryFromIP(sourceIP),
          lastSeen: log.timestamp
        }
      }

      sourcesMap[sourceIP].count++
      
      const severityInfo = getSeverityInfo(log.level || 0)
      const severityKey = severityInfo.label.toLowerCase()
      sourcesMap[sourceIP][severityKey]++
      
      // Keep track of most recent activity
      if (new Date(log.timestamp) > new Date(sourcesMap[sourceIP].lastSeen)) {
        sourcesMap[sourceIP].lastSeen = log.timestamp
      }
    })

    return Object.values(sourcesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 attack sources
  }, [logs])

  // Simple IP to country mapping (in real app, use GeoIP database)
  function getCountryFromIP(ip) {
    const ipMappings = {
      '185.220.101.45': 'Germany',
      '91.240.118.172': 'Russia',
      '192.168.1.100': 'Internal',
      '203.0.113.45': 'Reserved',
      '198.51.100.23': 'Reserved',
      '172.16.0.150': 'Internal',
      '10.0.1.200': 'Internal',
      '45.33.32.156': 'United States'
    }
    return ipMappings[ip] || 'Unknown'
  }

  // Handle chart click
  const handleClick = (data) => {
    if (onSourceClick && data?.ip) {
      onSourceClick(data.ip)
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const lastSeen = new Date(data.lastSeen).toLocaleString()

      return (
        <div className="bg-black p-3 border border-white/20 shadow-lg">
          <p className="font-medium text-white">Attack Source: {label}</p>
          <p className="text-sm text-gray-400">Country: {data.country}</p>
          <p className="text-sm text-gray-400">Last Seen: {lastSeen}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="font-medium">Total Attacks:</span> {data.count}
            </p>
            {data.critical > 0 && (
              <p className="text-sm text-red-600">
                <span className="font-medium">Critical:</span> {data.critical}
              </p>
            )}
            {data.high > 0 && (
              <p className="text-sm text-orange-600">
                <span className="font-medium">High:</span> {data.high}
              </p>
            )}
            {data.medium > 0 && (
              <p className="text-sm text-yellow-600">
                <span className="font-medium">Medium:</span> {data.medium}
              </p>
            )}
            {data.low > 0 && (
              <p className="text-sm text-blue-600">
                <span className="font-medium">Low:</span> {data.low}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">Click to filter by this source</p>
        </div>
      )
    }
    return null
  }

  if (!attackSourcesData.length) {
    return (
      <div className="bg-transparent p-2">
        <h3 className="text-lg font-semibold text-white mb-4">
          Top Attack Sources
        </h3>
        <div className="text-center text-gray-400">
          <p>No attack sources detected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-transparent p-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Top Attack Sources
        </h3>
        {selectedSource && selectedSource !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filtered by:</span>
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
              {selectedSource}
            </span>
            <button
              onClick={() => onSourceClick && onSourceClick('all')}
              className="text-xs text-gray-400 hover:text-gray-700 underline"
              aria-label="Clear source filter"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={attackSourcesData}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              type="category"
              dataKey="ip"
              tick={{ fontSize: 11, fill: '#666' }}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[0, 3, 3, 0]}
              onClick={handleClick}
              style={{ cursor: 'pointer' }}
            >
              {attackSourcesData.map((entry, index) => {
                // Color by severity
                let color = '#3b82f6' // Default blue
                if (entry.critical > 0) color = '#dc3545'
                else if (entry.high > 0) color = '#fd7e14'
                else if (entry.medium > 0) color = '#ffc107'
                
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedSource === entry.ip ? '#1f2937' : color}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-400">Critical Severity</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span className="text-gray-400">High Severity</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-400">Medium Severity</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-400">Low/Other</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">
              {attackSourcesData.length}
            </div>
            <div className="text-xs text-gray-400">Unique Sources</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {attackSourcesData.reduce((sum, source) => sum + source.count, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Attacks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {attackSourcesData.reduce((sum, source) => sum + source.critical, 0)}
            </div>
            <div className="text-xs text-gray-400">Critical Events</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {new Set(attackSourcesData.map(s => s.country).filter(c => c !== 'Unknown')).size}
            </div>
            <div className="text-xs text-gray-400">Countries</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttackSourcesChart
