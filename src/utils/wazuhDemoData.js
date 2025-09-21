// Wazuh-Style SIEM Dashboard Demo Data
// Realistic security events that would appear in a Wazuh dashboard

import { getSeverityInfo } from './dashboardUtils'

// Generate realistic timestamps for the last 24 hours
const generateTimeRange = (hours = 24) => {
  const now = new Date()
  const timestamps = []
  
  for (let i = 0; i < hours * 4; i++) { // Every 15 minutes
    const time = new Date(now.getTime() - (i * 15 * 60 * 1000))
    timestamps.push(time.toISOString())
  }
  
  return timestamps.reverse()
}

// Simulated attack sources and targets
const attackSources = [
  '185.220.101.45', '91.240.118.172', '192.168.1.100', '203.0.113.45',
  '198.51.100.23', '172.16.0.150', '10.0.1.200', '45.33.32.156'
]

const internalTargets = [
  '10.0.1.50', '10.0.1.51', '10.0.2.25', '10.0.3.100', 
  '192.168.1.10', '192.168.1.20', '172.16.0.100'
]

const agentNames = [
  'web-server-01', 'web-server-02', 'database-server-01', 'mail-server-01',
  'firewall-01', 'workstation-03', 'workstation-07', 'domain-controller-01',
  'backup-server-01', 'file-server-01'
]

