import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const systemPrompt = `
    You are a Rate My Professor assistant. You help students find professors and learn about available courses.

    WHAT YOU CAN HELP WITH:
    - Finding professors by name, subject, or rating
    - Listing available courses and subjects
    - Providing professor reviews and ratings
    - Recommending professors based on teaching style, difficulty, etc.

    WHAT YOU CANNOT HELP WITH:
    - General knowledge questions (math problems, definitions, facts)
    - Personal advice unrelated to academics
    - Non-academic topics (weather, jokes, news, etc.)

    Examples of VALID questions you should answer:
      - "Who are the best psychology professors?"
      - "Find me a professor who teaches calculus"
      - "I need an easy grading professor"
      - "Who has 5-star ratings?"
      - "Tell me about Dr. Alice Johnson"

    Examples of INVALID questions you should redirect:  
      - "What's 2+2?"
      - "Tell me a joke"
      - "How's the weather?"
      - "Write me a poem"
      - Any question not related to professors or courses
    
    RESPONSE RULES:
    1. For specific queries (e.g., "best psychology professor"), provide top 3 matches with details
    2. For broad queries (e.g., "what courses are there?"), list ALL results you receive from the database
    3. If asked something unrelated to professors/courses, say: "I can only help with finding professors and courses. What would you like to know about our professors or available subjects?"

    Present information clearly:
    - Professor name
    - Subject/Course
    - Star rating
    - Key points from reviews
`;

// Step 1: Read the data
export async function POST(req) {
  const data = await req.json(); // takes our response data

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pc.index(process.env.PINECONE_INDEX_NAME);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const text = data[data.length - 1].content; //convo: last message

  // if user asks a broad question
  const broadQueryKeywords = ['all professors', 'all profs', 'all courses', 'all subjects', 'what professors are available', 'what courses are available', 'list of professors', 'list of courses', 'list of subjects'];
  const isBroadQuery = broadQueryKeywords.some(keyword => text.toLowerCase().includes(keyword));

  // uses more results for broad queries, use 10 (wider range of answers), else use 3 (most relevant answers)
  // how many results to return from Pinecone
  const topK = isBroadQuery ? 10 : 3;

  // Generate embedding
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 1024,
  });

  const embedding = embeddingResponse.data[0].embedding;

  // Query Pinecone index WITH dynamic topK (results to return based on broad or specific query)
  const results = await index.query({
    topK: topK,
    includeMetadata: true,
    vector: embedding,
  });

  // Step 2: Make data/embedding
  let resultString =
    "\n\nReturned Results from vector db (done automatically): ";
  
  // ?. to avoid crashing if metadata is missing
  results.matches?.forEach((match) => {
      resultString += `
    Professor: ${match.id}
    Review: ${match.metadata?.review || "N/A"}
    Subject: ${match.metadata?.subject || "N/A"}
    Stars: ${match.metadata?.stars || "N/A"}
    -----------------------------
    `;
  });


  // Step 3: Generate result with embedding with results
  const lastMessage = data[data.length - 1];
  const lastMessageContent = lastMessage.content + resultString;
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...lastDataWithoutLastMessage,
      { role: "user", content: lastMessageContent },
    ],
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
