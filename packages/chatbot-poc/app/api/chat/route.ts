import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";

import { frontendTools } from "@assistant-ui/react-ai-sdk";

export async function POST(req: Request) {
  const { messages, system, tools }: { messages: UIMessage[] } =
    await req.json();

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("gpt-4o"),
    messages: convertToModelMessages(messages),
    system,
    tools: {
      ...frontendTools(tools), // Client-defined tools
    },
  });

  return result.toUIMessageStreamResponse();
}
