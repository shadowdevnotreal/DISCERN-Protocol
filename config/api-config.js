/**
 * Groq API Configuration for REPAIR Protocol
 * Clean, simple integration with Groq's fast inference API
 */

class APIConfig {
    constructor() {
        this.config = {
            // Groq API Configuration
            provider: 'groq',
            endpoint: 'https://api.groq.com/openai/v1/chat/completions',
            apiKey: null,
            model: 'llama-3.3-70b-versatile', // Default model
            maxTokens: 2000,
            temperature: 0.7,
            timeout: 30000,

            // Available Groq models
            availableModels: [
                'llama-3.3-70b-versatile',
                'llama-3.1-70b-versatile',
                'mixtral-8x7b-32768',
                'gemma2-9b-it'
            ],

            // Git integration settings
            git: {
                includeCoAuthoredBy: false
            },

            // Rate Limiting
            rateLimiting: {
                requestsPerMinute: 30,
                requestsPerDay: 14400
            },

            // Usage Tracking
            usage: {
                tokensUsed: 0,
                requestsToday: 0,
                lastReset: new Date().toDateString()
            },

            // Features
            features: {
                conversationHistory: true,
                emotionalAnalysis: true,
                biasDetection: true,
                realTimeFeedback: true
            }
        };

        this.requestLog = [];
        this.rateLimitState = {
            requests: [],
            blocked: false,
            blockUntil: null
        };
    }

    /**
     * API Key Management
     */
    setApiKey(key) {
        if (!key || typeof key !== 'string') {
            throw new Error('Invalid API key provided');
        }

        if (!key.startsWith('gsk_')) {
            console.warn('API key may not be valid Groq format (should start with gsk_)');
        }

        this.config.apiKey = key;
        this.saveConfig();
        console.log('Groq API key configured');
    }

    getApiKey() {
        return this.config.apiKey;
    }

    /**
     * Model Management
     */
    setModel(model) {
        if (!this.config.availableModels.includes(model)) {
            console.warn(`Model ${model} not in available models list`);
        }
        this.config.model = model;
        this.saveConfig();
    }

    getAvailableModels() {
        return this.config.availableModels;
    }

    /**
     * Get endpoint configuration
     */
    getEndpointConfig() {
        return {
            url: this.config.endpoint,
            headers: {
                'Authorization': `Bearer ${this.getApiKey()}`,
                'Content-Type': 'application/json'
            }
        };
    }

    /**
     * Rate Limiting
     */
    checkRateLimit() {
        const now = Date.now();

        // Check if currently blocked
        if (this.rateLimitState.blocked && now < this.rateLimitState.blockUntil) {
            const waitTime = Math.ceil((this.rateLimitState.blockUntil - now) / 1000);
            throw new Error(`Rate limited. Please wait ${waitTime} seconds.`);
        }

        // Reset block if cooldown passed
        if (this.rateLimitState.blocked && now >= this.rateLimitState.blockUntil) {
            this.rateLimitState.blocked = false;
            this.rateLimitState.blockUntil = null;
        }

        // Check requests in last minute
        const lastMinute = this.rateLimitState.requests.filter(
            timestamp => now - timestamp < 60000
        );

        if (lastMinute.length >= this.config.rateLimiting.requestsPerMinute) {
            this.rateLimitState.blocked = true;
            this.rateLimitState.blockUntil = now + 60000;
            throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }

        return true;
    }

    recordRequest() {
        this.rateLimitState.requests.push(Date.now());

        // Cleanup old requests
        const now = Date.now();
        this.rateLimitState.requests = this.rateLimitState.requests.filter(
            timestamp => now - timestamp < 3600000
        );
    }

    /**
     * Usage Tracking
     */
    trackUsage(tokens) {
        const today = new Date().toDateString();

        // Reset daily counter if new day
        if (this.config.usage.lastReset !== today) {
            this.config.usage.requestsToday = 0;
            this.config.usage.lastReset = today;
        }

        this.config.usage.tokensUsed += tokens;
        this.config.usage.requestsToday += 1;
        this.saveConfig();
    }

    getUsageStats() {
        return {
            tokensUsed: this.config.usage.tokensUsed,
            requestsToday: this.config.usage.requestsToday,
            rateLimitStatus: this.rateLimitState.blocked ? 'blocked' : 'active'
        };
    }

    /**
     * Feature Management
     */
    isFeatureEnabled(feature) {
        return this.config.features[feature] === true;
    }

    enableFeature(feature) {
        this.config.features[feature] = true;
        this.saveConfig();
    }

    disableFeature(feature) {
        this.config.features[feature] = false;
        this.saveConfig();
    }

    /**
     * Configuration Storage
     */
    saveConfig() {
        try {
            if (typeof localStorage !== 'undefined') {
                const configToSave = { ...this.config };
                // Don't save API key to localStorage for security
                delete configToSave.apiKey;
                localStorage.setItem('repairProtocolConfig', JSON.stringify(configToSave));
            }
        } catch (error) {
            console.warn('Failed to save configuration:', error);
        }
    }

