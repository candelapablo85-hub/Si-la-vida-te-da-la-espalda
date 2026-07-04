import express from 'express';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

const app = express();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || './data/registrations.db';
const PDF_DOWNLOAD_URL = process.env.PDF_DOWNLOAD_URL || process.env.SUPABASE_PDF_URL || 'https://vcdfxurpfznhcwsmyhvx.supabase.co/storage/v1/object/public/Descargas/Si%20la%20vida%20te%20da%20la%20espalda%20-%20Version%20Gratuita%20PDF.pdf';

const dbDirectory = path.dirname(SQLITE_DB_PATH);
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const db = new Database(SQLITE_DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );
`);

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

const getSupabaseHeaders = () => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_SERVICE_ROLE_KEY || '',
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY || ''}`,
});

async function saveRegistrationToSupabase(name: string, email: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { success: true, skipped: true };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        ...getSupabaseHeaders(),
        Prefer: 'return=minimal',
      },
      body: JSON.stringify([{ name, email, created_at: new Date().toISOString() }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'No se pudo guardar en Supabase.');
    }

    return { success: true };
  } catch (error) {
    console.error('[Supabase] Error al guardar registro:', error);
    return { success: false, error: 'No se pudo guardar en Supabase.' };
  }
}

function saveRegistrationToLocalDB(name: string, email: string) {
  try {
    const stmt = db.prepare(`INSERT INTO registrations (name, email, created_at) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET name=excluded.name, created_at=excluded.created_at`);
    stmt.run(name, email, new Date().toISOString());
    return { success: true };
  } catch (error) {
    console.error('[SQLite] Error al guardar registro local:', error);
    return { success: false, error: 'No se pudo guardar en la base local.' };
  }
}

function getRegistrationsFromLocalDB() {
  try {
    const stmt = db.prepare(`SELECT id, name, email, created_at FROM registrations ORDER BY datetime(created_at) DESC`);
    const registrations = stmt.all();
    return { success: true, registrations };
  } catch (error) {
    console.error('[SQLite] Error al leer registros locales:', error);
    return { success: false, registrations: [] };
  }
}

async function getRegistrationsFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, registrations: [] };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=id,name,email,created_at&order=created_at.desc`, {
      headers: getSupabaseHeaders(),
    });

    if (!response.ok) {
      throw new Error('No se pudo leer desde Supabase.');
    }

    const data = await response.json();
    return { success: true, registrations: data || [] };
  } catch (error) {
    console.error('[Supabase] Error al leer registros:', error);
    return { success: false, registrations: [] };
  }
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

  const localResult = saveRegistrationToLocalDB(cleanName, cleanEmail);
  const supabaseResult = await saveRegistrationToSupabase(cleanName, cleanEmail);

  if (!localResult.success) {
    return res.status(500).json({ error: localResult.error || 'Error interno al guardar el registro.' });
  }

  if (supabaseResult.success && !supabaseResult.skipped) {
    console.log(`[Supabase] Registro guardado: ${cleanEmail}`);
  } else if (supabaseResult.skipped) {
    console.log(`[Registro] Guardado localmente: ${cleanEmail}`);
  } else {
    console.warn(`[Supabase] No disponible para ${cleanEmail}, se guardó localmente.`);
  }

  return res.json({
    success: true,
    message: '¡Registro completado con éxito!',
    source: supabaseResult.success && !supabaseResult.skipped ? 'supabase' : 'local'
  });
});

// Middleware de autenticación simple para rutas de administración
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'El panel de administración no está configurado.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere contraseña.' });
  }

  const password = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Contraseña de administrador incorrecta.' });
  }

  next();
};

// Endpoint de Login de Administrador
app.post('/api/admin/login', (req, res) => {
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'El panel de administración no está configurado.' });
  }

  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Contraseña requerida.' });
  }

  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Autenticación exitosa.' });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta.' });
  }
});

// Obtener lista de Registrados (Admin)
app.get('/api/admin/registrations', authenticateAdmin, async (req, res) => {
  const supabaseRegistrations = await getRegistrationsFromSupabase();
  if (supabaseRegistrations.success) {
    return res.json({ success: true, registrations: supabaseRegistrations.registrations });
  }

  const localRegistrations = getRegistrationsFromLocalDB();
  return res.json({ success: true, registrations: localRegistrations.registrations });
});

// Exportar CSV (Admin)
app.get('/api/admin/registrations/export', authenticateAdmin, async (req, res) => {
  let registrations: any[] = [];

  const supabaseRegistrations = await getRegistrationsFromSupabase();
  if (supabaseRegistrations.success) {
    registrations = supabaseRegistrations.registrations;
  } else {
    const localRegistrations = getRegistrationsFromLocalDB();
    registrations = localRegistrations.registrations;
  }

  try {
    let csvContent = '\uFEFF'; // BOM
    csvContent += 'ID,Nombre,Email,Fecha de Registro\n';

    registrations.forEach((r) => {
      const cleanName = `"${r.name.replace(/"/g, '""')}"`;
      const cleanEmail = `"${r.email.replace(/"/g, '""')}"`;
      csvContent += `${r.id},${cleanName},${cleanEmail},${r.created_at}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=registrados_libro.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error al generar CSV:', error);
    res.status(500).send('Error al generar el archivo CSV.');
  }
});

app.get('/api/download', (req, res) => {
  if (!PDF_DOWNLOAD_URL) {
    return res.status(404).json({ error: 'El PDF no está configurado.' });
  }

  res.redirect(302, PDF_DOWNLOAD_URL);
});

// Exportar app para Vercel
export default app;
