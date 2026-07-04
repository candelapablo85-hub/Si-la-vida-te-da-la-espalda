import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

const app = express();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pablo123';
const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL;

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

// Inicializar SQLite dinámicamente solo si NO estamos en producción (o si no hay Google Sheets)
let db: any = null;
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction || !GOOGLE_SHEETS_URL) {
  try {
    // Importación dinámica para evitar que Vercel intente compilar better-sqlite3 en producción
    import('better-sqlite3').then((module) => {
      const Database = module.default;
      const dbPath = path.resolve(process.cwd(), 'emails.db');
      db = new Database(dbPath);
      db.exec(`
        CREATE TABLE IF NOT EXISTS registrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('[SQLite] Base de datos local inicializada.');
    }).catch(err => {
      console.warn('[SQLite] No se pudo cargar SQLite (esto es normal en producción en Vercel):', err.message);
    });
  } catch (err) {
    console.warn('[SQLite] Error al importar better-sqlite3:', err);
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

  let savedToLocal = false;
  let savedToGoogleSheets = false;

  // 1. Intentar guardar localmente en SQLite si la DB está cargada
  if (db) {
    try {
      const stmt = db.prepare(`
        INSERT INTO registrations (name, email)
        VALUES (?, ?)
        ON CONFLICT(email) DO UPDATE SET
          name = excluded.name,
          created_at = CURRENT_TIMESTAMP
      `);
      stmt.run(cleanName, cleanEmail);
      savedToLocal = true;
      console.log(`[SQLite] Registro guardado localmente: ${cleanEmail}`);
    } catch (error) {
      console.error('[SQLite] Error al guardar localmente:', error);
    }
  }

  // 2. Si hay URL de Google Sheets, enviar allí
  if (GOOGLE_SHEETS_URL) {
    try {
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        savedToGoogleSheets = true;
        console.log(`[Google Sheets] Registro enviado con éxito: ${cleanEmail}`);
      } else {
        console.error('[Google Sheets] Error al guardar en Google Sheets:', data.error);
      }
    } catch (error) {
      console.error('[Google Sheets] Error de red al enviar a Google Sheets:', error);
    }
  }

  // Responder con éxito si al menos uno funcionó
  if (savedToLocal || savedToGoogleSheets) {
    return res.json({
      success: true,
      message: '¡Registro completado con éxito!',
      source: savedToGoogleSheets ? 'google_sheets' : 'sqlite'
    });
  } else {
    // Si ambos fallaron
    return res.status(500).json({ error: 'No se pudo guardar el registro.' });
  }
});

// Middleware de autenticación simple para rutas de administración
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere contraseña.' });
  }

  const password = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Contraseña de administrador incorrecta.' });
  }

  next();
};

// Endpoint de Login de Administrador
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
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
  // 1. Si hay Google Sheets, leer los datos desde allí
  if (GOOGLE_SHEETS_URL) {
    try {
      const response = await fetch(GOOGLE_SHEETS_URL);
      const data = await response.json();
      if (response.ok && data.success) {
        return res.json({ success: true, registrations: data.registrations });
      }
    } catch (error) {
      console.error('[Google Sheets] Error al leer registros de Google Sheets:', error);
    }
  }

  // 2. Si no hay Google Sheets o falló, usar SQLite local
  if (db) {
    try {
      const stmt = db.prepare('SELECT id, name, email, created_at FROM registrations ORDER BY created_at DESC');
      const registrations = stmt.all();
      return res.json({ success: true, registrations });
    } catch (error) {
      console.error('[SQLite] Error al obtener registros:', error);
    }
  }

  // Si no hay datos disponibles
  res.json({ success: true, registrations: [] });
});

// Exportar CSV (Admin)
app.get('/api/admin/registrations/export', authenticateAdmin, async (req, res) => {
  let registrations: any[] = [];

  // 1. Intentar leer de Google Sheets
  if (GOOGLE_SHEETS_URL) {
    try {
      const response = await fetch(GOOGLE_SHEETS_URL);
      const data = await response.json();
      if (response.ok && data.success) {
        registrations = data.registrations;
      }
    } catch (error) {
      console.error('[Google Sheets] Error al exportar desde Google Sheets:', error);
    }
  }

  // 2. Fallback a SQLite
  if (registrations.length === 0 && db) {
    try {
      const stmt = db.prepare('SELECT id, name, email, created_at FROM registrations ORDER BY created_at DESC');
      registrations = stmt.all();
    } catch (error) {
      console.error('[SQLite] Error al obtener registros para exportar:', error);
    }
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

// Exportar app para Vercel
export default app;
