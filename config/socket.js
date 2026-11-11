import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export const inicializarSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

  const contexto = "Eres 'Asistente CIKIRE', un asistente virtual del Centro Integral de Kinesiología y Rehabilitación. Eres amable, conciso y profesional. Respondes dudas sobre horarios, turnos y servicios. Pregunta del usuario: ";

  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado al chat de CIKIRE:', socket.id);

    socket.on('chat:mensaje', async (data) => {
      
      io.emit('chat:mensaje', data);

      if (data.texto.trim().toLowerCase().startsWith('@gemini')) {
        try {
          const pregunta = data.texto.replace(/@gemini/i, '').trim();
          
          if (!pregunta) return;

          const prompt = contexto + pregunta;
          const result = await model.generateContent(prompt);
          const respuesta = result.response.text();

          io.emit('chat:mensaje', {
            texto: respuesta,
            fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });

        } catch (error) {
          console.error("Error al comunicarse con Gemini:", error);
          io.emit('chat:mensaje', {
            texto: "Disculpe, actualmente estoy experimentando problemas técnicos. Intente nuevamente más tarde.",
            fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
};