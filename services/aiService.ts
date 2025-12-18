import { GoogleGenAI, FunctionDeclaration, Type, FunctionCall } from "@google/genai";
import { AIConfig } from "../types";
import { constructRAGContext } from "./ragService";
import { addAppointment, generateId, getAllCustomers } from "./dbService";

// Standardizing on the production model
const PROD_MODEL = 'gemini-3-flash-preview';

// --- Configuration Management ---
// Added to support Meta Admin settings and fix exported member errors.
const AI_CONFIG_KEY = 'nexus_ai_config';

/**
 * Retrieves the current AI configuration from local storage.
 * Defaults to Gemini if no configuration exists.
 */
export const getAIConfig = (): AIConfig => {
  const stored = localStorage.getItem(AI_CONFIG_KEY);
  if (stored) return JSON.parse(stored);
  return {
    provider: 'gemini',
    apiKey: '', // API key is strictly obtained from environment variables as per guidelines
    model: PROD_MODEL
  };
};

/**
 * Persists the AI configuration to local storage.
 */
export const saveAIConfig = (config: AIConfig) => {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
};

// --- Function Declarations (Tools) ---
const bookAppointmentTool: FunctionDeclaration = {
  name: 'bookAppointment',
  description: 'Book a new appointment for a customer. Use this when the user explicitly requests to schedule a meeting or call.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerName: {
        type: Type.STRING,
        description: 'Name of the customer booking the appointment.'
      },
      date: {
        type: Type.STRING,
        description: 'Date of the appointment in YYYY-MM-DD format.'
      },
      time: {
        type: Type.STRING,
        description: 'Time of the appointment in HH:MM format (24hr).'
      },
      type: {
        type: Type.STRING,
        description: 'Type of appointment: "Phone", "Video", or "In-Person".'
      },
      notes: {
        type: Type.STRING,
        description: 'Context or notes for the meeting.'
      }
    },
    required: ['customerName', 'date', 'time']
  }
};

// --- Internal Execution Logic ---
const executeFunction = async (functionCall: FunctionCall): Promise<{ success: boolean; message: string }> => {
    if (functionCall.name === 'bookAppointment') {
        const args = functionCall.args as any;
        
        const customers = getAllCustomers();
        const existingCustomer = customers.find(c => 
            c.name.toLowerCase().includes(args.customerName.toLowerCase()) ||
            args.customerName.toLowerCase().includes(c.name.toLowerCase())
        );
        
        const newAppt = {
            id: generateId(),
            customerId: existingCustomer ? existingCustomer.id : 'guest',
            customerName: args.customerName,
            title: args.notes ? `Meeting: ${args.notes}` : 'Consultation',
            date: args.date,
            time: args.time,
            duration: 30,
            type: (args.type as any) || 'Video',
            status: 'Scheduled' as const,
            notes: args.notes || 'Booked via AI Receptionist'
        };

        addAppointment(newAppt);
        return { 
            success: true, 
            message: `Confirmed: Appointment for ${args.customerName} on ${args.date} at ${args.time} has been added to your calendar.` 
        };
    }
    return { success: false, message: "Action failed: Unknown system function." };
};

// --- Core API Caller ---
const queryAI = async (prompt: string, systemInstruction: string, tools?: FunctionDeclaration[]) => {
  // Use environment variable exclusively as per guidelines
  if (!process.env.API_KEY) {
      console.error("CRITICAL: API_KEY is missing from environment.");
      return "I'm having trouble connecting to my brain right now. Please ensure the API key is configured.";
  }

  // Create instance right before call to ensure up-to-date configuration
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const config = getAIConfig();
  
  // Use configured model if it's a Gemini model, else fallback to standard
  const activeModel = config.provider === 'gemini' ? (config.model || PROD_MODEL) : PROD_MODEL;

  try {
    const response = await ai.models.generateContent({
      model: activeModel,
      contents: prompt,
      config: {
          systemInstruction: systemInstruction,
          tools: tools ? [{ functionDeclarations: tools }] : undefined,
          temperature: 0.7,
      }
    });

    // Check for Function Calls using the functionCalls property as per latest SDK guidelines
    if (response.functionCalls && response.functionCalls.length > 0) {
        const executionResult = await executeFunction(response.functionCalls[0]);
        return `[System Action] ${executionResult.message}`; 
    }

    // Access .text property directly as per SDK guidelines (no .text() call)
    return response.text || "I processed your request but didn't have a specific spoken response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I encountered a technical error processing your request.";
  }
};

// --- Exported Interfaces ---

export const generateEmailReply = async (originalEmailContent: string, tone: string = 'professional'): Promise<string> => {
  const systemPrompt = "You are an expert business assistant. Draft a reply that is concise and matches the requested tone.";
  const userPrompt = `Draft a ${tone} email reply to this message: "${originalEmailContent}"`;
  return await queryAI(userPrompt, systemPrompt);
};

export const generateReceptionistResponse = async (userQuery: string): Promise<string> => {
    const ragContext = constructRAGContext(); 
    const today = new Date().toISOString().split('T')[0];
    
    const systemPrompt = `You are a highly capable AI Receptionist. 
    Current Date: ${today}.
    Rules:
    1. Use the BUSINESS CONTEXT below to answer questions about the company.
    2. If a user wants to book, schedule, or meet, use the 'bookAppointment' tool.
    3. Be polite, professional, and helpful.
    
    CONTEXT:
    ${ragContext}`;

    return await queryAI(userQuery, systemPrompt, [bookAppointmentTool]);
};

export const generateLandingChatResponse = async (userMessage: string): Promise<string> => {
    const globalContext = constructRAGContext('global');
    const systemPrompt = `You are 'Nexus', the sales assistant for NexusAI. 
    Goal: Persuade users to sign up for a trial. 
    Context: ${globalContext}`;
    
    return await queryAI(userMessage, systemPrompt);
};

export const summarizeCustomerNotes = async (notes: string): Promise<string> => {
    return await queryAI(`Summarize these customer notes into one sentence: "${notes}"`, "You are a CRM data specialist.");
};