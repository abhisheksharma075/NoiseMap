/**
 * NoiseMap FAQ Chatbot Service (JavaScript / ESM)
 * Deterministic, offline, rule-based question answering engine.
 * Matches user inquiries against the local FAQ database using
 * text normalization, alternative phrasings, and keyword ranking.
 * Zero external API requests, zero cloud models, 100% private.
 */

import { NOISEMAP_FAQ_DATABASE, FAQ_CATEGORIES } from '../data/noiseMapFaqData.js';

export class FaqChatbotService {
  /**
   * Required fallback message displayed when no predefined FAQ matches the inquiry.
   */
  static FALLBACK_MESSAGE =
    "I'm currently operating in FAQ mode and can answer predefined questions about NoiseMap, noise levels, measurements, incidents, reporting, and privacy. Please choose a suggested question or try rephrasing your question.";

  /**
   * Normalizes input text for deterministic comparison:
   * 1. Lowercases the string
   * 2. Replaces punctuation with whitespace
   * 3. Collapses multiple whitespace characters
   * 4. Trims leading and trailing spaces
   */
  static normalizeText(input) {
    if (!input || typeof input !== 'string') return '';
    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Strip punctuation
      .replace(/\s+/g, ' ')     // Collapse whitespace
      .trim();
  }

  /**
   * Tokenizes normalized text into an array of unique words, filtering out short stopwords.
   */
  static tokenize(normalized) {
    const stopwords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'as',
      'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'from', 'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again',
      'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
      'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
      'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
      'should', 'now', 'i', 'you', 'my', 'your', 'we', 'our', 'it', 'its',
    ]);

    return normalized
      .split(' ')
      .map((w) => w.trim())
      .filter((w) => w.length > 1 && !stopwords.has(w));
  }

  /**
   * Matches a raw user query against the FAQ collection using deterministic priority:
   * 1. Exact match on question (normalized)
   * 2. Exact match on alternative phrasing
   * 3. Full containment (query contains question or question contains query)
   * 4. Alternative phrasing containment
   * 5. Keyword & token overlap ranking
   */
  static matchQuestion(rawQuery) {
    const normalizedQuery = this.normalizeText(rawQuery);
    if (!normalizedQuery) {
      return this.createFallbackResult();
    }

    // Pass 1: Exact question match
    for (const faq of NOISEMAP_FAQ_DATABASE) {
      const normalizedFaqQuestion = this.normalizeText(faq.question);
      if (normalizedQuery === normalizedFaqQuestion) {
        return this.createSuccessResult(faq, 1.0);
      }
    }

    // Pass 2: Exact match on alternative phrasings
    for (const faq of NOISEMAP_FAQ_DATABASE) {
      for (const alt of faq.alternatives) {
        if (normalizedQuery === this.normalizeText(alt)) {
          return this.createSuccessResult(faq, 0.98);
        }
      }
    }

    // Pass 3: Substring containment with canonical questions
    for (const faq of NOISEMAP_FAQ_DATABASE) {
      const normalizedFaqQuestion = this.normalizeText(faq.question);
      if (
        normalizedQuery.includes(normalizedFaqQuestion) ||
        (normalizedQuery.length >= 12 && normalizedFaqQuestion.includes(normalizedQuery))
      ) {
        return this.createSuccessResult(faq, 0.92);
      }
    }

    // Pass 4: Substring containment with alternative phrasings
    for (const faq of NOISEMAP_FAQ_DATABASE) {
      for (const alt of faq.alternatives) {
        const normalizedAlt = this.normalizeText(alt);
        if (
          normalizedQuery.includes(normalizedAlt) ||
          (normalizedQuery.length >= 10 && normalizedAlt.includes(normalizedQuery))
        ) {
          return this.createSuccessResult(faq, 0.9);
        }
      }
    }

    // Pass 5: Keyword & token scoring
    const queryTokens = this.tokenize(normalizedQuery);
    if (queryTokens.length === 0) {
      return this.createFallbackResult();
    }

    let bestFaq = null;
    let highestScore = 0;

    for (const faq of NOISEMAP_FAQ_DATABASE) {
      let score = 0;
      let matchedTokenCount = 0;

      // Check keywords
      for (const kw of faq.keywords) {
        const normKw = this.normalizeText(kw);
        const kwTokens = this.tokenize(normKw);
        if (kwTokens.length === 0) continue;

        // Ensure at least one token from the keyword is actually in queryTokens
        const hasTokenOverlap = kwTokens.some((t) => queryTokens.includes(t));
        if (hasTokenOverlap && normalizedQuery.includes(normKw)) {
          score += 30 * kwTokens.length;
          matchedTokenCount += kwTokens.length;
        }
      }

      // Check question tokens
      const faqTokens = this.tokenize(this.normalizeText(faq.question));
      for (const qToken of queryTokens) {
        if (faqTokens.includes(qToken)) {
          score += 15;
          matchedTokenCount++;
        }
      }

      // Check alternative phrasing tokens
      for (const alt of faq.alternatives) {
        const altTokens = this.tokenize(this.normalizeText(alt));
        for (const qToken of queryTokens) {
          if (altTokens.includes(qToken)) {
            score += 5;
            matchedTokenCount++;
          }
        }
      }

      if (score > highestScore && matchedTokenCount > 0) {
        highestScore = score;
        bestFaq = faq;
      }
    }

    // Deterministic threshold: require at least 30 points AND token relevance
    if (bestFaq && highestScore >= 30) {
      return this.createSuccessResult(bestFaq, Math.min(0.85, 0.5 + highestScore / 100));
    }

    // No confident match -> fallback
    return this.createFallbackResult();
  }

  /**
   * Retrieves all questions belonging to a specific category.
   */
  static getQuestionsByCategory(category) {
    return NOISEMAP_FAQ_DATABASE
      .filter((faq) => faq.category === category)
      .map((faq) => faq.question);
  }

  /**
   * Retrieves all supported categories.
   */
  static getAllCategories() {
    return [...FAQ_CATEGORIES];
  }

  /**
   * Retrieves an FAQ entry by its ID.
   */
  static getFaqById(id) {
    return NOISEMAP_FAQ_DATABASE.find((faq) => faq.id === id);
  }

  /**
   * Constructs a successful match response object.
   */
  static createSuccessResult(faq, confidence) {
    return {
      matched: true,
      faq,
      answer: faq.answer,
      confidence,
      category: faq.category,
      relatedQuestions: faq.relatedQuestions || [],
    };
  }

  /**
   * Constructs the structured fallback response for unknown inquiries.
   */
  static createFallbackResult() {
    return {
      matched: false,
      answer: this.FALLBACK_MESSAGE,
      confidence: 0,
      suggestedCategories: [...FAQ_CATEGORIES],
      suggestedQuestions: [
        'What is NoiseMap?',
        'What does a reading of 70 dB mean?',
        'How do I use the NoiseMap map?',
        'What is a noise incident?',
        'How can I report noise pollution?',
        'Does this chatbot require an API key?',
      ],
    };
  }
}
