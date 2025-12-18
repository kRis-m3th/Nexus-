import { generateEmailReply as coreGenerateEmail, summarizeCustomerNotes as coreSummarize } from './aiService';

/**
 * Redundant service kept for backwards compatibility in components, 
 * but now routes to the unified production-ready aiService.
 */

export const generateEmailReply = async (content: string, tone: string = 'professional') => {
    return await coreGenerateEmail(content, tone);
};

export const summarizeCustomerNotes = async (notes: string) => {
    return await coreSummarize(notes);
};