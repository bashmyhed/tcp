// Sample SIEM Dashboard API Response Data
// This simulates the exact API structure specified in the requirements

// Sample with no results (empty state)
export const sampleEmptyResponse = {
  success: true,
  nl_confidence: 0.45,
  data: {
    search_stats: {
      took: 150,
      total_hits: 0
    },
    logs: [],
    log_count: 0,
    has_logs: false,
    nlp_response: {
      suggestions: [
        "Show me authentication failures in the last 24 hours",
        "Find critical alerts from web servers",
        "Display firewall blocks from suspicious IPs",
        "Search for malware detections this week",
        "Show high severity events from database servers"
      ],
      fallback_used: true
    }
  },
  nl_validation: {
    issues: [
      "Query term 'security stuff' is too vague and may not match specific log types",
      "No time range specified - results may be too broad"
    ],
    optimizations: [
      "Try using specific event types like 'authentication failure' or 'malware detection'",
      "Add time constraints like 'in the last hour' or 'today'",
      "Specify severity levels like 'critical' or 'high priority'"
    ]
  }
}

// Sample with results (populated dashboard)
export const samplePopulatedResponse = {
  success: true,
  nl_confidence: 0.92,
  data: {
    search_stats: {
      took: 245,
      total_hits: 1547
    },
    logs: [
      {
        id: '1',
        timestamp: '2024-01-15T14:30:45.123Z',
        level: 14,
        rule: {
          id: '100001',
          description: 'Multiple authentication failures detected from same source IP',
          groups: ['authentication_failed', 'attacks', 'brute_force']
        },
        agent: {
          name: 'web-server-01',
          ip: '10.0.1.50'
        },
        host: {
          name: 'web-server-01.company.com',
          ip: '10.0.1.50'
        },
        location: '/var/log/auth.log',
        full_log: 'Jan 15 14:30:45 web-server-01 sshd[12345]: Failed password for invalid user admin from 192.168.1.100 port 22 ssh2',
        data: {
          srcip: '192.168.1.100',
          srcport: '22',
          dstuser: 'admin',
          protocol: 'ssh'
        }
      },
      {
        id: '2',
        timestamp: '2024-01-15T14:25:12.456Z',
        level: 12,
        rule: {
          id: '100002',
          description: 'Malware signature detected in downloaded file',
          groups: ['malware', 'antivirus', 'threats']
        },
        agent: {
          name: 'workstation-03',
          ip: '10.0.2.25'
        },
        host: {
          name: 'ws-03.company.com',
          ip: '10.0.2.25'
        },
        location: 'C:\\Program Files\\Antivirus\\logs\\scan.log',
        full_log: 'Jan 15 14:25:12 ws-03 AntiVirus: ALERT - Trojan.Win32.Generic detected in C:\\Users\\john\\Downloads\\document.exe - Action: Quarantine',
        data: {
          malware_type: 'Trojan.Win32.Generic',
          file_path: 'C:\\Users\\john\\Downloads\\document.exe',
          action: 'Quarantine',
          user: 'john'
        }
      },
      {
        id: '3',
        timestamp: '2024-01-15T14:20:33.789Z',
        level: 10,
        rule: {
          id: '100003',
          description: 'SQL injection attack attempt detected',
          groups: ['web_attack', 'sql_injection', 'attacks']
        },
        agent: {
          name: 'web-server-02',
          ip: '10.0.1.51'
        },
        host: {
          name: 'web-server-02.company.com',
          ip: '10.0.1.51'
        },
        location: '/var/log/apache2/access.log',
        full_log: 'Jan 15 14:20:33 web-server-02 apache2: 192.168.1.200 - - [15/Jan/2024:14:20:33 +0000] "GET /login.php?user=admin\\' OR 1=1-- HTTP/1.1" 200 1234',
        data: {
          srcip: '192.168.1.200',
          url: "/login.php?user=admin' OR 1=1--",
          method: 'GET',
          status: '200',
          size: '1234'
        }
      },
      {
        id: '4',
        timestamp: '2024-01-15T14:15:18.234Z',
        level: 8,
        rule: {
          id: '100004',
          description: 'User account locked due to multiple failed login attempts',
          groups: ['authentication_failed', 'account_locked', 'security']
        },
        agent: {
          name: 'domain-controller-01',
          ip: '10.0.1.10'
        },
        host: {
          name: 'dc-01.company.com',
          ip: '10.0.1.10'
        },
        location: 'WinEvtLog',
        full_log: 'Jan 15 14:15:18 dc-01 Microsoft-Windows-Security-Auditing: Account lockout: Target Account Name: jsmith, Target Domain: COMPANY, Caller Machine Name: WORKSTATION-05',
        data: {
          user: 'jsmith',
          domain: 'COMPANY',
          workstation: 'WORKSTATION-05',
          event_id: '4740'
        }
      },
      {
        id: '5',
        timestamp: '2024-01-15T14:10:45.567Z',
        level: 7,
        rule: {
          id: '100005',
          description: 'Suspicious network connection blocked by firewall',
          groups: ['firewall', 'network_security', 'blocked_connection']
        },
        agent: {
          name: 'firewall-01',
          ip: '10.0.1.1'
        },
        host: {
          name: 'firewall-01.company.com',
          ip: '10.0.1.1'
        },
        location: '/var/log/iptables.log',
        full_log: 'Jan 15 14:10:45 firewall-01 kernel: [UFW BLOCK] IN=eth0 OUT= MAC=00:11:22:33:44:55 SRC=185.220.101.45 DST=10.0.1.100 PROTO=TCP SPT=443 DPT=22',
        data: {
          srcip: '185.220.101.45',
          dstip: '10.0.1.100',
          srcport: '443',
          dstport: '22',
          protocol: 'TCP',
          action: 'BLOCK'
        }
      },
      {
        id: '6',
        timestamp: '2024-01-15T14:05:22.890Z',
        level: 6,
        rule: {
          id: '100006',
          description: 'Successful privileged user login after hours',
          groups: ['authentication_success', 'privileged_access', 'after_hours']
        },
        agent: {
          name: 'database-server-01',
          ip: '10.0.3.100'
        },
        host: {
          name: 'db-01.company.com',
          ip: '10.0.3.100'
        },
        location: '/var/log/auth.log',
        full_log: 'Jan 15 14:05:22 db-01 sudo: dbadmin : TTY=pts/0 ; PWD=/home/dbadmin ; USER=root ; COMMAND=/usr/bin/mysql',
        data: {
          user: 'dbadmin',
          sudo_user: 'root',
          command: '/usr/bin/mysql',
          tty: 'pts/0'
        }
      },
      {
        id: '7',
        timestamp: '2024-01-15T14:00:11.123Z',
        level: 4,
        rule: {
          id: '100007',
          description: 'File integrity monitoring alert - critical system file modified',
          groups: ['file_integrity', 'system_monitoring', 'file_modified']
        },
        agent: {
          name: 'web-server-01',
          ip: '10.0.1.50'
        },
        host: {
          name: 'web-server-01.company.com',
          ip: '10.0.1.50'
        },
        location: '/var/ossec/logs/ossec.log',
        full_log: 'Jan 15 14:00:11 web-server-01 ossec: File \'/etc/passwd\' was modified. Previous checksum: \'abc123\', Current checksum: \'def456\'',
        data: {
          file: '/etc/passwd',
          previous_checksum: 'abc123',
          current_checksum: 'def456',
          action: 'modified'
        }
      },
      {
        id: '8',
        timestamp: '2024-01-15T13:55:55.456Z',
        level: 3,
        rule: {
          id: '100008',
          description: 'High disk usage detected on critical server',
          groups: ['system_monitoring', 'disk_usage', 'resource_monitoring']
        },
        agent: {
          name: 'database-server-01',
          ip: '10.0.3.100'
        },
        host: {
          name: 'db-01.company.com',
          ip: '10.0.3.100'
        },
        location: '/var/log/syslog',
        full_log: 'Jan 15 13:55:55 db-01 disk_monitor: WARNING - Disk usage on /var/lib/mysql is 92% (threshold: 90%)',
        data: {
          filesystem: '/var/lib/mysql',
          usage_percent: 92,
          threshold: 90,
          available_gb: 5.2
        }
      }
    ],
    log_count: 8,
    has_logs: true,
    nlp_response: {
      suggestions: [],
      fallback_used: false
    }
  },
  nl_validation: {
    issues: [],
    optimizations: []
  }
}

