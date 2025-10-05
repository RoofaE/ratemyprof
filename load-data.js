import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

// load professor data from reviews.json
const rawData = fs.readFileSync("reviews.json", "utf-8");
const data = JSON.parse(rawData);
const professorData = data.reviews;

async function loadData() {
  try {
    console.log("Pinecone and OpenAI initialization");
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pc.index(process.env.PINECONE_INDEX_NAME);

    console.log("OpenAI initialization");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("Uploading data of professors right now");

    for (let i = 0; i < professorData.length; i++) {
      const prof = professorData[i];
      const text = `Professor: ${prof.professor}\nReview: ${prof.review}\nSubject: ${prof.subject}\nStars: ${prof.stars}`;
      console.log(
        `Processing ${i + 1}/${professorData.length}: ${prof.professor}`
      );

      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 1024,
      });

      const embedding = embeddingResponse.data[0].embedding;
      // Upsert into Pinecone
      await index.upsert([
        {
          id: prof.professor,
          values: embedding,
          metadata: {
            professor: prof.professor,
            subject: prof.subject,
            stars: prof.stars,
            reviews: prof.reviews,
          },
        },
      ]);
      console.log(`Uploaded ${prof.professor}`);
    }

    console.log("Profs data has been loaded successfully");
  } catch (error) {
    console.error("Error loading data:", error);
  }
}
loadData();
