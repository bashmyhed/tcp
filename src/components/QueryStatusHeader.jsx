import { useMemo } from 'react'
import { Clock, Database, AlertTriangle } from 'lucide-react'
import { getConfidenceInfo, formatDuration, formatNumber } from '../utils/dashboardUtils'

function QueryStatusHeader({ data, originalQuery }) {
  const confidenceInfo = useMemo(() => {
    return getConfidenceInfo(data.nl_confidence || 0)
  }, [data.nl_confidence])
  
  const stats = data.data?.search_stats || { took: 0, total_hits: 0 }
  
  // Circular progress component for confidence meter
  const CircularProgress = ({ percentage, strokeColor, size = 64 }) => {
    const radius = (size - 8) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference
    
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">
            {percentage}%
          </span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-transparent p-2">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white mb-2">
            Query Analysis Results
          </h2>
          {originalQuery && (
            <div className="text-sm text-gray-300 bg-gray-800 rounded-md p-3 font-mono">
              &quot;{originalQuery}&quot;
            </div>
          )}
        </div>
        
        {/* Confidence Meter */}
        <div className="flex items-center gap-4 ml-6">
          <div className="text-center">
            <CircularProgress 
              percentage={confidenceInfo.percentage}
              strokeColor={confidenceInfo.strokeColor}
            />
            <div className="mt-2">
              <div className={`text-sm font-medium ${confidenceInfo.color}`}>
                {confidenceInfo.label}
              </div>
              <div className="text-xs text-gray-400">
                {confidenceInfo.message}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">
              {formatDuration(stats.took)}
            </div>
            <div className="text-sm text-gray-400">
              Execution Time
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Database size={20} className="text-green-600" />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">
              {formatNumber(stats.total_hits)}
            </div>
            <div className="text-sm text-gray-400">
              Total Hits
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Database size={20} className="text-purple-600" />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">
              {formatNumber(data.data?.log_count || 0)}
            </div>
            <div className="text-sm text-gray-400">
              Logs Returned
            </div>
          </div>
        </div>
      </div>
      
      {/* Warning for low confidence */}
      {confidenceInfo.status === 'low' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-red-800">
                Low Confidence Query
              </div>
              <div className="text-sm text-red-600 mt-1">
                The system may not have understood your query correctly. 
                Consider refining your search terms or try one of the suggested alternatives below.
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Fallback indicator */}
      {data.data?.nlp_response?.fallback_used && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-yellow-800">
                Fallback Search Used
              </div>
              <div className="text-sm text-yellow-600 mt-1">
                The system used a fallback search strategy. Results may be broader than intended.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QueryStatusHeader
