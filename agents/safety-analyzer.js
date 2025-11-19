/**
 * REPAIR Protocol - Safety Analyzer Agent
 * AI-powered abuse pattern and safety risk detection
 * Designed to identify toxic relationship indicators and recommend LIBERATE vs REPAIR
 */

class SafetyAnalyzer {
    constructor() {
        // Abuse pattern dictionaries
        this.abusePatterns = {
            physical: {
                keywords: [
                    'hit', 'slap', 'push', 'shove', 'punch', 'kick', 'choke', 'strangle',
                    'grab', 'restrain', 'force', 'hurt', 'bruise', 'injured', 'attacked',
                    'threatened violence', 'weapon', 'physical harm', 'afraid for safety'
                ],
                weight: 10, // Highest priority
                severity: 'CRITICAL'
            },
            emotional: {
                keywords: [
                    'worthless', 'stupid', 'idiot', 'useless', 'pathetic', 'crazy',
                    'insane', 'dramatic', 'too sensitive', 'overreacting', 'making things up',
                    'no one else would want', 'lucky to have', 'name calling', 'insults',
                    'humiliate', 'embarrass', 'put down', 'belittle', 'degrade'
                ],
                weight: 7,
                severity: 'HIGH'
            },
            gaslighting: {
                keywords: [
                    'never happened', 'imagining things', 'making it up', 'didn\'t say that',
                    'you\'re crazy', 'questioning reality', 'questioning memory',
                    'twisting words', 'lying about', 'deny', 'denied saying', 'rewrite history',
                    'not how it happened', 'you\'re remembering wrong'
                ],
                weight: 8,
                severity: 'HIGH'
            },
            isolation: {
                keywords: [
                    'keep me from', 'won\'t let me see', 'doesn\'t want me around',
                    'gets angry when I see', 'jealous of my friends', 'isolate', 'separated from',
                    'cut off from', 'no contact with', 'control who I see', 'control where I go',
                    'monitors my', 'tracks my', 'checks my phone', 'reads my messages'
                ],
                weight: 7,
                severity: 'HIGH'
            },
            financial: {
                keywords: [
                    'controls money', 'won\'t let me work', 'takes my paycheck',
                    'withholds money', 'financial control', 'can\'t access accounts',
                    'refuses to let me', 'financial abuse', 'economically dependent',
                    'sabotages my job', 'prevents me from working'
                ],
                weight: 8,
                severity: 'HIGH'
            },
            coercion: {
                keywords: [
                    'threatened to', 'said they would', 'force me to', 'pressure',
                    'coerce', 'intimidate', 'blackmail', 'manipulate', 'guilt trip',
                    'if you don\'t', 'or else', 'you better', 'you have to',
                    'made me feel like', 'no choice', 'afraid to say no'
                ],
                weight: 8,
                severity: 'HIGH'
            },
            stalking: {
                keywords: [
                    'follows me', 'shows up uninvited', 'monitors my location',
                    'tracks me', 'watches my house', 'won\'t leave me alone',
                    'constant calls', 'excessive texting', 'surveillance', 'GPS tracker',
                    'cameras', 'spying', 'stalking', 'harassing'
                ],
                weight: 9,
                severity: 'CRITICAL'
            },
            sexual: {
                keywords: [
                    'forced me', 'didn\'t want to', 'said no but', 'sexual coercion',
                    'pressured for sex', 'guilted into', 'ignored my no', 'wouldn\'t stop',
                    'sexual assault', 'raped', 'violated', 'unwanted touching',
                    'didn\'t consent', 'made me do'
                ],
                weight: 10,
                severity: 'CRITICAL'
            }
        };

        // Red flag phrases that indicate danger
        this.dangerPhrases = [
            'afraid of them',
            'fear for my safety',
            'scared of what they\'ll do',
            'threatened to kill',
            'threatened suicide',
            'afraid to leave',
            'worried about retaliation',
            'escalating violence',
            'getting worse',
            'more frequent',
            'more intense'
        ];

        // Healthy relationship indicators (for comparison)
        this.healthyIndicators = [
            'respects my boundaries',
            'listens to me',
            'supports my',
            'encourages me',
            'apologizes',
            'takes responsibility',
            'works together',
            'compromise',
            'mutual respect',
            'feels safe'
        ];
    }