// Create comprehensive Wazuh-style logs
export const createWazuhDemoData = (options = {}) => {
  const hours = typeof options.hours === 'number' ? Math.max(1, Math.min(168, options.hours)) : 24
  const timestamps = generateTimeRange(hours)
  const logs = []
  let eventId = 1000
  
  // Generate various security events
  const eventTypes = [
    // Brute force attacks (high frequency)
    {
      weight: 25,
      generate: () => ({
        level: 10 + Math.floor(Math.random() * 5), // 10-14
        rule: {
          id: '5712',
          description: 'Multiple authentication failures',
          groups: ['authentication_failed', 'attacks', 'brute_force']
        },
        agent: {
          name: agentNames[Math.floor(Math.random() * 3)], // Focus on web servers
          ip: internalTargets[Math.floor(Math.random() * 2)]
        },
        data: {
          srcip: attackSources[Math.floor(Math.random() * attackSources.length)],
          srcport: '22',
          dstuser: ['admin', 'root', 'user', 'administrator'][Math.floor(Math.random() * 4)],
          protocol: 'ssh'
        },
        location: '/var/log/auth.log',
        full_log: `Authentication failure for user ${['admin', 'root', 'user'][Math.floor(Math.random() * 3)]} from ${attackSources[Math.floor(Math.random() * attackSources.length)]}`
      })
    },
    
    // Web attacks
    {
      weight: 20,
      generate: () => ({
        level: 7 + Math.floor(Math.random() * 6), // 7-12
        rule: {
          id: '31151',
          description: 'SQL injection attack attempt detected',
          groups: ['web_attack', 'sql_injection', 'attacks']
        },
        agent: {
          name: ['web-server-01', 'web-server-02'][Math.floor(Math.random() * 2)],
          ip: internalTargets[Math.floor(Math.random() * 2)]
        },
        data: {
          srcip: attackSources[Math.floor(Math.random() * attackSources.length)],
          url: ['/login.php', '/admin.php', '/search.php', '/user.php'][Math.floor(Math.random() * 4)] + "?id=1' OR 1=1--",
          method: 'GET',
          status: '403',
          user_agent: 'sqlmap/1.5.2'
        },
        location: '/var/log/apache2/access.log',
        full_log: `Web attack attempt: SQL injection detected in HTTP request`
      })
    },
    
    // Malware detections
    {
      weight: 15,
      generate: () => ({
        level: 12 + Math.floor(Math.random() * 3), // 12-14
        rule: {
          id: '554',
          description: 'Malware signature detected',
          groups: ['malware', 'antivirus', 'threats']
        },
        agent: {
          name: ['workstation-03', 'workstation-07', 'file-server-01'][Math.floor(Math.random() * 3)],
          ip: internalTargets[Math.floor(Math.random() * internalTargets.length)]
        },
        data: {
          malware_type: ['Trojan.Win32.Generic', 'Backdoor.Linux.Mirai', 'Worm.VBS.LoveLetter', 'Adware.Win32.Agent'][Math.floor(Math.random() * 4)],
          file_path: ['/tmp/suspicious.exe', 'C:\\Users\\john\\Downloads\\invoice.exe', '/home/user/document.pdf'][Math.floor(Math.random() * 3)],
          action: ['Quarantine', 'Delete', 'Block'][Math.floor(Math.random() * 3)],
          user: ['john', 'mary', 'admin', 'guest'][Math.floor(Math.random() * 4)]
        },
        location: '/var/log/clamav/clamav.log',
        full_log: `Malware detected and quarantined: ${['Trojan.Win32.Generic', 'Backdoor.Linux.Mirai'][Math.floor(Math.random() * 2)]}`
      })
    },
    
    // Network intrusions
    {
      weight: 15,
      generate: () => ({
        level: 8 + Math.floor(Math.random() * 4), // 8-11
        rule: {
          id: '1002',
          description: 'Network intrusion detected',
          groups: ['intrusion_detection', 'network_security', 'ids']
        },
        agent: {
          name: 'firewall-01',
          ip: '10.0.1.1'
        },
        data: {
          srcip: attackSources[Math.floor(Math.random() * attackSources.length)],
          dstip: internalTargets[Math.floor(Math.random() * internalTargets.length)],
          srcport: String(1024 + Math.floor(Math.random() * 64000)),
          dstport: ['80', '443', '22', '3389', '445'][Math.floor(Math.random() * 5)],
          protocol: 'TCP',
          action: ['ALERT', 'DROP', 'BLOCK'][Math.floor(Math.random() * 3)],
          signature: ['ET TROJAN Suspicious DNS Query', 'ET SCAN Nmap TCP', 'ET POLICY HTTP Request'][Math.floor(Math.random() * 3)]
        },
        location: '/var/log/suricata/eve.json',
        full_log: `Network intrusion attempt blocked from external IP`
      })
    },
    
    // Privilege escalation
    {
      weight: 10,
      generate: () => ({
        level: 9 + Math.floor(Math.random() * 4), // 9-12
        rule: {
          id: '5401',
          description: 'Privilege escalation attempt',
          groups: ['privilege_escalation', 'attacks', 'system_security']
        },
        agent: {
          name: ['database-server-01', 'file-server-01', 'backup-server-01'][Math.floor(Math.random() * 3)],
          ip: internalTargets[Math.floor(Math.random() * internalTargets.length)]
        },
        data: {
          user: ['www-data', 'apache', 'mysql', 'backup'][Math.floor(Math.random() * 4)],
          sudo_user: 'root',
          command: ['/bin/bash', '/usr/bin/id', '/bin/cat /etc/passwd', '/usr/bin/find / -perm'][Math.floor(Math.random() * 4)],
          tty: 'pts/0',
          result: ['SUCCESS', 'FAILURE'][Math.floor(Math.random() * 2)]
        },
        location: '/var/log/auth.log',
        full_log: `Privilege escalation attempt: user trying to gain root access`
      })
    },
    
    // File integrity violations
    {
      weight: 10,
      generate: () => ({
        level: 7 + Math.floor(Math.random() * 3), // 7-9
        rule: {
          id: '550',
          description: 'File integrity monitoring alert',
          groups: ['file_integrity', 'system_monitoring', 'fim']
        },
        agent: {
          name: agentNames[Math.floor(Math.random() * agentNames.length)],
          ip: internalTargets[Math.floor(Math.random() * internalTargets.length)]
        },
        data: {
          file: ['/etc/passwd', '/etc/shadow', '/bin/bash', '/usr/bin/sudo', '/etc/hosts'][Math.floor(Math.random() * 5)],
          action: ['modified', 'deleted', 'created'][Math.floor(Math.random() * 3)],
          checksum_old: 'abc123def456',
          checksum_new: 'def456abc789',
          user: ['root', 'admin', 'unknown'][Math.floor(Math.random() * 3)]
        },
        location: '/var/ossec/logs/ossec.log',
        full_log: `Critical system file modification detected`
      })
    },
    
    // Account lockouts and policy violations
    {
      weight: 5,
      generate: () => ({
        level: 5 + Math.floor(Math.random() * 4), // 5-8
        rule: {
          id: '18149',
          description: 'Account lockout due to multiple failed attempts',
          groups: ['authentication', 'account_locked', 'policy_violation']
        },
        agent: {
          name: 'domain-controller-01',
          ip: '192.168.1.10'
        },
        data: {
          user: ['jsmith', 'mwilson', 'abrown', 'tjones'][Math.floor(Math.random() * 4)],
          domain: 'COMPANY',
          workstation: ['WORKSTATION-05', 'LAPTOP-12', 'DESKTOP-08'][Math.floor(Math.random() * 3)],
          event_id: '4740',
          lockout_duration: '30 minutes'
        },
        location: 'WinEvtLog',
        full_log: `User account locked due to policy violation`
      })
    }
  ]
  
  // Helper: severity bias
  const applySeverityBias = (level, bias) => {
    if (!bias) return level
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n))
    switch (bias) {
      case 'critical': return clamp(level + 2, 1, 15)
      case 'high': return clamp(level + 1, 1, 15)
      case 'low': return clamp(level - 1, 1, 15)
      default: return level
    }
  }

  // Helper: pick agent with bias
  const pickBiasedAgent = (fallbackName) => {
    const biasList = Array.isArray(options.agentBias) ? options.agentBias : []
    if (biasList.length === 0) return fallbackName
    // 70% chance to pick from bias
    if (Math.random() < 0.7) {
      return biasList[Math.floor(Math.random() * biasList.length)]
    }
    return fallbackName
  }

  // Prepare emphasis weights per category
  const emphasis = options.emphasisWeights || {}

  // Choose how many events per time slot
  const slotScale = options.countScale === 'small' ? 4 : options.countScale === 'large' ? 10 : 7

  // Weighted event selection based on emphasis
  const weightedTypes = () => {
    return eventTypes.map(t => {
      // Create a sample event to check groups without actually generating it
      let groupMultiplier = 1
      try {
        // Get the first rule groups to determine multiplier
        if (t.generate && typeof t.generate === 'function') {
          const sampleEvent = t.generate()
          if (sampleEvent && sampleEvent.rule && sampleEvent.rule.groups) {
            groupMultiplier = sampleEvent.rule.groups.reduce((maxMul, g) => {
              const mul = emphasis[g] || emphasis['attacks'] || 1
              return Math.max(maxMul, mul)
            }, 1)
          }
        }
      } catch (e) {
        console.warn('Error generating sample event for weight calculation:', e)
        groupMultiplier = 1
      }
      return { t, weight: t.weight * groupMultiplier }
    })
  }

  timestamps.forEach(timestamp => {
    const eventsThisSlot = 1 + Math.floor(Math.random() * slotScale)

    for (let i = 0; i < eventsThisSlot; i++) {
      const choices = weightedTypes()
      const total = choices.reduce((s, c) => s + c.weight, 0)
      let r = Math.random() * total
      let selected = choices[0].t
      for (const c of choices) {
        if (r <= c.weight) { selected = c.t; break }
        r -= c.weight
      }

      // Generate event and apply biases
      let event
      try {
        event = selected.generate()
        if (!event || !event.rule || !event.agent) {
          console.warn('Generated invalid event, skipping')
          continue
        }
      } catch (e) {
        console.warn('Error generating event:', e)
        continue
      }

      // Agent bias
      const biasedAgentName = pickBiasedAgent(event.agent?.name || 'unknown-agent')
      event.agent.name = biasedAgentName
      event.host = { name: `${biasedAgentName}.company.com`, ip: event.agent?.ip || '10.0.1.1' }

      // Severity bias
      event.level = applySeverityBias(event.level || 5, options.severityBias)

      logs.push({
        id: String(eventId++),
        timestamp,
        level: event.level,
        rule: event.rule,
        agent: {
          ...event.agent,
          name: event.agent.name,
          ip: event.agent.ip
        },
        host: {
          name: `${event.agent.name}.company.com`,
          ip: event.agent.ip
        },
        location: event.location,
        full_log: event.full_log,
        data: event.data
      })
    }
  })
  
  // Sort by timestamp (newest first for dashboard)
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  
  return {
    success: true,
    nl_confidence: 0.95,
    data: {
      search_stats: {
        took: 340,
        total_hits: logs.length
      },
      logs: logs.slice(0, 500), // Limit to 500 most recent for performance
      log_count: logs.length,
      has_logs: true,
      nlp_response: {
        suggestions: [
          "Show me critical alerts from the last hour",
          "Find all malware detections this week",
          "Display privilege escalation attempts",
          "Search for web attacks on server-01"
        ],
        fallback_used: false
      }
    },
    nl_validation: {
      issues: [],
      optimizations: []
    }
  }
}

