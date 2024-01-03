import { AskRequest, AskResponse, ChatRequest, updateFeedBackRequest } from "./models";
import axios from 'axios'
let baseURL = import.meta.env.VITE_APP_API_URL
export async function askApi(email:string, options: AskRequest, useai: number): Promise<AskResponse> {
  const response = await fetch(baseURL+"/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question: options.question,
      approach: options.approach,
      email: email,
      overrides: {
        retrieval_mode: options.overrides?.retrievalMode,
        semantic_ranker: options.overrides?.semanticRanker,
        semantic_captions: options.overrides?.semanticCaptions,
        top: options.overrides?.top,
        temperature: options.overrides?.temperature,
        prompt_template: options.overrides?.promptTemplate,
        prompt_template_prefix: options.overrides?.promptTemplatePrefix,
        prompt_template_suffix: options.overrides?.promptTemplateSuffix,
        exclude_category: options.overrides?.exclude_category
      },
      useai: useai
    })
  });

  const parsedResponse: AskResponse = await response.json();
  if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
  }

  return parsedResponse;
}

export async function chatApi(email: string,options: ChatRequest): Promise<AskResponse> {
  const response = await fetch(baseURL+"/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      history: options.history,
      approach: options.approach,
      email: email,
      overrides: {
        retrieval_mode: options.overrides?.retrievalMode,
        semantic_ranker: options.overrides?.semanticRanker,
        semantic_captions: options.overrides?.semanticCaptions,
        top: options.overrides?.top,
        temperature: options.overrides?.temperature,
        prompt_template: options.overrides?.promptTemplate,
        prompt_template_prefix: options.overrides?.promptTemplatePrefix,
        prompt_template_suffix: options.overrides?.promptTemplateSuffix,
        exclude_category: options.overrides?.excludeCategory,
        suggest_followup_questions: options.overrides?.suggestFollowupQuestions
            }
    })
  });

  const parsedResponse: AskResponse = await response.json();
  if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
  }

  return parsedResponse;
}

export async function updateFeedBack(options: updateFeedBackRequest): Promise<AskResponse> {
  // const payload = new FormData();
  // payload.append("id", options.id);
  // payload.append("feedback", options.feedback);
  const response = await fetch(baseURL+"/documentService/questionFeedback", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: options.id,
      feedback: options.feedback
    })
  });

  const parsedResponse: AskResponse = await response.json();
  if (response.status > 299 || !response.ok) {
    throw Error(parsedResponse.error || "Unknown error");
  }

  return parsedResponse;
}

export function getCitationFilePath(citation: string): string {
  return `/content/${citation}`;
}
