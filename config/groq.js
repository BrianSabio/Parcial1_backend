import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  throw new Error('No se encontró GROQ_API_KEY en el archivo .env');
}

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

export default groq;