    /**
     * Main analysis method - comprehensive safety assessment
     * @param {string} text - Document text to analyze
     * @returns {Object} Safety analysis results
     */
    analyzeSafety(text) {
        if (!text || typeof text !== 'string') {
            return this.createEmptySafetyAnalysis('No valid text provided');
        }

        const normalizedText = text.toLowerCase();

        const analysis = {
            id: this.generateAnalysisId(),
            timestamp: new Date().toISOString(),
            safetyLevel: 'UNKNOWN',
            safetyScore: 0, // 0-100, where 100 is maximum danger
            recommendedProtocol: 'ASSESSMENT_NEEDED',
            abusePatterns: this.detectAbusePatterns(normalizedText, text),
            dangerIndicators: this.detectDangerIndicators(normalizedText, text),
            healthyIndicators: this.detectHealthyIndicators(normalizedText),
            detailedAssessment: {},
            recommendations: [],
            crisisResources: []
        };

        // Calculate safety score
        analysis.safetyScore = this.calculateSafetyScore(analysis);

        // Determine safety level
        analysis.safetyLevel = this.categorizeSafetyLevel(analysis.safetyScore);

        // Recommend protocol
        analysis.recommendedProtocol = this.recommendProtocol(analysis);

        // Generate specific recommendations
        analysis.recommendations = this.generateSafetyRecommendations(analysis);

        // Add crisis resources if needed
        if (analysis.safetyScore >= 60) {
            analysis.crisisResources = this.getCrisisResources();
        }

        // Detailed breakdown
        analysis.detailedAssessment = {
            criticalPatterns: analysis.abusePatterns.filter(p => p.severity === 'CRITICAL'),
            highRiskPatterns: analysis.abusePatterns.filter(p => p.severity === 'HIGH'),
            dangerSignsCount: analysis.dangerIndicators.length,
            healthySignsCount: analysis.healthyIndicators.length,
            overallTrend: this.assessOverallTrend(analysis)
        };

        return analysis;
    }

