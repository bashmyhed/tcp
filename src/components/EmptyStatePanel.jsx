import { Search, AlertTriangle, Info } from 'lucide-react'
import { getConfidenceInfo } from '../utils/dashboardUtils'

function EmptyStatePanel({ data, originalQuery, onQueryRefine }) {
  const confidenceInfo = getConfidenceInfo(data.nl_confidence || 0)
  const suggestions = data.data?.nlp_response?.suggestions || []
  const validationIssues = data.nl_validation?.issues || []
  const optimizations = data.nl_validation?.optimizations || []
  
  const handleSuggestionClick = (suggestion) => {
    if (onQueryRefine) {
      onQueryRefine(suggestion)
    }
  }
  
  return (
    <div className="bg-black border border-white/20 p-4">
      {/* Main Empty State */}
      <div className="text-center mb-8">
        <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Search size={48} className="text-gray-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          No logs found
        </h2>
        
        {originalQuery && (
          <p className="text-gray-400 mb-4">
            No results found for: <span className="font-mono bg-gray-800 px-2 py-1 rounded">"{originalQuery}"</span>
          </p>
        )}
        
        {confidenceInfo.status === 'low' && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertTriangle size={16} />
            <span>I may not have understood your query correctly</span>
          </div>
        )}
      </div>
      
      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Try these suggestions:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-4 text-left border border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="text-sm text-blue-700 group-hover:text-blue-800">
                  {suggestion}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Query Issues:
          </h3>
          <div className="space-y-3">
            {validationIssues.map((issue, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-yellow-800">
                    Query Issue
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">
                    {issue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Optimizations */}
      {optimizations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Optimization Tips:
          </h3>
          <div className="space-y-3">
            {optimizations.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-800">
                    Optimization Tip
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    {tip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* General Tips */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Search Tips:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <div className="font-medium text-gray-700 mb-2">Time Ranges:</div>
            <ul className="space-y-1">
              <li>• "in the last hour"</li>
              <li>• "today" or "yesterday"</li>
              <li>• "last 24 hours"</li>
              <li>• "this week"</li>
            </ul>
          </div>
          
          <div>
            <div className="font-medium text-gray-700 mb-2">Severity Levels:</div>
            <ul className="space-y-1">
              <li>• "critical alerts"</li>
              <li>• "high severity events"</li>
              <li>• "low priority logs"</li>
              <li>• "severity above 10"</li>
            </ul>
          </div>
          
          <div>
            <div className="font-medium text-gray-700 mb-2">Event Types:</div>
            <ul className="space-y-1">
              <li>• "authentication failures"</li>
              <li>• "malware detections"</li>
              <li>• "firewall blocks"</li>
              <li>• "login attempts"</li>
            </ul>
          </div>
          
          <div>
            <div className="font-medium text-gray-700 mb-2">Sources:</div>
            <ul className="space-y-1">
              <li>• "from web servers"</li>
              <li>• "agent server-01"</li>
              <li>• "host database-*"</li>
              <li>• "IP 192.168.1.100"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyStatePanel
