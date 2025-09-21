import { useMemo } from 'react'
import { AlertTriangle, Shield, Info, CheckCircle, Bell, TrendingUp, Cpu, Server } from 'lucide-react'
import { getSeverityInfo } from '../utils/dashboardUtils'

// Generate security insights based on log patterns
const SecurityInsights = ({ logs }) => {
  const insights = useMemo(() => {
    if (!Array.isArray(logs) || logs.length === 0) {
      return {
        recommendations: [],
        threats: [],
        summary: {
          riskLevel: 'unknown',
          message: 'No data available to assess security posture'
        }
      }
    }

    const attackPatterns = {}
    const uniqueSourceIps = new Set()
    const uniqueTargets = new Set()
    const criticalEvents = []
    let bruteForceAttempts = 0
    let sqlInjectionAttempts = 0
    let malwareDetections = 0
    let fileIntegrityViolations = 0
    let privilegeEscalation = 0

    // Analyze patterns
    logs.forEach(log => {
      // Track attack sources
      if (log.data?.srcip) {
        uniqueSourceIps.add(log.data.srcip)
      }

      // Track targets
      if (log.agent?.name) {
        uniqueTargets.add(log.agent.name)
      }

      // Track critical events
      if (log.level >= 12) {
        criticalEvents.push(log)
      }

      // Track attack types
      if (log.rule?.groups) {
        if (log.rule.groups.includes('brute_force')) {
          bruteForceAttempts++
          attackPatterns['brute_force'] = (attackPatterns['brute_force'] || 0) + 1
        }
        if (log.rule.groups.includes('sql_injection')) {
          sqlInjectionAttempts++
          attackPatterns['sql_injection'] = (attackPatterns['sql_injection'] || 0) + 1
        }
        if (log.rule.groups.includes('malware')) {
          malwareDetections++
          attackPatterns['malware'] = (attackPatterns['malware'] || 0) + 1
        }
        if (log.rule.groups.includes('file_integrity')) {
          fileIntegrityViolations++
          attackPatterns['file_integrity'] = (attackPatterns['file_integrity'] || 0) + 1
        }
        if (log.rule.groups.includes('privilege_escalation')) {
          privilegeEscalation++
          attackPatterns['privilege_escalation'] = (attackPatterns['privilege_escalation'] || 0) + 1
        }
      }
    })

    const recommendations = []
    const threats = []

    // Generate recommendations
    if (bruteForceAttempts > 0) {
      recommendations.push({
        id: 'auth-policy',
        title: 'Strengthen authentication policies',
        description: `${bruteForceAttempts} brute force attempts detected. Consider implementing account lockout policies and multi-factor authentication.`,
        severity: 'high',
        icon: <Shield size={18} />
      })
    }

    if (sqlInjectionAttempts > 0) {
      recommendations.push({
        id: 'web-security',
        title: 'Implement web application firewall',
        description: `${sqlInjectionAttempts} SQL injection attempts detected. Implement WAF protection and audit your web application code.`,
        severity: 'critical',
        icon: <Server size={18} />
      })
    }

    if (malwareDetections > 0) {
      recommendations.push({
        id: 'malware-scan',
        title: 'Perform full system malware scan',
        description: `${malwareDetections} malware detections. Initiate full system scan and review endpoint protection status.`,
        severity: 'high',
        icon: <Cpu size={18} />
      })
    }

    if (fileIntegrityViolations > 0) {
      recommendations.push({
        id: 'fim-review',
        title: 'Review file integrity violations',
        description: `${fileIntegrityViolations} critical file modifications detected. Review changes for unauthorized modifications.`,
        severity: 'medium',
        icon: <CheckCircle size={18} />
      })
    }

    // Identify active threats
    if (criticalEvents.length > 0) {
      threats.push({
        id: 'active-attacks',
        title: 'Active attack campaign detected',
        description: `${criticalEvents.length} critical security events from ${uniqueSourceIps.size} source IPs targeting ${uniqueTargets.size} systems.`,
        severity: 'critical',
        icon: <AlertTriangle size={18} />
      })
    }

    if (privilegeEscalation > 0) {
      threats.push({
        id: 'privesc',
        title: 'Privilege escalation attempts',
        description: `${privilegeEscalation} attempts to gain elevated system privileges detected. Investigate affected systems.`,
        severity: 'critical',
        icon: <TrendingUp size={18} />
      })
    }

    // Determine overall risk level
    let riskLevel = 'low'
    let summaryMessage = 'No significant security issues detected'
    
    if (criticalEvents.length > 10 || (malwareDetections > 0 && privilegeEscalation > 0)) {
      riskLevel = 'critical'
      summaryMessage = 'Critical security incident in progress - immediate response required'
    } else if (criticalEvents.length > 0 || bruteForceAttempts > 5 || sqlInjectionAttempts > 0) {
      riskLevel = 'high'
      summaryMessage = 'High security risk detected - prioritized response required'
    } else if (bruteForceAttempts > 0 || fileIntegrityViolations > 0) {
      riskLevel = 'medium'
      summaryMessage = 'Security issues detected - scheduled response recommended'
    }

    return {
      recommendations,
      threats,
      summary: {
        riskLevel,
        message: summaryMessage,
        attackCount: Object.values(attackPatterns).reduce((sum, count) => sum + count, 0),
        criticalEvents: criticalEvents.length,
        uniqueSources: uniqueSourceIps.size,
        uniqueTargets: uniqueTargets.size
      }
    }
  }, [logs])

  if (insights.recommendations.length === 0 && insights.threats.length === 0) {
    return (
      <div className="bg-transparent p-2">
        <h3 className="text-lg font-semibold text-white mb-4">
          Security Insights
        </h3>
        <div className="text-center text-gray-400 py-6">
          <Info size={36} className="mx-auto mb-2 text-blue-400" />
          <p>No significant security insights available for the current dataset</p>
          <p className="text-sm mt-2">Try querying a larger time range or more security log sources</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-transparent p-2">
      <h3 className="text-lg font-semibold text-white mb-4">
        Security Insights
      </h3>
      
      {/* Risk Summary */}
      <div className={`mb-6 rounded-lg p-4 ${
        insights.summary.riskLevel === 'critical' ? 'bg-red-50 border border-red-200' :
        insights.summary.riskLevel === 'high' ? 'bg-orange-50 border border-orange-200' :
        insights.summary.riskLevel === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-center">
          <Bell size={20} className={
            insights.summary.riskLevel === 'critical' ? 'text-red-500' :
            insights.summary.riskLevel === 'high' ? 'text-orange-500' :
            insights.summary.riskLevel === 'medium' ? 'text-yellow-500' :
            'text-blue-500'
          } />
          <h4 className={`ml-2 font-medium ${
            insights.summary.riskLevel === 'critical' ? 'text-red-700' :
            insights.summary.riskLevel === 'high' ? 'text-orange-700' :
            insights.summary.riskLevel === 'medium' ? 'text-yellow-700' :
            'text-blue-700'
          }`}>
            {insights.summary.riskLevel === 'critical' ? 'Critical Risk Level' :
             insights.summary.riskLevel === 'high' ? 'High Risk Level' :
             insights.summary.riskLevel === 'medium' ? 'Medium Risk Level' :
             'Low Risk Level'}
          </h4>
        </div>
        
        <p className="mt-1 text-gray-400">
          {insights.summary.message}
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">
              {insights.summary.attackCount}
            </div>
            <div className="text-xs text-gray-400">Attack Events</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">
              {insights.summary.criticalEvents}
            </div>
            <div className="text-xs text-gray-400">Critical Events</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">
              {insights.summary.uniqueSources}
            </div>
            <div className="text-xs text-gray-400">Source IPs</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">
              {insights.summary.uniqueTargets}
            </div>
            <div className="text-xs text-gray-400">Target Systems</div>
          </div>
        </div>
      </div>
      
      {/* Active Threats */}
      {insights.threats.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <AlertTriangle size={16} className="text-red-500 mr-2" />
            Active Security Threats
          </h4>
          <div className="space-y-3">
            {insights.threats.map(threat => (
              <div 
                key={threat.id}
                className={`p-3 rounded-lg ${
                  threat.severity === 'critical' ? 'bg-red-50 border-l-4 border-red-500' :
                  threat.severity === 'high' ? 'bg-orange-50 border-l-4 border-orange-500' :
                  threat.severity === 'medium' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                  'bg-blue-50 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex items-center mb-1">
                  {threat.icon}
                  <h5 className={`ml-2 font-medium ${
                    threat.severity === 'critical' ? 'text-red-700' :
                    threat.severity === 'high' ? 'text-orange-700' :
                    threat.severity === 'medium' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {threat.title}
                  </h5>
                </div>
                <p className="text-sm text-gray-400">
                  {threat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Security Recommendations */}
      {insights.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <Shield size={16} className="text-blue-500 mr-2" />
            Security Recommendations
          </h4>
          <div className="space-y-3">
            {insights.recommendations.map(recommendation => (
              <div 
                key={recommendation.id}
                className={`p-3 rounded-lg ${
                  recommendation.severity === 'critical' ? 'bg-red-50' :
                  recommendation.severity === 'high' ? 'bg-orange-50' :
                  recommendation.severity === 'medium' ? 'bg-yellow-50' :
                  'bg-blue-50'
                }`}
              >
                <div className="flex items-center mb-1">
                  {recommendation.icon}
                  <h5 className={`ml-2 font-medium ${
                    recommendation.severity === 'critical' ? 'text-red-700' :
                    recommendation.severity === 'high' ? 'text-orange-700' :
                    recommendation.severity === 'medium' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {recommendation.title}
                  </h5>
                </div>
                <p className="text-sm text-gray-400">
                  {recommendation.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SecurityInsights
