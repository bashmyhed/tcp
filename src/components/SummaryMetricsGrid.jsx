import { useMemo } from 'react'
import { Shield, AlertTriangle, Activity, Users } from 'lucide-react'
import { calculateSummaryStats, formatNumber } from '../utils/dashboardUtils'

function SummaryMetricsGrid({ logs }) {
  const stats = useMemo(() => {
    return calculateSummaryStats(logs)
  }, [logs])
  
  const MetricCard = ({ title, value, icon: Icon, color, description, trend }) => {
  return (
      <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-400 mb-1">
              {title}
            </div>
            <div className={`text-3xl font-bold ${color}`}>
              {formatNumber(value)}
            </div>
            {description && (
              <div className="text-sm text-gray-400 mt-2">
                {description}
              </div>
            )}
            {trend && (
              <div className="text-xs text-gray-400 mt-1">
                {trend}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
            <Icon size={24} className={color} />
          </div>
        </div>
    )
  }
  
  const mediumLowLogs = stats.total - stats.critical - stats.high
  
  // If no logs, don't show the metrics grid to avoid showing all zeros
  if (stats.total === 0) {
    return null
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <MetricCard
        title="Total Events"
        value={stats.total}
        icon={Activity}
        color="text-blue-600"
        description="All security events"
        trend={stats.timeRange ? `Over ${Math.ceil(stats.timeRange.duration / (1000 * 60 * 60))} hours` : null}
      />
      
      {stats.critical > 0 && (
        <MetricCard
          title="Critical Alerts"
          value={stats.critical}
          icon={AlertTriangle}
          color="text-red-600"
          description="Severity level 12+"
          trend={stats.total > 0 ? `${Math.round((stats.critical / stats.total) * 100)}% of total` : null}
        />
      )}
      
      {stats.high > 0 && (
        <MetricCard
          title="High Priority"
          value={stats.high}
          icon={Shield}
          color="text-orange-600"
          description="Severity level 7-11"
          trend={stats.total > 0 ? `${Math.round((stats.high / stats.total) * 100)}% of total` : null}
        />
      )}
      
      {stats.uniqueAgents > 0 && (
        <MetricCard
          title="Sources"
          value={stats.uniqueAgents}
          icon={Users}
          color="text-purple-600"
          description="Unique agents/hosts"
          trend={`${stats.uniqueRules} unique rules`}
        />
      )}
    </div>
  )
}

export default SummaryMetricsGrid
