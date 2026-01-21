import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { groq } from '@ai-sdk/groq';
import z from 'zod';
import { db } from '@/app/db/drizzle';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const SYSTEM_PROMPT = 
    `Yor are an expert SQL assistant that helps users query their database using natural
    language.

    ${new Date().toLocaleString('sv-SE')}
    You have access to a tool that allows you to run SQL queries against the database.
    1. db tool - call this tool to query the database
    2. schema tool - call this tool to get database schema which will help you to write sql query.

    Rules:
    -Generate ONLY SELECT queries (no INSERT, UPDATE, DELETE, DROP)
    -Always use the schema provided by the schema tool
    -Return valid SQLite syntax

    Always respond in a helpful, conversational tone while being technically accurate`;

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    system: SYSTEM_PROMPT,
    tools: {

      schema: tool({
        description: 'Call this tool to get database schema information.',
        inputSchema: z.object({}),
        execute: async () => {
          return `CREATE TABLE "users" (
                  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
                  "name" varchar(255) NOT NULL,
                  "age" integer NOT NULL,
                  "email" varchar(255) NOT NULL,
                  CONSTRAINT "users_email_unique" UNIQUE("email")
                  );

                  CREATE TABLE "todos" (
                  "id" integer PRIMARY KEY NOT NULL,
                  "text" text NOT NULL,
                  "done" boolean DEFAULT false NOT NULL,
                  "created_at" timestamp DEFAULT now() NOT NULL
                );
                  `;
        },
      }),



      db: tool({
        description: 'Call this tool to query the database.',
        inputSchema: z.object({
          query: z.string().describe('The SQL query to execute'),
        }),
        execute: async ({ query }) => {
          console.log('Query', query);
          // IMP: make sure you sanitize/validate query
          // Accidental DB modification
          return await db.execute(query);
          
        },
      }),
    },

  });

  return result.toUIMessageStreamResponse();
}