    /**
     * Detect specific abuse patterns
     */
    detectAbusePatterns(normalizedText, originalText) {
        const detected = [];

        Object.keys(this.abusePatterns).forEach(patternType => {
            const pattern = this.abusePatterns[patternType];
            const matches = [];

            pattern.keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${this.escapeRegex(keyword)}`, 'gi');
                const found = originalText.match(regex);

                if (found) {
                    matches.push({
                        keyword,
                        count: found.length,
                        context: this.extractContext(originalText, keyword, 60)
                    });
                }
            });

            if (matches.length > 0) {
                detected.push({
                    type: patternType,
                    severity: pattern.severity,
                    weight: pattern.weight,
                    matchCount: matches.reduce((sum, m) => sum + m.count, 0),
                    examples: matches.slice(0, 3), // Limit to 3 examples
                    description: this.getPatternDescription(patternType)
                });
            }
        });

        // Sort by severity and weight
        return detected.sort((a, b) => {
            if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
            if (b.severity === 'CRITICAL' && a.severity !== 'CRITICAL') return 1;
            return b.weight - a.weight;
        });
    }

    /**
     * Detect specific danger indicators
     */
    detectDangerIndicators(normalizedText, originalText) {
        const detected = [];

        this.dangerPhrases.forEach(phrase => {
            if (normalizedText.includes(phrase.toLowerCase())) {
                detected.push({
                    phrase,
                    context: this.extractContext(originalText, phrase, 80),
                    severity: 'CRITICAL'
                });
            }
        });

        return detected;
    }

    /**
     * Detect healthy relationship indicators
     */
    detectHealthyIndicators(normalizedText) {
        const detected = [];

        this.healthyIndicators.forEach(indicator => {
            if (normalizedText.includes(indicator.toLowerCase())) {
                detected.push(indicator);
            }
        });

        return detected;
    }

    /**
     * Calculate overall safety score (0-100, higher = more dangerous)
     */
    calculateSafetyScore(analysis) {
        let score = 0;

        // Critical patterns contribute heavily
        analysis.abusePatterns.forEach(pattern => {
            if (pattern.severity === 'CRITICAL') {
                score += pattern.weight * pattern.matchCount * 2;
            } else if (pattern.severity === 'HIGH') {
                score += pattern.weight * pattern.matchCount;
            }
        });

        // Danger indicators are serious
        score += analysis.dangerIndicators.length * 15;

        // Reduce score slightly if healthy indicators present
        score -= analysis.healthyIndicators.length * 2;

        // Cap at 100
        return Math.min(100, Math.max(0, score));
    }

    /**
     * Categorize safety level
     */
    categorizeSafetyLevel(score) {
        if (score >= 80) return 'CRITICAL_DANGER';
        if (score >= 60) return 'HIGH_RISK';
        if (score >= 40) return 'MODERATE_CONCERN';
        if (score >= 20) return 'LOW_CONCERN';
        return 'APPEARS_SAFE';
    }

    /**
     * Recommend protocol based on analysis
     */
    recommendProtocol(analysis) {
        // Critical danger = always LIBERATE
        if (analysis.safetyScore >= 80 || analysis.detailedAssessment?.criticalPatterns?.length > 0) {
            return 'LIBERATE_URGENT';
        }

        // High risk = strongly recommend LIBERATE
        if (analysis.safetyScore >= 60) {
            return 'LIBERATE_RECOMMENDED';
        }

        // Moderate concerns = suggest assessment, lean LIBERATE
        if (analysis.safetyScore >= 40) {
            return 'ASSESSMENT_LEAN_LIBERATE';
        }

        // Low concerns = assessment needed
        if (analysis.safetyScore >= 20) {
            return 'ASSESSMENT_NEEDED';
        }

        // Appears safe = REPAIR may be viable
        return 'REPAIR_VIABLE';
    }

    /**
     * Generate safety recommendations
     */
    generateSafetyRecommendations(analysis) {
        const recommendations = [];

        if (analysis.safetyScore >= 80) {
            recommendations.push({
                priority: 'CRITICAL',
                action: 'Seek immediate help',
                description: 'Contact domestic violence hotline, create safety plan, consider emergency shelter',
                resources: true
            });

            recommendations.push({
                priority: 'CRITICAL',
                action: 'Do not confront abuser alone',
                description: 'Confrontation can escalate danger. Work with professionals to plan safe exit',
                resources: false
            });

            recommendations.push({
                priority: 'CRITICAL',
                action: 'Document everything safely',
                description: 'Keep records in secure location abuser cannot access. Photos, messages, incidents',
                resources: false
            });
        }

        if (analysis.safetyScore >= 60) {
            recommendations.push({
                priority: 'HIGH',
                action: 'Consult with domestic violence specialist',
                description: 'Professional assessment of your situation and safety planning',
                resources: true
            });

            recommendations.push({
                priority: 'HIGH',
                action: 'Build support network quietly',
                description: 'Connect with trusted friends/family without alerting abuser',
                resources: false
            });

            recommendations.push({
                priority: 'HIGH',
                action: 'Secure important documents',
                description: 'ID, birth certificates, financial docs, keep copies in safe place',
                resources: false
            });
        }

        if (analysis.safetyScore >= 40) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Take assessment seriously',
                description: 'Use the full protocol assessment to determine best path forward',
                resources: false
            });

            recommendations.push({
                priority: 'MEDIUM',
                action: 'Seek therapy/counseling',
                description: 'Professional support to process experiences and clarify needs',
                resources: false
            });

            recommendations.push({
                priority: 'MEDIUM',
                action: 'Establish firmer boundaries',
                description: 'Begin setting and enforcing boundaries about acceptable behavior',
                resources: false
            });
        }

        if (analysis.detailedAssessment?.criticalPatterns?.length > 0) {
            analysis.detailedAssessment.criticalPatterns.forEach(pattern => {
                recommendations.push({
                    priority: 'CRITICAL',
                    action: `Address ${pattern.type} abuse`,
                    description: `${pattern.description} - This requires professional intervention`,
                    resources: true
                });
            });
        }

        return recommendations;
    }

    /**
     * Get crisis resources
     */
    getCrisisResources() {
        return [
            {
                name: 'National Domestic Violence Hotline',
                contact: '1-800-799-7233',
                type: 'phone',
                hours: '24/7',
                description: 'Confidential support, safety planning, and resource referrals'
            },
            {
                name: 'Crisis Text Line',
                contact: 'Text HOME to 741741',
                type: 'text',
                hours: '24/7',
                description: 'Text-based crisis support with trained counselors'
            },
            {
                name: 'National Sexual Assault Hotline',
                contact: '1-800-656-4673',
                type: 'phone',
                hours: '24/7',
                description: 'Support for sexual assault survivors'
            },
            {
                name: 'Online Chat Support',
                contact: 'https://www.thehotline.org',
                type: 'web',
                hours: '24/7',
                description: 'Anonymous online chat with advocates'
            },
            {
                name: 'National Suicide Prevention Lifeline',
                contact: '988',
                type: 'phone',
                hours: '24/7',
                description: 'Crisis intervention and suicide prevention'
            }
        ];
    }

    /**
     * Assess overall trend (improving vs worsening)
     */
    assessOverallTrend(analysis) {
        const criticalCount = analysis.detailedAssessment?.criticalPatterns?.length || 0;
        const highRiskCount = analysis.detailedAssessment?.highRiskPatterns?.length || 0;
        const healthyCount = analysis.healthyIndicators.length;

        if (criticalCount > 0 || analysis.dangerIndicators.some(d => d.phrase.includes('escalating') || d.phrase.includes('getting worse'))) {
            return 'WORSENING';
        }

        if (highRiskCount > 3 && healthyCount === 0) {
            return 'CONCERNING';
        }

        if (healthyCount > highRiskCount) {
            return 'MIXED_WITH_POSITIVE_SIGNS';
        }

        return 'UNCLEAR';
    }

    /**
     * Get pattern description
     */
    getPatternDescription(patternType) {
        const descriptions = {
            physical: 'Physical violence or threats of violence - extremely dangerous and never acceptable',
            emotional: 'Emotional abuse damages self-esteem and psychological wellbeing',
            gaslighting: 'Psychological manipulation making you question reality and sanity',
            isolation: 'Cutting you off from support systems to increase control',
            financial: 'Controlling money to create dependence and prevent independence',
            coercion: 'Forcing compliance through threats, pressure, or manipulation',
            stalking: 'Unwanted surveillance and harassment - serious safety concern',
            sexual: 'Sexual violence or coercion - criminal behavior requiring immediate help'
        };

        return descriptions[patternType] || 'Concerning pattern detected';
    }

    /**
     * Extract context around keyword
     */
    extractContext(text, keyword, contextLength = 60) {
        const regex = new RegExp(`\\b${this.escapeRegex(keyword)}`, 'i');
        const match = text.match(regex);

        if (!match) return keyword;

        const index = match.index;
        const start = Math.max(0, index - contextLength);
        const end = Math.min(text.length, index + keyword.length + contextLength);

        let context = text.substring(start, end);
        if (start > 0) context = '...' + context;
        if (end < text.length) context = context + '...';

        return context;
    }

    /**
     * Utility methods
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    generateAnalysisId() {
        return 'safety_analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    createEmptySafetyAnalysis(error) {
        return {
            error,
            safetyLevel: 'UNKNOWN',
            safetyScore: 0,
            recommendedProtocol: 'ASSESSMENT_NEEDED',
            abusePatterns: [],
            dangerIndicators: [],
            healthyIndicators: [],
            recommendations: [],
            crisisResources: []
        };
    }

    /**
     * AI-Enhanced Safety Analysis (optional - requires Groq API)
     */
    async analyzeWithAI(text, apiConfig) {
        if (!apiConfig || !apiConfig.getApiKey()) {
            throw new Error('AI analysis requires API configuration');
        }

        try {
            // Get base analysis first
            const baseAnalysis = this.analyzeSafety(text);

            // Use GPT integration for deeper insights
            const gptIntegration = new GPTIntegration(apiConfig);
            await gptIntegration.initialize();

            const aiPrompt = `Analyze this relationship document for abuse patterns and safety concerns:

${text}

Provide analysis covering:
1. Abuse patterns detected (physical, emotional, financial, sexual, coercive control)
2. Safety risk level (critical/high/moderate/low)
3. Red flags or warning signs
4. Recommended action (REPAIR vs LIBERATE protocol)
5. Specific safety concerns and recommendations

Be direct and protective. If abuse is present, state it clearly.`;

            const aiResponse = await gptIntegration.makeRequest([
                {
                    role: 'system',
                    content: 'You are a domestic violence specialist and trauma-informed counselor. Analyze relationships for abuse patterns with care and directness. Prioritize safety above all else.'
                },
                {
                    role: 'user',
                    content: aiPrompt
                }
            ]);

            return {
                ...baseAnalysis,
                aiEnhanced: true,
                aiInsights: aiResponse,
                aiTimestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('AI safety analysis failed:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafetyAnalyzer;
} else if (typeof window !== 'undefined') {
    window.SafetyAnalyzer = SafetyAnalyzer;
}
