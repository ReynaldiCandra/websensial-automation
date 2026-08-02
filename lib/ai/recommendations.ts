export interface LeadRecommendation {
  leadId: string
  suggestion: string
  confidence: number
  category: 'response' | 'followup' | 'upsell' | 'offer'
  priority: 'high' | 'medium' | 'low'
}

export interface MessageTemplate {
  id: string
  name: string
  content: string
  variables: string[]
}

export class RecommendationEngine {
  async generateSuggestions(leadId: string, conversationHistory: string[]): Promise<LeadRecommendation[]> {
    const keywords = this.analyzeConversation(conversationHistory)
    const sentiment = this.analyzeSentiment(conversationHistory)
    const engagementLevel = this.calculateEngagement(conversationHistory)

    const suggestions: LeadRecommendation[] = []

    if (sentiment === 'positive' && engagementLevel > 0.7) {
      suggestions.push({
        leadId,
        suggestion: 'Lead shows strong interest. Consider special offer to close the deal.',
        confidence: 0.92,
        category: 'offer',
        priority: 'high'
      })
    }

    if (sentiment === 'neutral' && engagementLevel < 0.5) {
      suggestions.push({
        leadId,
        suggestion: 'Lead engagement is low. Send personalized follow-up with value proposition.',
        confidence: 0.85,
        category: 'followup',
        priority: 'high'
      })
    }

    if (keywords.includes('pricing') || keywords.includes('cost')) {
      suggestions.push({
        leadId,
        suggestion: 'Lead asked about pricing. Prepare flexible payment options.',
        confidence: 0.88,
        category: 'response',
        priority: 'high'
      })
    }

    return suggestions
  }

  private analyzeConversation(messages: string[]): string[] {
    const keywords: string[] = []
    const patterns = {
      pricing: /price|cost|expensive|affordable|budget/gi,
      features: /feature|capability|function|functionality/gi,
      timeline: /when|timeline|deadline|urgent|asap/gi,
      support: /support|help|issue|problem|fix/gi
    }

    messages.forEach(msg => {
      Object.entries(patterns).forEach(([key, pattern]) => {
        if (pattern.test(msg)) keywords.push(key)
      })
    })

    return [...new Set(keywords)]
  }

  private analyzeSentiment(messages: string[]): 'positive' | 'neutral' | 'negative' {
    const positive = /great|excellent|perfect|amazing|love|interested/gi
    const negative = /bad|poor|disappointed|unhappy|not interested/gi

    let positiveCount = 0
    let negativeCount = 0

    messages.forEach(msg => {
      positiveCount += (msg.match(positive) || []).length
      negativeCount += (msg.match(negative) || []).length
    })

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private calculateEngagement(messages: string[]): number {
    const avgLength = messages.reduce((sum, msg) => sum + msg.length, 0) / messages.length
    const messageFrequency = messages.length
    return Math.min((avgLength / 100 + messageFrequency / 10) / 2, 1)
  }

  async generateTemplate(leadName: string, suggestion: string): Promise<string> {
    const templates: { [key: string]: string } = {
      offer: `Hi {{name}}, based on your interest, we have a special offer just for you this week. Would you like to discuss details?`,
      followup: `Hi {{name}}, I wanted to follow up and see if you had any questions about our service. Happy to help!`,
      response: `Hi {{name}}, great question! Let me provide you with our pricing options that might work best for your needs.`,
      upsell: `Hi {{name}}, since you're enjoying the current service, here are some features that might help you even more.`
    }

    return templates[suggestion.category] || 'Hi {{name}}, how can I help you today?'
  }
}

export const recommendationEngine = new RecommendationEngine()
