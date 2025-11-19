/**
 * Groq Integration Module for REPAIR Protocol
 * Provides AI-powered analysis and guidance using Groq's fast inference API
 */

class GPTIntegration {
    constructor(apiConfig) {
        this.apiConfig = apiConfig || window.repairAPIConfig;
        this.conversationHistory = [];
        this.analysisCache = new Map();
        this.isInitialized = false;

        // Performance tracking
        this.metrics = {
            requestCount: 0,
            averageResponseTime: 0,
            successRate: 0,
            errors: []
        };

        // Current phase tracking
        this.currentPhase = 0;

        this.initialize();
    }

    async initialize() {
        try {
            console.log('Initializing Groq Integration...');

            if (!this.apiConfig) {
                throw new Error('API configuration not available');
            }

            // Test connection if API key is set
            if (this.apiConfig.getApiKey()) {
                const connectionTest = await this.testConnection();
                if (!connectionTest.success) {
                    console.warn('Groq API connection test failed:', connectionTest.error);
                }
            }

            this.isInitialized = true;
            console.log('Groq Integration initialized successfully');

        } catch (error) {
            console.error('Failed to initialize Groq Integration:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Main API Request Method
     */
    async makeRequest(messages, options = {}) {
        const startTime = Date.now();

        try {
            // Check rate limiting
            this.apiConfig.checkRateLimit();

            // Prepare request
            const requestConfig = this.prepareRequest(messages, options);

            // Make API call with retry logic
            const response = await this.executeWithRetry(
                () => this.executeAPICall(requestConfig),
                { maxRetries: 3 }
            );

            // Process response
            const processedResponse = this.processResponse(response);

            // Update metrics and history
            this.updateMetrics(startTime, true);
            this.recordConversation(messages, processedResponse);

            // Track usage
            this.apiConfig.recordRequest();
            if (response.usage) {
                this.apiConfig.trackUsage(response.usage.total_tokens);
            }

            return processedResponse;

        } catch (error) {
            this.updateMetrics(startTime, false, error);
            console.error('Request error:', error);
            return this.getFallbackResponse(error);
        }
    }

    prepareRequest(messages, options) {
        // Format messages
        const formattedMessages = this.formatMessages(messages);

        // Add conversation history if enabled
        if (this.apiConfig.isFeatureEnabled('conversationHistory') && this.conversationHistory.length > 0) {
            const recentHistory = this.conversationHistory.slice(-3);
            const historyMessages = recentHistory.flatMap(item => item.messages);
            formattedMessages.unshift(...historyMessages.slice(-5));
        }

        const requestPayload = {
            model: options.model || this.apiConfig.config.model,
            messages: formattedMessages,
            max_tokens: options.maxTokens || this.apiConfig.config.maxTokens,
            temperature: options.temperature !== undefined ? options.temperature : this.apiConfig.config.temperature,
            stream: options.stream || false
        };

        return {
            endpoint: this.apiConfig.getEndpointConfig(),
            payload: requestPayload,
            timeout: this.apiConfig.config.timeout
        };
    }

    async executeAPICall(requestConfig) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestConfig.timeout);

        try {
            const response = await fetch(requestConfig.endpoint.url, {
                method: 'POST',
                headers: requestConfig.endpoint.headers,
                body: JSON.stringify(requestConfig.payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API request failed: ${response.status} - ${errorData}`);
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async executeWithRetry(operation, options = {}) {
        const { maxRetries = 3, initialDelay = 1000, backoffMultiplier = 2 } = options;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }

                const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
                console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    processResponse(response) {
        try {
            return {
                content: response.choices[0]?.message?.content || '',
                finishReason: response.choices[0]?.finish_reason,
                usage: response.usage,
                model: response.model,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error processing response:', error);
            return {
                content: 'Sorry, I encountered an error processing the response.',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    /**
     * REPAIR Protocol Specific Methods
     */
    async analyzePhase(phaseIndex, formData) {
        const phaseAnalysisPrompts = this.getPhaseAnalysisPrompts();
        const currentPhase = phaseAnalysisPrompts[phaseIndex];

        if (!currentPhase) {
            console.warn(`No analysis prompt for phase ${phaseIndex}`);
            return null;
        }

        const contextualPrompt = this.buildContextualPrompt(currentPhase, formData, phaseIndex);

        try {
            const response = await this.makeRequest([
                { role: 'user', content: contextualPrompt }
            ], {
                temperature: 0.7,
                maxTokens: 1500
            });

            const analysis = this.parsePhaseAnalysis(response.content, phaseIndex);

            // Cache the analysis
            this.analysisCache.set(`phase_${phaseIndex}`, analysis);

            return analysis;

        } catch (error) {
            console.error(`Error analyzing phase ${phaseIndex}:`, error);
            return this.getFallbackAnalysis(phaseIndex);
        }
    }

    async provideFeedback(fieldName, content, phaseIndex) {
        if (!this.apiConfig.isFeatureEnabled('realTimeFeedback')) {
            return null;
        }

        // Rate limit feedback requests with caching
        const cacheKey = `feedback_${fieldName}_${content.slice(0, 50)}`;
        const cached = this.analysisCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 30000) {
            return cached;
        }

        const feedbackPrompt = this.buildFeedbackPrompt(fieldName, content, phaseIndex);

        try {
            const response = await this.makeRequest([
                { role: 'user', content: feedbackPrompt }
            ], {
                temperature: 0.6,
                maxTokens: 300
            });

            const feedback = this.parseFeedback(response.content);
            feedback.timestamp = Date.now();

            // Cache for 30 seconds
            this.analysisCache.set(cacheKey, feedback);

            return feedback;

        } catch (error) {
            console.error('Error providing feedback:', error);
            return null;
        }
    }

    async detectBias(content, context = '') {
        if (!this.apiConfig.isFeatureEnabled('biasDetection')) {
            return { biasLevel: 'unknown', suggestions: [] };
        }

        const biasPrompt = this.buildBiasDetectionPrompt(content, context);

        try {
            const response = await this.makeRequest([
                { role: 'user', content: biasPrompt }
            ], {
                temperature: 0.3,
                maxTokens: 400
            });

            return this.parseBiasAnalysis(response.content);

        } catch (error) {
            console.error('Error detecting bias:', error);
            return { biasLevel: 'unknown', suggestions: [], error: error.message };
        }
    }

    async analyzeEmotionalIntelligence(content, targetPhase) {
        if (!this.apiConfig.isFeatureEnabled('emotionalAnalysis')) {
            return { empathy: 0, sincerity: 0, completeness: 0 };
        }

        const emotionalPrompt = this.buildEmotionalAnalysisPrompt(content, targetPhase);

        try {
            const response = await this.makeRequest([
                { role: 'user', content: emotionalPrompt }
            ], {
                temperature: 0.4,
                maxTokens: 500
            });

            return this.parseEmotionalAnalysis(response.content);

        } catch (error) {
            console.error('Error analyzing emotional intelligence:', error);
            return { empathy: 0, sincerity: 0, completeness: 0, error: error.message };
        }
    }

    /**
     * Prompt Building Methods
     */
    getPhaseAnalysisPrompts() {
        return [
            // Phase 0: Assessment
            `Analyze this REPAIR Protocol assessment for completeness and readiness. Focus on:
            1. Clarity and specificity of harm description
            2. Appropriate severity assessment
            3. Genuine readiness indicators
            4. Missing critical information
            Provide specific, actionable feedback in JSON format with scores (0-1) and suggestions.`,

            // Phase 1: Recognize
            `Evaluate this recognition phase for authentic acknowledgment. Assess:
            1. Specific action identification without minimization
            2. Genuine responsibility acceptance without deflection
            3. Accurate emotional impact understanding
            4. Bias mitigation effectiveness
            Provide detailed analysis in JSON format with empathy and authenticity scores.`,

            // Phase 2: Examine
            `Analyze this examination phase for comprehensive impact understanding. Review:
            1. Complete direct impact assessment
            2. Secondary effect recognition
            3. Systemic implication awareness
            4. Logical consistency and depth
            Provide thorough analysis in JSON format with completeness and insight scores.`,

            // Phase 3: Prepare
            `Evaluate this preparation phase for authentic commitment. Examine:
            1. Clear, specific acknowledgment statements
            2. Meaningful, actionable change commitments
            3. Appropriate, realistic amends proposals
            4. Feasible implementation timeline
            Provide detailed feedback in JSON format with authenticity and feasibility scores.`,

            // Phase 4: Articulate
            `Assess this apology articulation for effectiveness and sincerity. Analyze:
            1. Complete structure adherence
            2. Emotional authenticity and appropriateness
            3. Specific, actionable commitments
            4. Respectful, non-defensive tone
            Provide comprehensive evaluation in JSON format with delivery and sincerity scores.`,

            // Phase 5: Implement
            `Review this implementation plan for realistic execution. Evaluate:
            1. Immediate action clarity and appropriateness
            2. Long-term change sustainability
            3. Progress tracking feasibility
            4. Accountability mechanism strength
            Provide implementation analysis in JSON format with feasibility and commitment scores.`,

            // Phase 6: Restore
            `Analyze this restoration plan for relationship healing effectiveness. Assess:
            1. Trust rebuilding metric appropriateness
            2. Healing indicator relevance and measurability
            3. Patience and respect for healing timeline
            4. Sustainable relationship improvement focus
            Provide restoration analysis in JSON format with healing potential and sustainability scores.`,

            // Phase 7: Contract
            `Evaluate this complete REPAIR contract for comprehensiveness and commitment. Review:
            1. All phase completion quality
            2. Overall coherence and consistency
            3. Realistic expectation setting
            4. Long-term success probability
            Provide final assessment in JSON format with overall effectiveness and sustainability scores.`
        ];
    }

    buildContextualPrompt(basePrompt, formData, phaseIndex) {
        const phaseName = ['Assessment', 'Recognize', 'Examine', 'Prepare', 'Articulate', 'Implement', 'Restore', 'Contract'][phaseIndex];
        const contextData = this.extractRelevantFormData(formData, phaseIndex);

        return `${basePrompt}

PHASE: ${phaseName} (${phaseIndex + 1}/8)

CONTEXT DATA:
${JSON.stringify(contextData, null, 2)}

RESPONSE FORMAT (JSON):
{
    "phase": "${phaseName}",
    "scores": {"overall": 0.0, "specific_metrics": {}},
    "insights": ["insight1", "insight2"],
    "suggestions": ["suggestion1", "suggestion2"],
    "warnings": ["warning1"],
    "status": "needs_improvement|good|excellent"
}`;
    }

    buildFeedbackPrompt(fieldName, content, phaseIndex) {
        const phaseContext = ['assessment', 'recognition', 'examination', 'preparation', 'articulation', 'implementation', 'restoration', 'contract'][phaseIndex];

        return `Provide real-time feedback on this ${fieldName} input for the ${phaseContext} phase:

CONTENT: "${content}"

Respond with brief, actionable feedback in JSON format:
{"quality": "poor|fair|good|excellent", "score": 0.0, "feedback": "brief feedback", "suggestion": "improvement tip"}`;
    }

    buildBiasDetectionPrompt(content, context) {
        return `Analyze this content for cognitive biases common in apologies:

CONTENT: "${content}"
CONTEXT: "${context}"

COMMON BIASES: Minimization, Intent fallacy, Comparative bias, Victim blaming, Self-pity

Respond in JSON:
{"biasLevel": "none|low|medium|high", "detectedBiases": [], "evidence": [], "suggestions": []}`;
    }

    buildEmotionalAnalysisPrompt(content, targetPhase) {
        return `Analyze the emotional intelligence of this content:

CONTENT: "${content}"
PHASE: ${targetPhase}

Evaluate (0.0-1.0 scale): Empathy, Sincerity, Completeness

Respond in JSON:
{"empathy": 0.0, "sincerity": 0.0, "completeness": 0.0, "analysis": "text", "improvements": []}`;
    }

    /**
     * Response Parsing Methods
     */
    parsePhaseAnalysis(content, phaseIndex) {
        try {
            const parsed = JSON.parse(content);
            return { phase: phaseIndex, ...parsed, timestamp: Date.now() };
        } catch (error) {
            console.error('Error parsing phase analysis:', error);
            return this.getFallbackAnalysis(phaseIndex);
        }
    }

    parseFeedback(content) {
        try {
            return JSON.parse(content);
        } catch (error) {
            return {
                quality: 'unknown',
                score: 0.5,
                feedback: 'Unable to analyze',
                suggestion: 'Continue with your input'
            };
        }
    }

    parseBiasAnalysis(content) {
        try {
            return JSON.parse(content);
        } catch (error) {
            return {
                biasLevel: 'unknown',
                detectedBiases: [],
                suggestions: []
            };
        }
    }

    parseEmotionalAnalysis(content) {
        try {
            return JSON.parse(content);
        } catch (error) {
            return {
                empathy: 0.5,
                sincerity: 0.5,
                completeness: 0.5,
                analysis: 'Unable to analyze',
                improvements: []
            };
        }
    }

    /**
     * Utility Methods
     */
    getFallbackAnalysis(phaseIndex) {
        const phaseNames = ['Assessment', 'Recognition', 'Examination', 'Preparation', 'Articulation', 'Implementation', 'Restoration', 'Contract'];

        return {
            phase: phaseIndex,
            scores: { overall: 0.5, specific_metrics: {} },
            insights: [`Continue working on the ${phaseNames[phaseIndex]} phase`],
            suggestions: ['Take your time and be thorough'],
            warnings: [],
            status: 'needs_improvement',
            fallback: true,
            timestamp: Date.now()
        };
    }

    getFallbackResponse(error) {
        return {
            content: 'I\'m currently unable to respond. You can continue with the REPAIR Protocol independently.',
            offline: true,
            error: error.message,
            timestamp: Date.now()
        };
    }

    extractRelevantFormData(formData, phaseIndex) {
        const phaseFields = [
            ['harmDescription', 'affectedParty', 'harmSeverity', 'readiness'],
            ['specificActions', 'responsibility', 'emotionalImpact', 'biasChecklist'],
            ['directImpacts', 'secondaryEffects', 'systemicImplications'],
            ['acknowledgmentStatement', 'changeCommitment', 'amendsProposal', 'timeline'],
            ['apologyText'],
            ['immediateActions', 'longTermChanges', 'progressCheckins'],
            ['trustMetrics', 'healingIndicators'],
            Object.keys(formData)
        ];

        const relevantFields = phaseFields[phaseIndex] || [];
        const extracted = {};

        relevantFields.forEach(field => {
            if (formData[field] !== undefined) {
                extracted[field] = formData[field];
            }
        });

        return extracted;
    }

    formatMessages(messages) {
        if (typeof messages === 'string') {
            return [{ role: 'user', content: messages }];
        }

        if (Array.isArray(messages)) {
            return messages.map(msg =>
                typeof msg === 'string' ? { role: 'user', content: msg } : msg
            );
        }

        return [messages];
    }

    updateMetrics(startTime, success, error = null) {
        const duration = Date.now() - startTime;
        this.metrics.requestCount++;

        if (success) {
            this.metrics.averageResponseTime =
                (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + duration) /
                this.metrics.requestCount;
        } else {
            this.metrics.errors.push({
                timestamp: Date.now(),
                error: error?.message || 'Unknown error',
                duration
            });
        }

        this.metrics.successRate =
            (this.metrics.requestCount - this.metrics.errors.length) /
            this.metrics.requestCount;
    }

    recordConversation(messages, response) {
        if (this.apiConfig.isFeatureEnabled('conversationHistory')) {
            this.conversationHistory.push({
                timestamp: Date.now(),
                messages,
                response,
                phase: this.currentPhase
            });

            // Limit history size
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }
        }
    }

    /**
     * Connection Testing
     */
    async testConnection() {
        try {
            return await this.apiConfig.testConnection();
        } catch (error) {
            console.error('Connection test failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Public Interface Methods
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            metrics: this.metrics,
            apiStatus: this.apiConfig.getStatus(),
            conversationLength: this.conversationHistory.length,
            currentPhase: this.currentPhase
        };
    }

    setPhase(phaseIndex) {
        this.currentPhase = phaseIndex;
    }

    clearHistory() {
        this.conversationHistory = [];
        this.analysisCache.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GPTIntegration;
} else {
    window.GPTIntegration = GPTIntegration;
}
