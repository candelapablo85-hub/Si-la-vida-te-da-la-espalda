import express from 'express';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pablo123';

// Inicializar Base de Datos SQLite
const dbPath = path.resolve(process.cwd(), 'emails.db');
const db = new Database(dbPath);

// Crear tabla de registros si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());

// Middleware CORS básico si fuera necesario
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Endpoint de Registro
app.post('/api/register', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo electrónico son requeridos.' });
  }

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
  }

  try {
    // Insertar o actualizar si ya existe (ON CONFLICT en email)
    const stmt = db.prepare(`
      INSERT INTO registrations (name, email)
      VALUES (?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        created_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run(name.trim(), email.trim().toLowerCase());
    
    res.json({ success: true, message: '¡Registro completado con éxito!' });
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el registro.' });
  }
});

// Middleware de autenticación simple para rutas de administración
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso no autorizado. Se requiere contraseña.' });
  }

  // Soporta "Bearer password" o "password" directamente
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
app.get('/api/admin/registrations', authenticateAdmin, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, name, email, created_at FROM registrations ORDER BY created_at DESC');
    const registrations = stmt.all();
    res.json({ success: true, registrations });
  } catch (error) {
    console.error('Error al obtener registros:', error);
    res.status(500).json({ error: 'Error al obtener los registros de la base de datos.' });
  }
});

// Exportar CSV (Admin)
app.get('/api/admin/registrations/export', authenticateAdmin, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, name, email, created_at FROM registrations ORDER BY created_at DESC');
    const registrations: any[] = stmt.all();

    // Generar contenido CSV
    let csvContent = '\uFEFF'; // BOM para soportar tildes en Excel
    csvContent += 'ID,Nombre,Email,Fecha de Registro\n';

    registrations.forEach((r) => {
      // Escapar comillas dobles y comas en campos de texto
      const cleanName = `"${r.name.replace(/"/g, '""')}"`;
      const cleanEmail = `"${r.email.replace(/"/g, '""')}"`;
      csvContent += `${r.id},${cleanName},${cleanEmail},${r.created_at}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=registrados_libro.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).send('Error al generar el archivo CSV.');
  }
});

app.listen(PORT, () => {
  console.log(`[Servidor API] Ejecutándose en http://localhost:${PORT}`);
});