    loadStoredConfig() {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('repairProtocolConfig');
                if (stored) {
                    const storedConfig = JSON.parse(stored);
                    // Merge stored config but preserve API key if already set
                    const currentApiKey = this.config.apiKey;
                    Object.assign(this.config, storedConfig);
                    if (currentApiKey) {
                        this.config.apiKey = currentApiKey;
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load stored configuration:', error);
        }
    }

    /**
     * Connection Testing
     */
    async testConnection() {
        try {
            const endpoint = this.getEndpointConfig();
            const testPayload = {
                model: this.config.model,
                messages: [{ role: 'user', content: 'Test' }],
                max_tokens: 10,
                temperature: 0
            };

            const response = await fetch(endpoint.url, {
                method: 'POST',
                headers: endpoint.headers,
                body: JSON.stringify(testPayload),
                timeout: this.config.timeout
            });

            return {
                success: response.ok,
                status: response.status,
                provider: 'groq'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                provider: 'groq'
            };
        }
    }

    /**
     * Get Configuration Status
     */
    getStatus() {
        return {
            configured: !!this.config.apiKey,
            hasApiKey: !!this.config.apiKey,
            provider: 'groq',
            model: this.config.model,
            features: this.config.features,
            usage: this.getUsageStats(),
            git: this.config.git
        };
    }

    /**
     * Set Provider (Groq only)
     */
    setProvider(provider) {
        // For Groq-only implementation, just log confirmation
        if (provider !== 'groq') {
            console.warn('Only Groq provider is supported. Ignoring provider change to:', provider);
        }
        console.log('Provider set to Groq');
    }

    /**
     * Reset to Default Configuration
     */
    resetToDefaults() {
        const currentApiKey = this.config.apiKey;

        this.config = {
            provider: 'groq',
            endpoint: 'https://api.groq.com/openai/v1/chat/completions',
            apiKey: currentApiKey, // Preserve API key
            model: 'llama-3.3-70b-versatile',
            maxTokens: 2000,
            temperature: 0.7,
            timeout: 30000,

            availableModels: [
                'llama-3.3-70b-versatile',
                'llama-3.1-70b-versatile',
                'mixtral-8x7b-32768',
                'gemma2-9b-it'
            ],

            git: {
                includeCoAuthoredBy: false
            },

            rateLimiting: {
                requestsPerMinute: 30,
                requestsPerDay: 14400
            },

            usage: {
                tokensUsed: 0,
                requestsToday: 0,
                lastReset: new Date().toDateString()
            },

            features: {
                conversationHistory: true,
                emotionalAnalysis: true,
                biasDetection: true,
                realTimeFeedback: true
            }
        };

        this.saveConfig();
        console.log('Configuration reset to defaults');
    }

    /**
     * Update Configuration (Bulk Update)
     */
    updateConfig(updates) {
        try {
            // Update primary settings
            if (updates.primary) {
                if (updates.primary.model) {
                    this.config.model = updates.primary.model;
                }
                if (typeof updates.primary.temperature === 'number') {
                    this.config.temperature = Math.max(0, Math.min(1, updates.primary.temperature));
                }
                if (typeof updates.primary.maxTokens === 'number') {
                    this.config.maxTokens = Math.max(1, updates.primary.maxTokens);
                }
                if (typeof updates.primary.timeout === 'number') {
                    this.config.timeout = Math.max(1000, updates.primary.timeout);
                }
            }

            // Update rate limiting
            if (updates.rateLimiting) {
                if (typeof updates.rateLimiting.requestsPerMinute === 'number') {
                    this.config.rateLimiting.requestsPerMinute = Math.max(1, updates.rateLimiting.requestsPerMinute);
                }
                if (typeof updates.rateLimiting.requestsPerDay === 'number') {
                    this.config.rateLimiting.requestsPerDay = Math.max(1, updates.rateLimiting.requestsPerDay);
                }
                // Handle requestsPerHour alias
                if (typeof updates.rateLimiting.requestsPerHour === 'number') {
                    this.config.rateLimiting.requestsPerDay = Math.max(1, updates.rateLimiting.requestsPerHour);
                }
            }

            // Update features
            if (updates.features) {
                Object.keys(updates.features).forEach(feature => {
                    if (typeof updates.features[feature] === 'boolean') {
                        this.config.features[feature] = updates.features[feature];
                    }
                });
            }

            // Save updated configuration
            this.saveConfig();
            console.log('Configuration updated successfully');

            return { success: true };
        } catch (error) {
            console.error('Failed to update configuration:', error);
            throw new Error(`Configuration update failed: ${error.message}`);
        }
    }

    /**
     * Export Configuration
     */
    exportConfig(includeApiKey = false) {
        const exportConfig = { ...this.config };
        if (!includeApiKey) {
            delete exportConfig.apiKey;
        }
        return exportConfig;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIConfig;
} else {
    window.APIConfig = APIConfig;
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.repairAPIConfig = new APIConfig();
    window.repairAPIConfig.loadStoredConfig();
}
