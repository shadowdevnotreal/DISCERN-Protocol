/**
 * REPAIR Protocol - Document Analyzer Agent
 * AI-powered document sentiment and quality analysis
 * Inspired by ChatConvert-Toolkit ensemble approach
 */

class DocumentAnalyzer {
    constructor() {
        // Keyword dictionaries for sentiment detection
        this.keywords = {
            sincerity: {
                high: [
                    'acknowledge', 'responsibility', 'accountable', 'commit', 'committed',
                    'promise', 'will', 'shall', 'dedicated', 'determined', 'ensure',
                    'guarantee', 'pledge', 'vow', 'oath', 'swear', 'undertake'
                ],
                medium: [
                    'intend', 'plan', 'aim', 'strive', 'endeavor', 'work towards',
                    'focus on', 'prioritize', 'make effort'
                ],
                low: [
                    'try', 'maybe', 'might', 'possibly', 'hope', 'wish', 'could',
                    'should', 'would like', 'if possible', 'attempt', 'see if'
                ]
            },
            empathy: {
                high: [
                    'understand', 'recognize', 'realize', 'appreciate', 'hurt', 'pain',
                    'suffering', 'impact', 'affected', 'feel', 'felt', 'sorry', 'regret',
                    'remorse', 'apologize', 'harm', 'damage', 'wrong', 'mistake',
                    'deeply', 'sincerely', 'truly'
                ],
                medium: [
                    'see', 'know', 'aware', 'conscious', 'notice', 'observed',
                    'effect', 'consequence', 'result'
                ],
                low: [
                    'but', 'however', 'though', 'although', 'nevertheless',
                    'nonetheless', 'still', 'yet', 'anyway'
                ]
            },
            redFlags: {
                defensive: [
                    'excuse', 'justify', 'justification', 'blame', 'fault',
                    'not my fault', 'wasn\'t me', 'didn\'t mean', 'not intentional',
                    'you made me', 'you caused', 'your fault', 'you\'re to blame',
                    'if you hadn\'t', 'you should have'
                ],
                vague: [
                    'soon', 'eventually', 'someday', 'sometime', 'when I can',
                    'as soon as possible', 'when possible', 'in the future',
                    'down the road', 'at some point', 'one day'
                ],
                minimizing: [
                    'just', 'only', 'simply', 'merely', 'not a big deal',
                    'overreacting', 'too sensitive', 'dramatic', 'exaggerating',
                    'making a big deal', 'blowing out of proportion'
                ],
                insincere: [
                    'if I hurt', 'if you felt', 'if it seemed', 'if that\'s how',
                    'I\'m sorry you feel', 'I\'m sorry if', 'mistakes were made',
                    'regrettable', 'unfortunate situation'
                ]
            },
            positive: [
                'love', 'care', 'respect', 'trust', 'honest', 'genuine', 'authentic',
                'transparent', 'open', 'committed', 'dedicated', 'support', 'help',
                'improve', 'better', 'change', 'grow', 'learn', 'heal', 'restore'
            ],
            negative: [
                'hate', 'anger', 'resentment', 'bitter', 'hostile', 'aggressive',
                'defensive', 'denial', 'refuse', 'won\'t', 'can\'t', 'impossible',
                'never', 'always', 'nothing', 'everything'
            ]
        };

        // REPAIR Protocol phases for completeness check
        this.repairPhases = [
            { name: 'RECOGNIZE', keywords: ['recognize', 'acknowledge', 'admit', 'accept responsibility'] },
            { name: 'EXAMINE', keywords: ['examine', 'analyze', 'understand', 'impact', 'root cause'] },
            { name: 'PREPARE', keywords: ['prepare', 'plan', 'strategy', 'amends', 'apology'] },
            { name: 'ARTICULATE', keywords: ['articulate', 'communicate', 'express', 'deliver', 'apologize'] },
            { name: 'IMPLEMENT', keywords: ['implement', 'action', 'change', 'behavior', 'commit'] },
            { name: 'RESTORE', keywords: ['restore', 'rebuild', 'trust', 'relationship', 'healing'] }
        ];
    }

    /**
     * Main analysis method - analyzes a document comprehensively
     * @param {string} text - The document text to analyze
     * @returns {Object} Comprehensive analysis results
     */
    analyze(text) {
        const startTime = Date.now();

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return this.createEmptyAnalysis('No valid text provided');
        }

        const normalizedText = text.toLowerCase();

