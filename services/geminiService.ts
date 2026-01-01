
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MentorPersona } from "../types";

export async function generateStudyPlan(
  topic: string, 
  hours: number, 
  learningStyle: string = 'balanced',
  includeBreaks: boolean = true,
  includeReviews: boolean = true
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Create a detailed, high-quality study plan for "${topic}" intended to last ${hours} hours. 
    User Preferences:
    - Learning Style: ${learningStyle}
    - Include Breaks: ${includeBreaks ? 'Yes' : 'No'}
    - Include Review Sessions: ${includeReviews ? 'Yes' : 'No'}
    
    Break it down into a logical sequence of sessions. 
    CRITICAL: For each session, provide 2-3 specific, high-quality educational resource URLs (YouTube, Khan Academy, Coursera, or official documentation) that match the session topic perfectly.
    
    Return the plan as a JSON object matching this schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          sessions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                duration: { type: Type.NUMBER, description: "Duration in minutes" },
                description: { type: Type.STRING },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING }
                    },
                    required: ["title", "url"]
                  }
                }
              },
              required: ["topic", "duration", "description", "resources"]
            }
          }
        },
        required: ["title", "sessions"]
      }
    }
  });
  
  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr);
}

export async function generateFollowUpQuestions(lastUserMessage: string, modelResponse: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Based on the user's question: "${lastUserMessage}"
    And the model's response: "${modelResponse}"
    
    Generate 3 short, engaging follow-up questions or related topics (under 10 words each) that the user might want to ask next to deepen their understanding.
    Return as a JSON array of strings.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
}

export async function getGroundedResources(topic: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find the best free educational websites, videos, and documentation for learning about ${topic}. List them clearly.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const links = chunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      url: chunk.web.uri
    }));

  return {
    text: response.text,
    links: links
  };
}

export async function* analyzeJournalStream(content: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const result = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: `Analyze this journal entry: "${content}". Provide empathetic feedback and suggest one mental health exercise. Keep it concise but warm.`,
  });

  for await (const chunk of result) {
    yield chunk.text || "";
  }
}

export async function* mentorChatStream(message: string, history: any[], persona: MentorPersona = 'balanced') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const instructions: Record<MentorPersona, string> = {
    balanced: "You are EduCare AI, a world-class AI Study Mentor. You help students understand complex topics, provide study tips, and encourage them. Use Markdown for formatting.",
    formal: "You are Professor EduCare AI, a formal and rigorous academic mentor. Provide precise definitions, cite concepts, and maintain a professional tone. Encourage critical thinking and academic excellence.",
    casual: "You are EduCare AI, a friendly and casual study buddy. Explain things simply, use relatable analogies, and talk like a peer. Keep it chill but super helpful.",
    encouraging: "You are Coach EduCare AI, an ultra-encouraging and motivating mentor. Focus on boosting the user's confidence, celebrate their efforts, and use energetic, positive language to drive them forward."
  };

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: instructions[persona],
    },
    history: history
  });

  const result = await chat.sendMessageStream({ message });
  for await (const chunk of result) {
    yield chunk.text || "";
  }
}

export async function analyzeImage(base64: string, mimeType: string, prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType: mimeType } },
        { text: prompt }
      ]
    }
  });
  return response.text || "";
}

export async function generateStudyImage(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function speakGuidance(text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
