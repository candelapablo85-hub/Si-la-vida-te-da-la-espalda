import express from 'express';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PDF_DOWNLOAD_URL = process.env.PDF_DOWNLOAD_URL || '/assets/Adelanto-libro.pdf';

app.use(express.json());

// Middleware CORS básico
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const registrations: Array<{ id: number; name: string; email: string; created_at: string }> = [];

function saveRegistrationToMemory(name: string, email: string) {
  const existing = registrations.find((entry) => entry.email === email);
  if (existing) {
    existing.name = name;
    existing.created_at = new Date().toISOString();
    return { success: true };
  }

  registrations.push({
    id: registrations.length + 1,
    name,
    email,
    created_at: new Date().toISOString(),
  });

  return { success: true };
}

function getRegistrationsFromMemory() {
  return { success: true, registrations: [...registrations].reverse() };
}

// Endpoint de Registro
app.post('/api/register', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo electrónico son requeridos.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  const localResult = saveRegistrationToMemory(cleanName, cleanEmail);

  if (!localResult.success) {
    return res.status(500).json({ error: 'Error interno al guardar el registro.' });
  }

  console.log(`[Registro] Guardado en memoria: ${cleanEmail}`);

  return res.json({
    success: true,
    message: '¡Registro completado con éxito!',
    source: 'memory'
  });
});

app.get('/api/download', (req, res) => {
  if (!PDF_DOWNLOAD_URL) {
    return res.status(404).json({ error: 'El PDF no está configurado.' });
  }

  res.redirect(302, PDF_DOWNLOAD_URL);
});

// Exportar app para Vercel
export default app;
