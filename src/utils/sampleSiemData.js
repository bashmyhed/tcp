// Sample SIEM log data for testing and demonstration
// This simulates the expected structure from your backend API

export const sampleSiemLogs = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:45.123Z',
    level: 12,
    rule: {
      id: '100001',
      description: 'Multiple authentication failures from same source IP',
      groups: ['authentication_failed', 'attacks']
    },
    agent: {
      name: 'web-server-01'
    },
    host: {
      name: 'web-server-01.example.com'
    },
    location: '/var/log/auth.log',
    full_log: 'Jan 15 10:30:45 web-server-01 sshd[12345]: Failed password for invalid user admin from 192.168.1.100 port 22 ssh2',
    decoder: {
      name: 'sshd'
    },
    data: {
      srcip: '192.168.1.100',
      srcport: '22',
      dstuser: 'admin'
    }
  },
  {
    id: '2',
    timestamp: '2024-01-15T10:28:12.456Z',
    level: 7,
    rule: {
      id: '100002',
      description: 'Successful login after multiple failures',
      groups: ['authentication_success', 'pci_dss_10.2.5']
    },
    agent: {
      name: 'database-server-02'
    },
    host: {
      name: 'db-server-02.example.com'
    },
    location: '/var/log/mysql.log',
    full_log: 'Jan 15 10:28:12 db-server-02 mysql: User root@192.168.1.50 successfully authenticated',
    decoder: {
      name: 'mysql'
    },
    data: {
      srcip: '192.168.1.50',
      dstuser: 'root',
      protocol: 'mysql'
    }
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:25:33.789Z',
    level: 4,
    rule: {
      id: '100003',
      description: 'Web server error - File not found',
      groups: ['web_log', 'errors']
    },
    agent: {
      name: 'web-server-01'
    },
    host: {
      name: 'web-server-01.example.com'
    },
    location: '/var/log/apache2/error.log',
    full_log: 'Jan 15 10:25:33 web-server-01 apache2: [error] [client 192.168.1.75] File does not exist: /var/www/html/missing.php',
    decoder: {
      name: 'apache-error'
    },
    data: {
      srcip: '192.168.1.75',
      url: '/missing.php',
      status: '404'
    }
  },
  {
    id: '4',
    timestamp: '2024-01-15T10:22:18.234Z',
    level: 10,
    rule: {
      id: '100004',
      description: 'Possible SQL injection attack detected',
      groups: ['web_attack', 'sql_injection', 'attacks']
    },
    agent: {
      name: 'web-server-01'
    },
    host: {
      name: 'web-server-01.example.com'
    },
    location: '/var/log/apache2/access.log',
    full_log: 'Jan 15 10:22:18 web-server-01 apache2: 192.168.1.200 - - [15/Jan/2024:10:22:18 +0000] "GET /login.php?user=admin\'%20OR%201=1-- HTTP/1.1" 200 1234',
    decoder: {
      name: 'apache-access'
    },
    data: {
      srcip: '192.168.1.200',
      url: "/login.php?user=admin'%20OR%201=1--",
      method: 'GET',
      status: '200',
      size: '1234'
    }
  },
  {
    id: '5',
    timestamp: '2024-01-15T10:20:45.567Z',
    level: 3,
    rule: {
      id: '100005',
      description: 'Firewall: Connection blocked',
      groups: ['firewall', 'connection_attempt']
    },
    agent: {
      name: 'firewall-01'
    },
    host: {
      name: 'firewall-01.example.com'
    },
    location: '/var/log/iptables.log',
    full_log: 'Jan 15 10:20:45 firewall-01 kernel: [UFW BLOCK] IN=eth0 OUT= MAC=00:11:22:33:44:55 SRC=10.0.0.100 DST=192.168.1.10 PROTO=TCP SPT=3389 DPT=22',
    decoder: {
      name: 'iptables'
    },
    data: {
      srcip: '10.0.0.100',
      dstip: '192.168.1.10',
      srcport: '3389',
      dstport: '22',
      protocol: 'TCP',
      action: 'BLOCK'
    }
  },
  {
    id: '6',
    timestamp: '2024-01-15T10:18:22.890Z',
    level: 8,
    rule: {
      id: '100006',
      description: 'User account locked due to multiple failed attempts',
      groups: ['authentication_failed', 'account_locked']
    },
    agent: {
      name: 'domain-controller-01'
    },
    host: {
      name: 'dc-01.example.com'
    },
    location: 'WinEvtLog',
    full_log: 'Jan 15 10:18:22 dc-01 Microsoft-Windows-Security-Auditing: Account lockout: Target Account Name: jsmith, Target Domain: EXAMPLE, Caller Machine Name: WORKSTATION-05',
    decoder: {
      name: 'windows-security'
    },
    data: {
      user: 'jsmith',
      domain: 'EXAMPLE',
      workstation: 'WORKSTATION-05',
      event_id: '4740'
    }
  },
  {
    id: '7',
    timestamp: '2024-01-15T10:15:11.123Z',
    level: 2,
    rule: {
      id: '100007',
      description: 'System startup detected',
      groups: ['system_startup', 'informational']
    },
    agent: {
      name: 'web-server-02'
    },
    host: {
      name: 'web-server-02.example.com'
    },
    location: '/var/log/syslog',
    full_log: 'Jan 15 10:15:11 web-server-02 systemd[1]: Started Apache HTTP Server',
    decoder: {
      name: 'systemd'
    },
    data: {
      service: 'apache2',
      action: 'started',
      pid: '1234'
    }
  },
  {
    id: '8',
    timestamp: '2024-01-15T10:12:55.456Z',
    level: 9,
    rule: {
      id: '100008',
      description: 'Malware detected by antivirus',
      groups: ['malware', 'antivirus', 'attacks']
    },
    agent: {
      name: 'workstation-03'
    },
    host: {
      name: 'ws-03.example.com'
    },
    location: 'C:\\Program Files\\Antivirus\\logs\\scan.log',
    full_log: 'Jan 15 10:12:55 ws-03 AntiVirus: ALERT - Trojan.Win32.Generic detected in C:\\Users\\user\\Downloads\\suspicious.exe - Action: Quarantine',
    decoder: {
      name: 'antivirus'
    },
    data: {
      malware_type: 'Trojan.Win32.Generic',
      file_path: 'C:\\Users\\user\\Downloads\\suspicious.exe',
      action: 'Quarantine',
      user: 'user'
    }
  }
]

export const sampleApiResponse = {
  success: true,
  message: 'Query executed successfully',
  query: 'Show me authentication failures in the last 24 hours',
  results: sampleSiemLogs,
  total_results: sampleSiemLogs.length,
  execution_time: 145,
  summary: 'Found multiple security events including authentication failures, potential attacks, and system activities. The logs show suspicious activity from several IP addresses that may require investigation.'
}

// Helper function to add a demo query for testing
export const addDemoQuery = (chatPage) => {
  // This can be called to populate the interface with sample data
  if (chatPage.setSiemLogs && chatPage.setShowLogViewer) {
    chatPage.setSiemLogs(sampleSiemLogs)
    chatPage.setShowLogViewer(true)
  }
}
