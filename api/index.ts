import express from 'express';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PDF_DOWNLOAD_URL = process.env.PDF_DOWNLOAD_URL || process.env.SUPABASE_PDF_URL || 'https://vcdfxurpfznhcwsmyhvx.supabase.co/storage/v1/object/public/Descargas/Si%20la%20vida%20te%20da%20la%20espalda%20-%20Version%20Gratuita%20PDF.pdf';

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
    return { success: false, error: 'Supabase no configurado.' };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?on_conflict=email`, {
      method: 'POST',
      headers: {
        ...getSupabaseHeaders(),
        Prefer: 'resolution=merge-duplicates',
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

  let savedToSupabase = false;

  // Guardar en Supabase
  const supabaseResult = await saveRegistrationToSupabase(cleanName, cleanEmail);
  if (supabaseResult.success) {
    savedToSupabase = true;
    console.log(`[Supabase] Registro guardado: ${cleanEmail}`);
  }

  // Responder con éxito si Supabase funcionó
  if (savedToSupabase) {
    return res.json({
      success: true,
      message: '¡Registro completado con éxito!',
      source: 'supabase'
    });
  }

  return res.status(500).json({ error: 'No se pudo guardar el registro.' });
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

  res.json({ success: true, registrations: [] });
});

// Exportar CSV (Admin)
app.get('/api/admin/registrations/export', authenticateAdmin, async (req, res) => {
  let registrations: any[] = [];

  const supabaseRegistrations = await getRegistrationsFromSupabase();
  if (supabaseRegistrations.success) {
    registrations = supabaseRegistrations.registrations;
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