// Extended dataset for testing large data performance
export const generateLargeDataset = (count = 500) => {
  const baseAgents = ['web-server-01', 'web-server-02', 'database-server-01', 'firewall-01', 'workstation-03', 'domain-controller-01']
  const baseRules = [
    { id: '100001', description: 'Authentication failure detected', groups: ['auth_failure'], level: 8 },
    { id: '100002', description: 'Malware signature detected', groups: ['malware'], level: 12 },
    { id: '100003', description: 'SQL injection attempt', groups: ['web_attack'], level: 10 },
    { id: '100004', description: 'Account locked', groups: ['account_locked'], level: 8 },
    { id: '100005', description: 'Firewall block', groups: ['firewall'], level: 6 },
    { id: '100006', description: 'Privileged access', groups: ['privileged_access'], level: 4 },
    { id: '100007', description: 'File modified', groups: ['file_integrity'], level: 3 },
    { id: '100008', description: 'System resource alert', groups: ['system_monitoring'], level: 2 }
  ]
  
  const logs = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    const agent = baseAgents[Math.floor(Math.random() * baseAgents.length)]
    const rule = baseRules[Math.floor(Math.random() * baseRules.length)]
    const hoursAgo = Math.floor(Math.random() * 24) // Last 24 hours
    const timestamp = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000))
    
    logs.push({
      id: `generated-${i}`,
      timestamp: timestamp.toISOString(),
      level: rule.level + Math.floor(Math.random() * 3) - 1, // Add some variance
      rule: {
        ...rule,
        description: `${rule.description} - Event ${i + 1}`
      },
      agent: {
        name: agent,
        ip: `10.0.${Math.floor(Math.random() * 4) + 1}.${Math.floor(Math.random() * 255) + 1}`
      },
      host: {
        name: `${agent}.company.com`,
        ip: `10.0.${Math.floor(Math.random() * 4) + 1}.${Math.floor(Math.random() * 255) + 1}`
      },
      location: '/var/log/security.log',
      full_log: `Generated log entry ${i + 1} for testing purposes`,
      data: {
        srcip: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
        event_id: `${1000 + i}`
      }
    })
  }
  
  return {
    ...samplePopulatedResponse,
    data: {
      ...samplePopulatedResponse.data,
      logs: logs,
      log_count: logs.length,
      search_stats: {
        took: 180 + Math.floor(Math.random() * 100),
        total_hits: logs.length
      }
    }
  }
}