// Parse a natural-language-ish query into generator options
export const generateDemoDataFromQuery = (query = '') => {
  const q = (query || '').toLowerCase()

  // Time range
  let hours = 24
  const m = q.match(/last\s+(\d+)\s*(h|hr|hour|hours)/)
  if (m) hours = Math.min(168, Math.max(1, parseInt(m[1], 10)))
  else if (q.includes('last hour')) hours = 1
  else if (q.includes('today')) hours = 24
  else if (q.includes('week')) hours = 24 * 7

  // Emphasis weights
  const emphasisWeights = {}
  const addWeight = (k, w) => { emphasisWeights[k] = Math.max(emphasisWeights[k] || 1, w) }

  if (/(auth|login|ssh|password|brute)/.test(q)) { addWeight('brute_force', 3); addWeight('authentication_failed', 2); addWeight('attacks', 1.5) }
  if (/(malware|virus|trojan|ransom)/.test(q)) { addWeight('malware', 3); addWeight('antivirus', 2); addWeight('threats', 1.5) }
  if (/(sql|xss|web)/.test(q)) { addWeight('sql_injection', 3); addWeight('web_attack', 2); addWeight('attacks', 1.5) }
  if (/(intrusion|ids|network|firewall|scan)/.test(q)) { addWeight('intrusion_detection', 3); addWeight('network_security', 2); addWeight('firewall', 2) }
  if (/(privilege|root|sudo|escalation)/.test(q)) { addWeight('privilege_escalation', 3); addWeight('attacks', 1.5) }
  if (/(fim|file integrity|checksum|tamper)/.test(q)) { addWeight('file_integrity', 3); addWeight('system_monitoring', 1.5) }
  if (/(lockout|policy)/.test(q)) { addWeight('policy_violation', 2); addWeight('account_locked', 2) }

  // Agent bias
  const agentBias = []
  if (/(web|apache|nginx)/.test(q)) agentBias.push('web-server-01', 'web-server-02')
  if (/(db|database|mysql|postgres)/.test(q)) agentBias.push('database-server-01')
  if (/(firewall|ufw|suricata|ids)/.test(q)) agentBias.push('firewall-01')
  if (/(workstation|laptop|desktop)/.test(q)) agentBias.push('workstation-03', 'workstation-07')
  if (/(domain controller|ad|active directory)/.test(q)) agentBias.push('domain-controller-01')

  // Severity bias
  let severityBias = null
  if (/critical/.test(q)) severityBias = 'critical'
  else if (/high/.test(q)) severityBias = 'high'
  else if (/low/.test(q)) severityBias = 'low'

  // Count scale
  let countScale = 'normal'
  if (/(few|sample|example)/.test(q) || hours <= 2) countScale = 'small'
  if (/(many|all|overall|massive|flood)/.test(q) || hours >= 24) countScale = 'large'

  const data = createWazuhDemoData({ hours, emphasisWeights, agentBias, severityBias, countScale })

  // Simulate confidence based on specificity
  const specificityScore = Object.keys(emphasisWeights).length + (severityBias ? 1 : 0) + (agentBias.length > 0 ? 1 : 0)
  const nl_confidence = Math.min(0.98, 0.7 + specificityScore * 0.06)

  return {
    success: true,
    nl_confidence,
    data: {
      ...data.data,
      // Keep the same structure but refresh took based on hours and scale
      search_stats: {
        took: 120 + Math.floor(Math.random() * 160),
        total_hits: data.data.logs.length
      }
    },
    nl_validation: { issues: [], optimizations: [] }
  }
}

