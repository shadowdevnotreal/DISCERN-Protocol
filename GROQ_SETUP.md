# Groq API Setup Guide

## Quick Start

The REPAIR Protocol now uses **Groq** for ultra-fast AI inference. Groq provides OpenAI-compatible API with significantly faster response times.

### 1. Get Your Groq API Key

Visit [https://console.groq.com/](https://console.groq.com/) and sign up for a free account. Get your API key from the console.

### 2. Configure the API

```javascript
// Initialize the API configuration
const apiConfig = new APIConfig();

// Set your Groq API key
apiConfig.setApiKey('gsk_your_api_key_here');

// Optional: Choose a different model
apiConfig.setModel('llama-3.3-70b-versatile');
```

### 3. Available Models

- **llama-3.3-70b-versatile** (default) - Best for general use, high quality
- **llama-3.1-70b-versatile** - Alternative large model
- **mixtral-8x7b-32768** - Large 32k context window
- **gemma2-9b-it** - Faster, smaller model for development

### 4. Enable Features

```javascript
apiConfig.enableFeature('emotionalAnalysis');
apiConfig.enableFeature('biasDetection');
apiConfig.enableFeature('realTimeFeedback');
```

## Configuration Options

### Git Integration

The API configuration includes git integration settings:

```javascript
apiConfig.config.git.includeCoAuthoredBy; // false by default
```

### Rate Limiting

Default rate limits:
- 30 requests per minute
- 14,400 requests per day

### Usage Tracking

Track your API usage:

```javascript
const stats = apiConfig.getUsageStats();
console.log(stats);
// { tokensUsed: 1234, requestsToday: 56, rateLimitStatus: 'active' }
```

## Example Integration

```javascript
// Initialize GPT integration
const gptIntegration = new GPTIntegration(apiConfig);

// Make a request
async function analyzePhase() {
    const response = await gptIntegration.makeRequest([
        { role: 'user', content: 'Help me with phase 1 of the REPAIR Protocol' }
    ]);
    console.log(response.content);
}

// Analyze a specific phase
async function getPhaseAnalysis(phaseIndex, formData) {
    const analysis = await gptIntegration.analyzePhase(phaseIndex, formData);
    return analysis;
}
```

## Why Groq?

- **Ultra-fast inference** - Up to 18x faster than traditional providers
- **OpenAI-compatible API** - Easy migration, familiar format
- **Free tier** - Generous limits for development and testing
- **Latest models** - Access to cutting-edge open-source models
- **Low latency** - Perfect for real-time applications

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables in production**
3. **API keys are not stored in localStorage** for security
4. **Regularly rotate API keys**
5. **Monitor usage** at https://console.groq.com/

## Configuration Files

- `config/api-config.js` - Main API configuration class
- `config/example-config.js` - Example configuration and presets
- `agents/gpt-integration.js` - GPT integration module

## Troubleshooting

### API Key Not Working

Ensure your API key starts with `gsk_` and is from https://console.groq.com/

### Rate Limit Errors

Check your usage at https://console.groq.com/ and adjust rate limits in configuration if needed.

### Connection Errors

Test your connection:

```javascript
const connectionTest = await apiConfig.testConnection();
console.log(connectionTest);
```

## Support

For issues or questions:
- Groq Documentation: https://console.groq.com/docs
- REPAIR Protocol: https://github.com/shadowdevnotreal/REPAIR-Protocol/issues
