/**
 * NoiseMap FAQ Chatbot Service (TypeScript wrapper)
 * Deterministic, offline, rule-based question answering engine.
 */

import { FaqChatbotService as FaqChatbotServiceImpl } from './faqChatbotService.js';
import { FaqItem, FaqCategoryType } from '../types/copilot';

export interface FaqMatchResult {
  matched: boolean;
  faq?: FaqItem;
  answer: string;
  confidence: number;
  category?: FaqCategoryType;
  relatedQuestions?: string[];
  suggestedCategories?: FaqCategoryType[];
  suggestedQuestions?: string[];
}

export class FaqChatbotService {
  public static readonly FALLBACK_MESSAGE: string =
    "I'm currently operating in FAQ mode and can answer predefined questions about NoiseMap, noise levels, measurements, incidents, reporting, and privacy. Please choose a suggested question or try rephrasing your question.";

  public static normalizeText(input: string): string {
    return FaqChatbotServiceImpl.normalizeText(input);
  }

  public static tokenize(normalized: string): string[] {
    return FaqChatbotServiceImpl.tokenize(normalized);
  }

  public static matchQuestion(rawQuery: string): FaqMatchResult {
    return FaqChatbotServiceImpl.matchQuestion(rawQuery) as FaqMatchResult;
  }

  public static getQuestionsByCategory(category: FaqCategoryType): string[] {
    return FaqChatbotServiceImpl.getQuestionsByCategory(category);
  }

  public static getAllCategories(): FaqCategoryType[] {
    return FaqChatbotServiceImpl.getAllCategories() as FaqCategoryType[];
  }

  public static getFaqById(id: string): FaqItem | undefined {
    return FaqChatbotServiceImpl.getFaqById(id) as FaqItem | undefined;
  }
}
