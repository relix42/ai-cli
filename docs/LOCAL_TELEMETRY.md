# GrooveForge Local Telemetry System

GrooveForge includes a privacy-respecting local telemetry system that helps you understand your usage patterns and optimize performance without sending any data to external servers.

## 🔒 Privacy First

- **100% Local**: All telemetry data stays on your machine
- **No Network Calls**: Zero external transmission
- **User Control**: Can be completely disabled
- **Transparent**: All data is stored in readable JSON format

## 📁 Log Storage

Logs are stored in your project's `.grooveforge/logs/` directory:

```
.grooveforge/logs/
├── session-2025-01-28-a1b2c3d4.jsonl     # User interactions, prompts
├── performance-2025-01-28.jsonl          # Tool calls, API response times  
├── errors-2025-01-28.jsonl               # Failures, loops, debugging info
└── ...
```

## 📊 Using the /logs Command

### Basic Usage
```bash
/logs                    # Show 7-day usage analysis
/logs report            # Same as above
/logs report 30         # Show 30-day analysis
/logs dir               # List all log files
/logs help              # Show detailed help
```

### Example Output
```
📊 GrooveForge Usage Analysis (Last 7 days)

## Overview
- Total Sessions: 15
- Total Prompts: 127
- Total Tool Calls: 89
- Total API Calls: 134
- Total Errors: 3

## Performance Metrics
- Average API Response Time: 1,247ms
- Average Tool Call Time: 156ms

## Most Used Tools
- edit: 34 calls (avg 89ms)
- read-file: 28 calls (avg 45ms)
- shell: 15 calls (avg 234ms)

## Model Usage
- ollama/llama3.2: 134 calls, 45,678 tokens
```

## 🎛️ Configuration

### Disable Local Logging
```bash
export GROOVEFORGE_LOCAL_LOGGING=false
```

### Enable Verbose Output
```bash
grooveforge --debug
```

## 📈 What's Logged

### Session Events
- Session start/end with configuration
- Model and tool selections
- Authentication methods used

### Performance Data
- Tool call durations and success rates
- API response times and token usage
- Model switching and fallback events

### Error Information
- Tool failures with error messages
- API errors and status codes
- Loop detection and prevention

### NOT Logged
- **User prompt content** (unless debug mode)
- **API responses** (unless debug mode)
- **Personal information**
- **File contents**

## 🧹 Automatic Cleanup

- Logs older than 30 days are automatically deleted
- Manual cleanup: `rm -rf .grooveforge/logs/`
- No accumulation of old data

## 🔧 For Developers

### Log Format
Logs use JSON Lines format (`.jsonl`) for easy parsing:

```json
{"timestamp":"2025-01-28T10:30:00.000Z","sessionId":"a1b2c3d4","category":"performance","event":"tool_call","data":{"function_name":"edit","duration_ms":89,"success":true}}
```

### Analyzing Logs Programmatically
```javascript
import { LogAnalyzer } from '@google/gemini-cli-core';

const analyzer = new LogAnalyzer('.grooveforge/logs');
const stats = await analyzer.analyzeUsage(30); // Last 30 days
console.log(stats.mostUsedTools);
```

## 🆚 Comparison with Google Telemetry

| Feature | Google Telemetry | Local Telemetry |
|---------|------------------|-----------------|
| **Privacy** | Data sent to Google | 100% local |
| **Control** | Limited user control | Full user control |
| **Insights** | Basic usage stats | Detailed analytics |
| **Performance** | Network dependent | Always available |
| **Debugging** | Limited access | Full access to logs |

## 🚀 Benefits

### For Users
- **Performance Optimization**: Identify slow operations
- **Workflow Analysis**: Understand usage patterns  
- **Debugging Support**: Detailed error information
- **Privacy Protection**: No external data sharing

### For Development
- **Local Debugging**: Rich error context
- **Performance Monitoring**: Track improvements
- **Usage Analytics**: Optimize tool selection
- **Offline Analysis**: Works without internet

## ❓ FAQ

**Q: Can I disable telemetry completely?**
A: Yes, set `GROOVEFORGE_LOCAL_LOGGING=false`

**Q: Where is my data stored?**
A: In `.grooveforge/logs/` in your project directory

**Q: Is any data sent to external servers?**
A: No, all data stays on your machine

**Q: How much disk space do logs use?**
A: Typically 1-5MB per month, auto-cleaned after 30 days

**Q: Can I analyze logs from multiple projects?**
A: Each project has its own logs in its `.grooveforge/logs/` directory

**Q: What if I want to share performance data?**
A: You can manually export and share specific log files if desired