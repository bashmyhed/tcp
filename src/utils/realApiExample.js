// Real API Response Example - Based on your actual malware query response
// This shows how the dashboard will parse and display your real API data

export const realMalwareQueryResponse = {
  success: true,
  nl_confidence: 0.3, // Low confidence - will trigger suggestions in dashboard
  data: {
    search_stats: {
      took: 5,
      total_hits: 0
    },
    logs: [], // No logs found
    log_count: 0,
    has_logs: false,
    nlp_response: {
      confidence: 0.3,
      fallback_used: true,
      suggestions: [
        "Consider adding a time range like 'recent', 'today', or 'last week'",
        "Add severity level such as 'high', 'critical', 'medium', or 'low'",
        "You can filter by IP using phrases like 'from 10.0.0.5' or 'src ip 10.0.0.5'",
        "You can specify ports, e.g. 'port 22' or 'dst port 443'",
        "You can specify agents/hosts like 'from server-01' or 'on host web-server'"
      ]
    }
  },
  nl_validation: {
    issues: [
      "Unknown field: type - Did you mean: input.type"
    ],
    optimizations: [
      "Add timestamp filters to limit search scope"
    ]
  }
}

// What the dashboard will show for this response:
// 1. ✅ QueryStatusHeader will show:
//    - Low confidence (30%) with red warning
//    - Execution time: 5ms
//    - Total hits: 0
//    - Logs returned: 0
//    - Warning about fallback search used

// 2. ✅ SummaryMetricsGrid will be HIDDEN (no zero-value cards)

// 3. ✅ Charts will be HIDDEN (no data to visualize)

// 4. ✅ EmptyStatePanel will show:
//    - "No logs found for: Show me malware detections"
//    - Low confidence warning
//    - 5 clickable suggestion buttons
//    - Validation issues section
//    - Optimization tips section  
//    - General search guidance with examples

// 5. ✅ Interactive features:
//    - Click suggestions to refine query
//    - All suggestions are clickable buttons
//    - No empty/useless components displayed
//    - Professional error messaging

console.log('Dashboard will handle this response perfectly:', realMalwareQueryResponse)
