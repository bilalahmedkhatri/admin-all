import "server-only";
import { backend } from "./backend.server";

export interface PromptItem {
  id: number;
  title: string;
  category: string;
  content: string;
  author_name: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface PromptsPage {
  items: PromptItem[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}

export async function fetchPrompts(
  request: Request,
  page = 1,
): Promise<PromptsPage> {
  return backend<PromptsPage>(
    request,
    `/prompts?page=${page}&page_size=10`,
  );
}

export async function fetchPrompt(
  request: Request,
  id: number,
): Promise<PromptItem> {
  return backend<PromptItem>(request, `/prompts/${id}`);
}

export async function createPrompt(
  request: Request,
  body: { title: string; category: string; content: string; author_name: string },
): Promise<PromptItem> {
  return backend<PromptItem>(request, "/prompts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updatePrompt(
  request: Request,
  id: number,
  body: { title: string; category: string; content: string; author_name: string },
): Promise<PromptItem> {
  return backend<PromptItem>(request, `/prompts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
