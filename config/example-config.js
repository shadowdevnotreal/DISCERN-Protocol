/**
 * Example Configuration for REPAIR Protocol with Groq API
 * Simple, clean setup using Groq's fast inference API
 */

// Example: Basic API Configuration
const apiConfig = new APIConfig();

// Set your Groq API key (get one from https://console.groq.com/)
apiConfig.setApiKey('gsk_your_api_key_here');

// Optional: Change the model (default is llama-3.3-70b-versatile)
apiConfig.setModel('llama-3.3-70b-versatile');

/*
Available Groq Models:
- llama-3.3-70b-versatile (default, best for general use)
- llama-3.1-70b-versatile (alternative large model)
- mixtral-8x7b-32768 (large 32k context window)
- gemma2-9b-it (faster, smaller model)
*/

// Example: Enable/disable features
apiConfig.enableFeature('emotionalAnalysis');
apiConfig.enableFeature('biasDetection');
apiConfig.enableFeature('realTimeFeedback');

// Example: Check configuration status
console.log('API Status:', apiConfig.getStatus());

// Example: Initialize GPT integration
const gptIntegration = new GPTIntegration(apiConfig);

// Example: Make a simple request
async function testAPI() {
    try {
        const response = await gptIntegration.makeRequest([
            { role: 'user', content: 'Hello, can you help me with the REPAIR Protocol?' }
        ]);
        console.log('Response:', response.content);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example: Analyze a phase
async function analyzePhase(phaseIndex, formData) {
    const analysis = await gptIntegration.analyzePhase(phaseIndex, formData);
    console.log('Phase Analysis:', analysis);
    return analysis;
}

// Configuration presets for different use cases

// 1. High accuracy (slower but more thoughtful)
const highAccuracyConfig = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    maxTokens: 2000
};

// 2. Balanced (default)
const balancedConfig = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 2000
};

// 3. Fast responses
const fastConfig = {
    model: 'gemma2-9b-it',
    temperature: 0.7,
    maxTokens: 1000
};

// Example: Export configuration (excludes API key for security)
function exportConfig() {
    return apiConfig.exportConfig(false);
}

// Example: Import configuration
function importConfig(configData) {
    apiConfig.config = { ...apiConfig.config, ...configData };
    apiConfig.saveConfig();
}

// Git integration settings
console.log('Git settings:', apiConfig.config.git);
// Output: { includeCoAuthoredBy: false }

// Specialized prompts for different contexts
const specializedPrompts = {
    // Corporate/Workplace Settings
    corporate: {
        systemPrompt: `You are a professional workplace mediation assistant specializing in corporate conflict resolution. Maintain a formal but empathetic tone.`,
        temperature: 0.6
    },

    // Personal Relationships
    personal: {
        systemPrompt: `You are a compassionate relationship counselor assistant helping with personal conflicts. Use warm, understanding language.`,
        temperature: 0.7
    },

    // Family/Intergenerational
    family: {
        systemPrompt: `You are a family therapy assistant specializing in intergenerational conflicts. Consider family dynamics and cultural contexts.`,
        temperature: 0.7
    },

    // Community/Group Settings
    community: {
        systemPrompt: `You are a community mediation specialist helping with group conflicts. Consider community impact and collective healing.`,
        temperature: 0.7
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiConfig,
        gptIntegration,
        testAPI,
        analyzePhase,
        highAccuracyConfig,
        balancedConfig,
        fastConfig,
        specializedPrompts
    };
}

// For browser usage
if (typeof window !== 'undefined') {
    window.REPAIRConfigExamples = {
        apiConfig,
        gptIntegration,
        testAPI,
        analyzePhase,
        highAccuracyConfig,
        balancedConfig,
        fastConfig,
        specializedPrompts
    };
}

/*
SETUP INSTRUCTIONS:

1. Get a Groq API key from https://console.groq.com/
2. Replace 'gsk_your_api_key_here' with your actual API key
3. Choose a model based on your needs:
   - llama-3.3-70b-versatile: Best quality, recommended
   - gemma2-9b-it: Faster, good for development

4. Configure features as needed:
   apiConfig.enableFeature('emotionalAnalysis');
   apiConfig.enableFeature('biasDetection');
   apiConfig.enableFeature('realTimeFeedback');

SECURITY NOTES:
- Never commit API keys to version control
- Use environment variables in production
- API keys are not stored in localStorage for security
- Regularly rotate API keys
- Monitor usage at https://console.groq.com/

GROQ API FEATURES:
- Ultra-fast inference (up to 18x faster than traditional providers)
- OpenAI-compatible API format
- Free tier available with generous limits
- Support for latest open-source models
- Low latency for real-time applications
*/