// Attack statistics for dashboard summary
export const calculateAttackStatistics = (data) => {
  const logs = data.data.logs || []
  const now = new Date()
  const last24h = logs.filter(log => {
    const logTime = new Date(log.timestamp)
    return (now - logTime) <= 24 * 60 * 60 * 1000
  })
  
  // Count attacks by type
  const attackTypes = {}
  const attackSources = new Set()
  const targetedHosts = new Set()
  
  last24h.forEach(log => {
    if (log.rule.groups.includes('attacks') || 
        log.rule.groups.includes('malware') || 
        log.rule.groups.includes('intrusion_detection')) {
      
      const category = log.rule.groups.find(g => 
        ['brute_force', 'sql_injection', 'malware', 'intrusion_detection', 'privilege_escalation'].includes(g)
      ) || 'other_attacks'
      
      attackTypes[category] = (attackTypes[category] || 0) + 1
      
      if (log.data?.srcip) attackSources.add(log.data.srcip)
      if (log.agent?.ip) targetedHosts.add(log.agent.ip)
    }
  })
  
  return {
    totalAttacks: Object.values(attackTypes).reduce((sum, count) => sum + count, 0),
    attackTypes,
    uniqueAttackSources: attackSources.size,
    targetedHosts: targetedHosts.size,
    topAttackType: Object.entries(attackTypes).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
  }
}

// Generate demo dataset for Wazuh dashboard
export const wazuhDashboardDemo = createWazuhDemoData()
