# SIEM NLP Interface Features

This document describes the enhanced SIEM log display and analysis features added to your terminal chat application.

## Overview

The application now includes a comprehensive SIEM log viewer that integrates seamlessly with your existing NLP-powered query interface. When your backend returns structured log data, it's displayed in an interactive, terminal-styled interface with advanced filtering, sorting, and export capabilities.

## Features

### 🔍 **Interactive Log Viewer**
- **Terminal-style display** with monospace fonts and dark theme
- **Expandable log entries** showing full details and raw log data
- **Virtual scrolling** for handling large datasets (1000+ logs)
- **Real-time search highlighting** across all log fields

### 🎛️ **Advanced Filtering**
- **Severity level filtering** (Info, Low, Medium, High, Critical)
- **Time range filtering** (Last hour, 24h, 7 days, 30 days)
- **Source-based filtering** (by agent/host name)
- **Log type filtering** (by service/application type)
- **Full-text search** across descriptions, sources, rule IDs, and locations

### 📊 **Sorting & Organization**
- **Multi-field sorting** by timestamp, severity, or source
- **Ascending/descending** sort orders with visual indicators
- **Smart grouping** of related log entries
- **Expandable sections** for detailed log analysis

### 💾 **Export Capabilities**
- **JSON export** for programmatic analysis
- **CSV export** for spreadsheet applications
- **Plain text export** for reports and documentation
- **Filtered export** (only exports currently visible logs)

### ⌨️ **Keyboard Shortcuts**
- **Ctrl+B**: Toggle sidebar (chat history)
- **Ctrl+L**: Toggle log viewer (when logs available)
- **Escape**: Close log viewer
- **Ctrl+E**: Quick export current logs

## Usage Guide

### 1. Basic Query Flow

1. **Complete setup** with your Wazuh credentials and rules file
2. **Enter natural language queries** like:
   - "Show me failed authentication attempts in the last 24 hours"
   - "Find high severity security alerts from web servers"
   - "Display firewall blocks from suspicious IPs"
3. **View results** in the integrated log viewer below the chat

### 2. Testing with Demo Data

For development and testing, you can use the demo command:

```
demo
```

Or:
```
test siem
sample logs
```

This loads sample SIEM data including:
- Authentication failures and successes
- Web server attacks (SQL injection)
- Firewall blocks and system events
- Malware detection alerts
- Account lockout events

### 3. Log Viewer Interface

When logs are returned:

#### **Header Controls**
- **Filter toggle**: Shows/hides advanced filtering options
- **Log count display**: "X of Y logs" with filter status
- **Export dropdown**: JSON/CSV/Text format options

#### **Search Bar**
- **Real-time search** with 300ms debounce
- **Searches across**: rule descriptions, source names, rule IDs, locations, raw logs
- **Highlight matching terms** in yellow

#### **Filter Panel**
- **Min Severity**: Show only logs above selected severity level
- **Time Range**: Filter by when events occurred
- **Sources**: Multi-select by agent/host names
- **Types**: Multi-select by log types/services

#### **Log Entries**
- **Collapsed view**: Shows timestamp, severity, source, rule ID, description
- **Hover actions**: Copy button appears on hover
- **Click to expand**: Full details, raw log data, metadata
- **Color coding**: Severity levels have distinct colors (red=critical, yellow=medium, etc.)

#### **Expanded Details**
- **Full timestamp**: ISO format with timezone
- **Rule information**: Complete rule description and groups
- **Source details**: Agent, host, file location
- **Raw log data**: Original log message with search highlighting
- **Additional fields**: All metadata in collapsible JSON view
- **Copy actions**: Copy rule info or full log JSON

## API Integration

### Expected Response Format

Your backend should return responses in this format:

```json
{
  "success": true,
  "results": [
    {
      "id": "unique_log_id",
      "timestamp": "2024-01-15T10:30:45.123Z",
      "level": 12,
      "rule": {
        "id": "100001",
        "description": "Multiple authentication failures",
        "groups": ["authentication_failed", "attacks"]
      },
      "agent": {
        "name": "web-server-01"
      },
      "host": {
        "name": "web-server-01.example.com"
      },
      "location": "/var/log/auth.log",
      "full_log": "Raw log message here...",
      "data": {
        "srcip": "192.168.1.100",
        "dstuser": "admin"
      }
    }
  ],
  "total_results": 150,
  "execution_time": 245,
  "summary": "Optional human-readable summary",
  "query": "Original natural language query"
}
```

### Alternative Response Structures

The interface handles multiple response formats:
- `results` (recommended)
- `data.logs`
- `logs`

## Performance Considerations

### Virtual Scrolling
- **Automatically enabled** for datasets > 100 logs
- **Renders only visible items** plus buffer
- **Smooth scrolling** with 48px item height
- **Toggle option** in controls bar

### Memory Management
- **Efficient filtering** using indexed searches
- **Lazy loading** of expanded content
- **Cleanup on component unmount**

### Large Datasets
- **Pagination support** (via API limiting)
- **Progressive loading** for very large queries
- **Export limits** to prevent browser crashes

## Customization

### Colors and Styling
The interface uses your existing Catppuccin color scheme:
- **Critical logs**: `text-term-red` (bright red)
- **High severity**: `text-red-400`
- **Medium severity**: `text-yellow-400`
- **Low severity**: `text-blue-400`
- **Info logs**: `text-white/60`

### Log Field Mapping
The interface adapts to different log structures by checking multiple field paths:
- **Timestamp**: `timestamp` or `@timestamp`
- **Source**: `agent.name` or `host.name`
- **Rule ID**: `rule.id`
- **Description**: `rule.description` or `full_log`

## Development Notes

### File Structure
```
src/
├── components/
│   ├── LogViewer.jsx     # Main log viewer component
│   ├── LogEntry.jsx      # Individual log entry
│   └── LogFilters.jsx    # Filter controls
├── utils/
│   ├── siemUtils.js      # Utility functions
│   └── sampleSiemData.js # Demo data
└── pages/
    └── ChatPage.jsx      # Enhanced with SIEM integration
```

### Key Utilities
- **formatTimestamp()**: Human-readable time formatting
- **getSeverityColor()**: Color mapping for severity levels
- **filterLogs()**: Multi-criteria log filtering
- **sortLogs()**: Multi-field sorting
- **exportLogs()**: Format conversion for exports

## Troubleshooting

### Common Issues

1. **Logs not displaying**
   - Check API response structure matches expected format
   - Verify `success: true` in response
   - Ensure logs array is not empty

2. **Search not working**
   - Verify search fields contain searchable text
   - Check for null/undefined values in log objects

3. **Performance issues**
   - Enable virtual scrolling for large datasets
   - Reduce buffer size if needed
   - Consider API-side pagination

4. **Export failures**
   - Check browser console for errors
   - Verify log data structure is valid
   - Try smaller datasets first

### Browser Compatibility
- **Modern browsers**: Full feature support
- **Chrome/Firefox/Safari**: Recommended
- **Virtual scrolling**: Requires IntersectionObserver support
- **File exports**: Uses Blob API (IE11+ support)

## Future Enhancements

Potential improvements for future versions:
- **Real-time log streaming** via WebSocket
- **Advanced analytics** with charts and graphs
- **Log correlation** across multiple sources
- **Custom rule creation** interface
- **Threat intelligence integration**
- **Automated incident response** workflows