        const analysis = {
            id: this.generateAnalysisId(),
            timestamp: new Date().toISOString(),
            textLength: text.length,
            wordCount: this.countWords(text),
            scores: {
                sentiment: this.analyzeSentiment(normalizedText),
                sincerity: this.analyzeSincerity(normalizedText),
                empathy: this.analyzeEmpathy(normalizedText),
                completeness: this.analyzeCompleteness(normalizedText, text)
            },
            redFlags: this.detectRedFlags(normalizedText, text),
            recommendations: [],
            processingTime: 0
        };

        // Generate recommendations based on scores and red flags
        analysis.recommendations = this.generateRecommendations(analysis);

        // Calculate processing time
        analysis.processingTime = Date.now() - startTime;

        return analysis;
    }

    /**
     * Analyze overall sentiment using keyword-based approach
     */
    analyzeSentiment(text) {
        let score = 0;
        const details = [];

        // Count positive keywords
        let positiveCount = 0;
        this.keywords.positive.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                positiveCount += matches.length;
                details.push(`Positive: "${word}" (${matches.length}x)`);
            }
        });

        // Count negative keywords
        let negativeCount = 0;
        this.keywords.negative.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                negativeCount += matches.length;
                details.push(`Negative: "${word}" (${matches.length}x)`);
            }
        });

        // Calculate sentiment score (-1.0 to 1.0)
        const total = positiveCount + negativeCount;
        if (total > 0) {
            score = (positiveCount - negativeCount) / total;
        }

        // Adjust for context
        if (text.includes('apolog') || text.includes('sorry') || text.includes('regret')) {
            score = Math.min(score + 0.2, 1.0); // Apologies are positive in REPAIR context
        }

        return {
            score: parseFloat(score.toFixed(2)),
            category: this.categorizeSentiment(score),
            positiveCount,
            negativeCount,
            details: details.slice(0, 10) // Limit details
        };
    }

    /**
     * Analyze sincerity level (0-100)
     */
    analyzeSincerity(text) {
        let score = 50; // Start neutral
        const indicators = [];

        // High sincerity keywords
        let highCount = 0;
        this.keywords.sincerity.high.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                highCount += matches.length;
                indicators.push(`Strong commitment: "${word}"`);
            }
        });

        // Medium sincerity keywords
        let mediumCount = 0;
        this.keywords.sincerity.medium.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                mediumCount += matches.length;
            }
        });

        // Low sincerity keywords (penalty)
        let lowCount = 0;
        this.keywords.sincerity.low.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                lowCount += matches.length;
                indicators.push(`Weak commitment: "${word}"`);
            }
        });

        // Calculate score
        score += (highCount * 8) + (mediumCount * 3) - (lowCount * 10);

        // Bonus for specific timeframes
        const timeframePatterns = [
            /\d+\s*(day|week|month)s?/gi,
            /by\s+(january|february|march|april|may|june|july|august|september|october|november|december)/gi,
            /on\s+\d{1,2}\/\d{1,2}\/\d{4}/gi
        ];

        timeframePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                score += matches.length * 5;
                indicators.push(`Specific timeframe: ${matches[0]}`);
            }
        });

        // Cap score at 0-100
        score = Math.max(0, Math.min(100, score));

        return {
            score: Math.round(score),
            category: this.categorizeScore(score),
            indicators: indicators.slice(0, 5),
            highCommitmentCount: highCount,
            weakCommitmentCount: lowCount
        };
    }

    /**
     * Analyze empathy level (0-100)
     */
    analyzeEmpathy(text) {
        let score = 50; // Start neutral
        const markers = [];

        // High empathy keywords
        let highCount = 0;
        this.keywords.empathy.high.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                highCount += matches.length;
                if (markers.length < 5) {
                    markers.push(`Empathy marker: "${word}"`);
                }
            }
        });

        // Medium empathy keywords
        let mediumCount = 0;
        this.keywords.empathy.medium.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                mediumCount += matches.length;
            }
        });

        // Low empathy keywords (penalty - these are dismissive words)
        let lowCount = 0;
        this.keywords.empathy.low.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                lowCount += matches.length;
                if (markers.length < 5) {
                    markers.push(`Dismissive word: "${word}"`);
                }
            }
        });

        // Calculate score
        score += (highCount * 7) + (mediumCount * 3) - (lowCount * 8);

        // Bonus for acknowledging specific impacts
        const impactPhrases = [
            'caused you pain', 'hurt you', 'affected you', 'made you feel',
            'understand your', 'recognize your', 'see how', 'realize how'
        ];

        impactPhrases.forEach(phrase => {
            if (text.includes(phrase)) {
                score += 8;
                markers.push(`Impact acknowledgment: "${phrase}"`);
            }
        });

        // Cap score at 0-100
        score = Math.max(0, Math.min(100, score));

        return {
            score: Math.round(score),
            category: this.categorizeScore(score),
            markers: markers.slice(0, 5),
            empathyMarkerCount: highCount,
            dismissiveCount: lowCount
        };
    }

    /**
     * Analyze completeness (0-100) - checks if all REPAIR phases are addressed
     */
    analyzeCompleteness(normalizedText, originalText) {
        let score = 0;
        const phasesFound = [];
        const missing = [];

        // Check each REPAIR phase
        this.repairPhases.forEach(phase => {
            let phaseScore = 0;
            const phaseIndicators = [];

            phase.keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
                if (normalizedText.match(regex)) {
                    phaseScore += 20;
                    phaseIndicators.push(keyword);
                }
            });

            // Also check if phase name is explicitly mentioned
            if (originalText.includes(`PHASE`) && originalText.includes(phase.name)) {
                phaseScore += 30;
                phaseIndicators.push(`${phase.name} phase mentioned`);
            }

            if (phaseScore > 0) {
                phasesFound.push({
                    phase: phase.name,
                    score: Math.min(100, phaseScore),
                    indicators: phaseIndicators
                });
                score += Math.min(100, phaseScore);
            } else {
                missing.push(phase.name);
            }
        });

        // Average score across all phases
        score = Math.round(score / this.repairPhases.length);

        // Bonus for document structure
        if (originalText.includes('===') || originalText.includes('---')) {
            score = Math.min(100, score + 10);
        }

        // Bonus for specific dates and signatures
        if (originalText.match(/Date:\s*\d{1,2}\/\d{1,2}\/\d{4}/)) {
            score = Math.min(100, score + 5);
        }

        return {
            score: Math.round(score),
            category: this.categorizeCompleteness(score),
            phasesFound: phasesFound.map(p => p.phase),
            missing,
            details: phasesFound
        };
    }

    /**
     * Detect red flags in the document
     */
    detectRedFlags(normalizedText, originalText) {
        const flags = [];

        // Defensive language
        let defensiveCount = 0;
        const defensiveExamples = [];
        this.keywords.redFlags.defensive.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = originalText.match(regex);
            if (matches) {
                defensiveCount += matches.length;
                if (defensiveExamples.length < 3) {
                    defensiveExamples.push(this.extractContext(originalText, word));
                }
            }
        });

        if (defensiveCount > 0) {
            flags.push({
                type: 'defensive_language',
                severity: defensiveCount > 2 ? 'high' : 'medium',
                count: defensiveCount,
                description: `Defensive or blame-shifting language detected (${defensiveCount} instances)`,
                examples: defensiveExamples
            });
        }

        // Vague commitments
        let vagueCount = 0;
        const vagueExamples = [];
        this.keywords.redFlags.vague.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = normalizedText.match(regex);
            if (matches) {
                vagueCount += matches.length;
                if (vagueExamples.length < 3) {
                    vagueExamples.push(this.extractContext(originalText, word));
                }
            }
        });

        if (vagueCount > 0) {
            flags.push({
                type: 'vague_commitments',
                severity: vagueCount > 3 ? 'high' : 'medium',
                count: vagueCount,
                description: `Vague timeframes or commitments detected (${vagueCount} instances)`,
                examples: vagueExamples
            });
        }

        // Minimizing language
        let minimizingCount = 0;
        const minimizingExamples = [];
        this.keywords.redFlags.minimizing.forEach(word => {
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const matches = normalizedText.match(regex);
            if (matches) {
                minimizingCount += matches.length;
                if (minimizingExamples.length < 3) {
                    minimizingExamples.push(this.extractContext(originalText, word));
                }
            }
        });

        if (minimizingCount > 0) {
            flags.push({
                type: 'minimizing_harm',
                severity: 'high',
                count: minimizingCount,
                description: `Minimizing or dismissive language detected (${minimizingCount} instances)`,
                examples: minimizingExamples
            });
        }

        // Insincere apologies
        let insincereCount = 0;
        const insincereExamples = [];
        this.keywords.redFlags.insincere.forEach(word => {
            const regex = new RegExp(this.escapeRegex(word), 'gi');
            const matches = originalText.match(regex);
            if (matches) {
                insincereCount += matches.length;
                if (insincereExamples.length < 3) {
                    insincereExamples.push(this.extractContext(originalText, word));
                }
            }
        });

        if (insincereCount > 0) {
            flags.push({
                type: 'insincere_apology',
                severity: 'high',
                count: insincereCount,
                description: `Non-apology or conditional apology detected (${insincereCount} instances)`,
                examples: insincereExamples
            });
        }

        return flags;
    }

    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        // Sincerity recommendations
        if (analysis.scores.sincerity.score < 60) {
            recommendations.push({
                category: 'sincerity',
                priority: 'high',
                suggestion: 'Strengthen commitments with specific, concrete language',
                example: 'Change "I will try to improve" to "I will attend weekly counseling sessions starting March 1st"'
            });
        }

        // Empathy recommendations
        if (analysis.scores.empathy.score < 60) {
            recommendations.push({
                category: 'empathy',
                priority: 'high',
                suggestion: 'Acknowledge the specific impact and harm caused',
                example: 'Add statements like "I understand this caused you pain" or "I recognize how my actions affected you"'
            });
        }

        // Completeness recommendations
        if (analysis.scores.completeness.missing.length > 0) {
            recommendations.push({
                category: 'completeness',
                priority: 'medium',
                suggestion: `Address missing REPAIR phases: ${analysis.scores.completeness.missing.join(', ')}`,
                example: 'Ensure your document covers all six phases of the REPAIR Protocol'
            });
        }

        // Red flag recommendations
        analysis.redFlags.forEach(flag => {
            if (flag.severity === 'high') {
                recommendations.push({
                    category: 'red_flag',
                    priority: 'critical',
                    suggestion: `Remove ${flag.type.replace(/_/g, ' ')}: ${flag.description}`,
                    example: flag.examples[0] || 'See detected instances'
                });
            }
        });

        // Sentiment recommendations
        if (analysis.scores.sentiment.score < 0) {
            recommendations.push({
                category: 'sentiment',
                priority: 'medium',
                suggestion: 'Adjust tone to be more constructive and forward-looking',
                example: 'Focus on healing and restoration rather than dwelling on negativity'
            });
        }

        // Sort by priority
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }

    /**
     * Extract context around a keyword for examples
     */
    extractContext(text, keyword, contextLength = 50) {
        const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'i');
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

    countWords(text) {
        return text.trim().split(/\s+/).length;
    }

    categorizeSentiment(score) {
        if (score > 0.3) return 'positive';
        if (score < -0.3) return 'negative';
        return 'neutral';
    }

    categorizeScore(score) {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    }

    categorizeCompleteness(score) {
        if (score >= 90) return 'complete';
        if (score >= 60) return 'partial';
        return 'incomplete';
    }

    generateAnalysisId() {
        return 'doc_analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    createEmptyAnalysis(error) {
        return {
            error,
            scores: {
                sentiment: { score: 0, category: 'neutral' },
                sincerity: { score: 0, category: 'low' },
                empathy: { score: 0, category: 'low' },
                completeness: { score: 0, category: 'incomplete', missing: [] }
            },
            redFlags: [],
            recommendations: []
        };
    }

    /**
     * AI-Enhanced Analysis (optional - requires Groq API)
     */
    async analyzeWithAI(text, apiConfig) {
        if (!apiConfig || !apiConfig.getApiKey()) {
            throw new Error('AI analysis requires Groq API configuration');
        }

        try {
            // Get base analysis first
            const baseAnalysis = this.analyze(text);

            // Use GPT integration for deeper insights
            const gptIntegration = new GPTIntegration(apiConfig);
            await gptIntegration.initialize();

            const aiPrompt = `Analyze this REPAIR Protocol document for:
1. Emotional sincerity and authenticity
2. Depth of empathy and harm recognition
3. Specific red flags (defensiveness, blame-shifting, minimizing)
4. Quality of commitments and action plans
5. Overall likelihood of successful relationship repair

Document:
${text}

Provide a structured analysis with scores (0-100) and specific recommendations.`;

            const aiResponse = await gptIntegration.makeRequest([
                {
                    role: 'system',
                    content: 'You are an expert in restorative justice, conflict resolution, and the REPAIR Protocol framework. Provide detailed, actionable analysis of apology documents.'
                },
                {
                    role: 'user',
                    content: aiPrompt
                }
            ]);

            return {
                ...baseAnalysis,
                aiAnalysis: {
                    enabled: true,
                    insights: aiResponse,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('AI analysis failed:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentAnalyzer;
} else if (typeof window !== 'undefined') {
    window.DocumentAnalyzer = DocumentAnalyzer;
}
