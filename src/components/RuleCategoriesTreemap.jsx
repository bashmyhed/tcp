import { useMemo } from 'react'
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { getRuleCategories, getSeverityInfo } from '../utils/dashboardUtils'

const RuleCategoriesTreemap = ({ logs, onCategoryClick, selectedCategory, theme = 'light' }) => {
  // Process rule categories data
  const categoriesData = useMemo(() => {
    const categories = getRuleCategories(logs)
    
    return categories.map((category, index) => ({
      ...category,
      // Normalize name for display
      displayName: category.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      // Calculate percentage of total
      percentage: logs.length > 0 ? ((category.count / logs.length) * 100).toFixed(1) : 0,
      // Color based on severity and category type
      fill: getCategoryColor(category.name, category.avgSeverity),
      opacity: selectedCategory && selectedCategory !== 'all' && selectedCategory !== category.name ? 0.3 : 1
    }))
  }, [logs, selectedCategory])

  // Category-specific colors with severity influence
  function getCategoryColor(categoryName, avgSeverity) {
    const baseColors = {
      'attacks': '#dc3545',           // Red - Direct attacks
      'malware': '#6f42c1',          // Purple - Malware/threats
      'authentication_failed': '#fd7e14', // Orange - Auth issues
      'brute_force': '#dc2626',      // Dark red - Brute force
      'sql_injection': '#b91c1c',    // Very dark red - SQL injection
      'web_attack': '#ef4444',       // Red - Web attacks
      'intrusion_detection': '#f59e0b', // Amber - Network intrusions
      'privilege_escalation': '#d97706', // Dark orange - Privilege escalation
      'file_integrity': '#0891b2',   // Cyan - File integrity
      'system_monitoring': '#059669', // Green - System monitoring
      'network_security': '#0d9488', // Teal - Network security
      'firewall': '#06b6d4',         // Light cyan - Firewall
      'antivirus': '#8b5cf6',        // Violet - Antivirus
      'policy_violation': '#ec4899', // Pink - Policy violations
      'account_locked': '#f472b6',   // Light pink - Account issues
      'uncategorized': '#6b7280'     // Gray - Uncategorized
    }
    
    let baseColor = baseColors[categoryName] || baseColors['uncategorized']
    
    // Adjust intensity based on average severity
    if (avgSeverity >= 12) {
      // Make critical categories more intense
      baseColor = baseColor.replace(/^#/, '#').slice(0, 7)
    } else if (avgSeverity < 5) {
      // Make low severity categories lighter
      baseColor = baseColor.replace(/^#/, '#') + '80' // Add 50% opacity
    }
    
    return baseColor
  }

  // Handle click on treemap segment
  const handleClick = (data) => {
    if (onCategoryClick && data?.name) {
      onCategoryClick(data.name)
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const severityInfo = getSeverityInfo(data.avgSeverity)

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium text-gray-900 mb-2">{data.displayName}</p>
          
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Events:</span> {data.count} ({data.percentage}%)
            </p>
            <p>
              <span className="font-medium">Avg Severity:</span> 
              <span className={`ml-1 px-2 py-0.5 rounded text-xs ${severityInfo.color} ${severityInfo.bgColor}`}>
                {severityInfo.label} ({data.avgSeverity.toFixed(1)})
              </span>
            </p>
          </div>

          {/* Severity breakdown */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 mb-1">Severity Breakdown:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {data.critical > 0 && (
                <span className="text-red-600">Critical: {data.critical}</span>
              )}
              {data.high > 0 && (
                <span className="text-orange-600">High: {data.high}</span>
              )}
              {data.medium > 0 && (
                <span className="text-yellow-600">Medium: {data.medium}</span>
              )}
              {data.low > 0 && (
                <span className="text-blue-600">Low: {data.low}</span>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">Click to filter by category</p>
        </div>
      )
    }
    return null
  }

  // Custom treemap content
  const CustomizedContent = ({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
    // Only show labels for larger segments
    const showLabel = width > 50 && height > 30
    const fontSize = Math.min(width / 8, height / 4, 12)
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: payload.fill,
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
            fillOpacity: payload.opacity,
            cursor: 'pointer'
          }}
          onClick={() => handleClick(payload)}
        />
        {showLabel && (
          <>
            {/* Category name */}
            <text
              x={x + width / 2}
              y={y + height / 2 - fontSize / 2}
              textAnchor="middle"
              fill="#fff"
              fontSize={Math.max(fontSize, 10)}
              fontWeight="600"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
            >
              {payload.displayName}
            </text>
            {/* Count */}
            <text
              x={x + width / 2}
              y={y + height / 2 + fontSize / 2}
              textAnchor="middle"
              fill="#fff"
              fontSize={Math.max(fontSize - 2, 8)}
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
            >
              {payload.count} events
            </text>
            {/* Percentage if space allows */}
            {height > 50 && (
              <text
                x={x + width / 2}
                y={y + height / 2 + fontSize * 1.5}
                textAnchor="middle"
                fill="#fff"
                fontSize={Math.max(fontSize - 4, 8)}
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                ({payload.percentage}%)
              </text>
            )}
          </>
        )}
      </g>
    )
  }

  if (!categoriesData.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rule Categories Distribution
        </h3>
        <div className="text-center text-gray-500">
          <p>No rule categories found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Rule Categories Distribution
        </h3>
        {selectedCategory && selectedCategory !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtered by:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
              {selectedCategory.replace(/_/g, ' ')}
            </span>
            <button
              onClick={() => onCategoryClick && onCategoryClick('all')}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              aria-label="Clear category filter"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={categoriesData}
            dataKey="count"
            aspectRatio={4 / 3}
            stroke="#fff"
            content={<CustomizedContent />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700 mb-2">Attack Categories</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Direct Attacks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-600">Malware/Threats</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-gray-600">Authentication</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="font-medium text-gray-700 mb-2">System Categories</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                <span className="text-gray-600">File Integrity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">System Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-500 rounded"></div>
                <span className="text-gray-600">Network Security</span>
              </div>
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-2">Summary</p>
            <div className="space-y-1">
              <p className="text-gray-600">
                <span className="font-medium">{categoriesData.length}</span> Categories
              </p>
              <p className="text-gray-600">
                <span className="font-medium">{logs.length}</span> Total Events
              </p>
              <p className="text-gray-600">
                Top: <span className="font-medium">{categoriesData[0]?.displayName || 'None'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RuleCategoriesTreemap
