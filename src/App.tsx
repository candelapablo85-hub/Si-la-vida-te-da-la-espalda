/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Calendar,
  MapPin,
  ArrowRight,
  Linkedin,
  Instagram,
  CheckCircle2,
  Quote,
  X,
  Search,
  Download,
  LogOut,
  Lock,
  Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getPdfDownloadUrl } from './pdfDownload';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BOOK_DATA = {
  title: "Si la vida te da la espalda...",
  subtitle: "tocale el culo.",
  author: "Pablo Candela",
  synopsis: "Un espacio para repensar cómo nos paramos frente a la vida, con menos culpa y más actitud. Una charla con mates, anécdotas reales y una dosis de humor para quienes se animan a mirar sus derrotas con una sonrisa.",
  backCoverText: "¿Y si la mejor forma de enfrentar la vida fuera con una carcajada y una frase absurda? Si alguna vez sentiste que todo estaba cuesta arriba y necesitás una palmada en la espalda o un buen empujón, este libro es para vos. ",
  prologueExcerpt: [
    "¿Cuántas veces sentiste que la vida te estaba poniendo a prueba? A mí me pasó tantas veces que dejé de contarlas, pero descubrí que lo que realmente importa no es lo que sucede, sino cómo lo enfrentamos. En el camino aprendí que no podemos controlar todo lo que nos pasa, pero sí elegir nuestra actitud.",
    "Fue entonces cuando apareció esa frase que me acompaña desde hace años, casi como un mantra: “Si la vida te da la espalda, tocale el culo”. Esa idea siempre me sirvió para encarar los desafíos con valentía y humor, y en ese momento entendí que ahí estaba la clave. No quería escribir un libro de coaching tradicional ni un manual de éxito, quería contar mi historia desde la actitud con la que siempre enfrenté los momentos difíciles porque quizás, al compartir lo aprendido, alguien más podría encontrar una forma diferente de atravesar los suyos.»",
  ],
  bookIndex: [
    "Capitulo 1 - Expectativas y obstáculos",
    "Capitulo 2 - Inseguridad: el enemigo invisible",
    "Capitulo 3 - El poder del humor",
    "Capitulo 4 - Un 5 en la cancha y en la vida",
    "Capitulo 5 - El miedo al cambio ",
    "Capitulo 6 - El Propósito",
    "Capitulo 7 - Equilibrio y prioridades",
    "Capitulo 8 - La Actitud lo es todo",
    "Capitulo 9 - Celebra cada gol, aunque sea en contra",
    "Recursos adicionales",
  ],
  coverUrl: "https://picsum.photos/seed/bookcover_warm/800/1200", // Tapa y Contratapa
  frontCoverUrl: "https://picsum.photos/seed/bookcover_warm/600/900", // Tapa sola
  authorImage: "/Imagenes/Foto perfil.png",
  testimonials: [
    {
      text: "Una dosis necesaria de realidad y humor. Pablo logra que te rías de tus propios dramas.",
      author: "Revista Cultura Viva"
    },
    {
      text: "Fresco, honesto y profundamente humano. Un libro que se siente como un abrazo de un amigo.",
      author: "Laura M., Lectora"
    }
  ]
};

export default function App() {
  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subscribe, setSubscribe] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  // Admin states
  const [isAdmin, setIsAdmin] = React.useState(window.location.hash === '#admin');
  const [adminPassword, setAdminPassword] = React.useState('');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [adminError, setAdminError] = React.useState('');
  const [registrations, setRegistrations] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [adminLoading, setAdminLoading] = React.useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_URL || '';
  const supabaseRawUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const pdfDownloadUrl = import.meta.env.VITE_PDF_DOWNLOAD_URL || '';
  const downloadUrl = getPdfDownloadUrl(pdfDownloadUrl);

  const supabaseRestUrl = (() => {
    if (!supabaseRawUrl) return '';
    const cleanUrl = supabaseRawUrl.replace(/\/$/, '');
    return cleanUrl.endsWith('/rest/v1') ? cleanUrl : `${cleanUrl}/rest/v1`;
  })();

  const apiUrl = (path: string) => apiBaseUrl ? `${apiBaseUrl}${path}` : path;

  const apiFetch = async (path: string, options?: RequestInit) => {
    if (!apiBaseUrl) {
      throw new Error('No backend API configurado');
    }
    const url = apiUrl(path);
    return fetch(url, options);
  };

  const registerDirectToSupabase = async (name: string, email: string) => {
    if (!supabaseRestUrl || !supabaseAnonKey) {
      throw new Error('No está configurado Supabase directo.');
    }

    const response = await fetch(`${supabaseRestUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify([{ name, email, created_at: new Date().toISOString() }])
    });

    if (!response.ok) {
      const text = await response.text();
      let message = 'No se pudo guardar en Supabase.';
      try {
        const json = JSON.parse(text);
        if (json.msg) message = String(json.msg);
        else if (json.message) message = String(json.message);
        else if (json.error && typeof json.error === 'string') message = json.error;
      } catch {
        if (text) message = text;
      }

      if (response.status === 401 || response.status === 403) {
        message = `Permisos insuficientes en Supabase. ${message}`;
      } else if (response.status === 404) {
        message = 'La URL de Supabase parece incorrecta. Usa la URL base del proyecto sin /rest/v1/.';
      } else if (response.status === 400) {
        message = `Error de Supabase: ${message}`;
      }

      throw new Error(message);
    }

    return { success: true };
  };

  React.useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check login on mount / when password changes
  React.useEffect(() => {
    if (isAdmin && adminPassword) {
      verifyPassword(adminPassword);
    }
  }, [isAdmin, adminPassword]);

  const verifyPassword = async (pwd: string) => {
    setAdminLoading(true);
    setAdminError('');
    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLoggedIn(true);
        fetchRegistrations(pwd);
      } else {
        setIsLoggedIn(false);
        setAdminError(data.error || 'Contraseña incorrecta');
      }
    } catch (err) {
      setAdminError('Error al conectar con el servidor.');
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchRegistrations = async (pwd: string) => {
    try {
      const res = await apiFetch('/api/admin/registrations', {
        headers: { 'Authorization': `Bearer ${pwd}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations(data.registrations);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPassword(adminPassword);
  };

  const handleAdminLogout = () => {
    setIsLoggedIn(false);
    setAdminPassword('');
    window.location.hash = '';
  };

  const handleExportCSV = async () => {
    try {
      const res = await apiFetch('/api/admin/registrations/export', {
        headers: { 'Authorization': `Bearer ${adminPassword}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'registrados_libro.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error al exportar CSV');
      }
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      let data: any = null;
      let res: Response | null = null;

      if (apiBaseUrl) {
        try {
          res = await apiFetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
          });
          data = await res.json();
        } catch (backendError) {
          console.warn('Backend API failed, falling back to Supabase:', backendError);
        }
      }

      if (!res || !res.ok || !data?.success) {
        if (supabaseRestUrl && supabaseAnonKey) {
          try {
            await registerDirectToSupabase(name, email);
            setSuccess(true);
            triggerDownload();
            return;
          } catch (supabaseError) {
            console.error('Direct Supabase registration failed:', supabaseError);
            setError(`Error directo a Supabase: ${supabaseError instanceof Error ? supabaseError.message : String(supabaseError)}`);
            return;
          }
        }
      }

      if (res && res.ok && data?.success) {
        setSuccess(true);
        triggerDownload();
      } else if (!supabaseRestUrl || !supabaseAnonKey) {
        setError('No se pudo conectar con el servidor. Por favor, intenta de nuevo.');
      } else if (res && data) {
        setError(data.error || 'No se pudo procesar el registro. Por favor, intenta de nuevo.');
      }
    } catch (err) {
      console.error('Unhandled registration error:', err);
      setError(`No se pudo procesar el registro: ${err instanceof Error ? err.message : String(err)}.`);
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Si la vida te da la espalda - Version Gratuita PDF.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDownloadModal = () => {
    setIsModalOpen(true);
    setSuccess(false);
    setError('');
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans">
        {/* Navigation */}
        <nav className="border-b border-stone-850 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-xl tracking-tight text-white">Pablo Candela</span>
              <span className="px-2 py-0.5 bg-orange-700/20 text-orange-400 text-xs font-bold rounded border border-orange-500/20">ADMIN</span>
            </div>
            <button
              onClick={handleAdminLogout}
              className="text-stone-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          {!isLoggedIn ? (
            /* Login Form */
            <div className="max-w-md mx-auto mt-20 bg-stone-950/50 backdrop-blur-sm p-8 rounded-3xl border border-stone-800 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-orange-700/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl text-white font-semibold">Acceso Administrador</h2>
                <p className="text-stone-400 text-sm mt-2 font-medium">Ingresá la contraseña para acceder a la base de datos de mails.</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-400 mb-2 tracking-wider">Contraseña</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-900 border border-stone-850 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-stone-600 text-sm font-medium"
                    required
                  />
                </div>

                {adminError && (
                  <p className="text-red-400 text-sm font-medium">{adminError}</p>
                )}

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full bg-orange-700 hover:bg-orange-600 text-white font-bold py-3.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {adminLoading ? 'Verificando...' : 'Ingresar'}
                </button>
              </form>
            </div>
          ) : (
            /* Dashboard */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-white">Contactos Registrados</h1>
                  <p className="text-stone-400 text-sm mt-1 font-medium">
                    Gente interesada que descargó la versión gratuita del libro. Total: {registrations.length}
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="bg-orange-700 hover:bg-orange-650 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Exportar a CSV
                </button>
              </div>

              {/* Filters */}
              <div className="relative">
                <Search className="w-5 h-5 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-stone-950/50 border border-stone-800 rounded-2xl pl-12 pr-4 py-3.5 text-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-medium"
                />
              </div>

              {/* Table */}
              <div className="bg-stone-950/30 border border-stone-800 rounded-2rem overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-800 bg-stone-950/55 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Nombre</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Fecha de descarga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850/50 text-sm text-stone-300">
                      {registrations
                        .filter((r) =>
                          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.email.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((reg) => (
                          <tr key={reg.id} className="hover:bg-stone-900/10 transition-colors">
                            <td className="px-6 py-4 text-stone-500 font-mono">#{reg.id}</td>
                            <td className="px-6 py-4 font-semibold text-white">{reg.name}</td>
                            <td className="px-6 py-4">{reg.email}</td>
                            <td className="px-6 py-4 text-stone-400">{formatDate(reg.created_at)}</td>
                          </tr>
                        ))}
                      {registrations.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-stone-500 italic font-medium">
                            No se encontraron registros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-[#F9F4F0]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-900/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-xl tracking-tight">Pablo Candela</span>
            <div className="w-6 h-9 overflow-hidden rounded-[2px] shadow-sm border border-orange-900/10">
              <img
                src="/Imagenes/Tapa.png"
                className="w-full h-full object-cover"
                alt="Mini Tapa"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-black/60">
            <a href="#about" className="hover:text-orange-700 transition-colors">El Libro</a>
            <a href="#author" className="hover:text-orange-700 transition-colors">Autor</a>
            <a href="#preview" className="hover:text-orange-700 transition-colors">Adelanto</a>
          </div>
          <a
            href="https://go.hotmart.com/N101050605D"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-700 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-orange-800 transition-all"
          >
            Comprar Libro Digital
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold tracking-wider uppercase mb-6">
              Lanzamiento Exclusivo
            </span>

            <div className="mb-6">
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-orange-950">
                {BOOK_DATA.title}
                <span className="block text-orange-600 italic mt-2">{BOOK_DATA.subtitle}</span>
              </h1>
            </div>

            <p className="text-xl text-stone-600 max-w-lg mb-8 leading-relaxed font-medium">
              Por {BOOK_DATA.author}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://go.hotmart.com/N101050605D"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-700 text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-orange-800 transition-all shadow-lg shadow-orange-700/20"
              >
                Comprar Libro Digital <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={openDownloadModal}
                className="bg-transparent text-orange-950 border-2 border-orange-950/20 px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-orange-950 hover:text-white transition-all cursor-pointer"
              >
                Descargar Adelanto Gratis <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 0.9 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-[500px] shadow-2xl rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-500 group">
              <img
                src="/Imagenes/Tapa.png"
                alt="Tapa y Contratapa"
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-200 rounded-full blur-3xl opacity-30" />
          </motion.div>
        </div>
      </section>

      {/* Synopsis Section */}
      <section id="about" className="py-24 bg-white border-y border-orange-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl mb-8 text-orange-950">Sobre el Libro</h2>
            <p className="text-2xl font-serif text-stone-700 leading-relaxed mb-12">
              {BOOK_DATA.synopsis}
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="p-8 bg-orange-50 rounded-3xl border border-orange-100">
                <Quote className="w-8 h-8 text-orange-300 mb-4" />
                <p className="text-stone-600 italic leading-relaxed">
                  {BOOK_DATA.backCoverText}
                </p>
              </div>
              <div className="flex flex-col justify-center gap-4">
                {[
                  "Humor y reflexión sin vueltas",
                  "Anécdotas reales y honestas",
                  "Una mirada fresca a la vida",
                  "Ideal para leer con un buen mate"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                    <span className="text-lg font-medium text-stone-800">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Prologue & Index Section */}
      <section id="preview" className="py-24 px-6 bg-orange-900 text-white rounded-[3rem] mx-4 mb-12 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-orange-300 font-bold tracking-widest uppercase text-xs mb-4 block">Un adelanto exclusivo</span>
            <h2 className="font-serif text-5xl md:text-6xl mb-6">Sumergite en sus páginas</h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Prologue */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm p-10 rounded-3xl border border-white/10 flex flex-col justify-center relative overflow-hidden group"
            >
              <Quote className="w-16 h-16 text-orange-400/20 absolute top-6 left-6 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <h3 className="font-serif text-3xl mb-6 text-orange-200">Extracto del Prólogo</h3>
                <div className="text-xl text-orange-50/90 leading-relaxed italic mb-8 space-y-4">
                  {BOOK_DATA.prologueExcerpt.map((paragraph, index) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Index */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm p-10 rounded-3xl border border-white/10"
            >
              <h3 className="font-serif text-3xl mb-8 text-orange-200 flex items-center gap-4">
                <BookOpen className="w-8 h-8 text-orange-400" />
                Índice del Libro
              </h3>
              <ul className="space-y-4">
                {BOOK_DATA.bookIndex.map((chapter, index) => (
                  <li key={index} className="flex gap-4 items-start pb-4 border-b border-white/10 last:border-0 last:pb-0">
                    <span className="text-orange-400 font-serif font-bold italic w-6 shrink-0 mt-1">{index + 1}.</span>
                    <span className="text-orange-100/90 text-lg leading-snug">{chapter}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={openDownloadModal}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-full font-bold text-lg inline-flex items-center gap-3 transition-all shadow-xl shadow-orange-950/40 cursor-pointer"
            >
              Descargar Versión Gratuita (PDF) <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section id="author" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl mb-6 text-orange-950">Sobre Pablo Candela</h2>
            <div className="text-lg text-stone-600 leading-relaxed mb-8 space-y-4">
              <p>
                Pablo se define como alguien que se animó a mirarse de frente: a sus logros, a sus errores y a sus derrotas, sin drama… y con una buena dosis de humor. Cree que reírse de uno mismo es una de las formas más sanas de crecer.
              </p>
              <p>
                Es coach ontológico certificado por ICF y líder en la industria, donde trabaja todos los días con personas reales, problemas reales y desafíos reales. No habla desde la teoría pura: escribe desde la experiencia, desde lo que vivió en el cuerpo y en la cabeza.
              </p>
              <p>
                Su forma de escribir es directa, clara y sin vueltas, como una charla entre amigos. Busca mostrar el lado absurdo y gracioso de las situaciones cotidianas para bajar el peso de los problemas y subir el nivel de conciencia, actitud y responsabilidad personal.
              </p>
              <p>
                Este libro nace de esa mezcla: liderazgo, coaching y vida real. No promete fórmulas mágicas, pero sí algo mucho más poderoso: una nueva manera de mirarte, de entenderte y de pararte frente a lo que te pasa.
              </p>
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/pablo-candela-b646a920a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-orange-100 text-orange-900 hover:bg-orange-200 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/pablocandela.coach/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-orange-100 text-orange-900 hover:bg-orange-200 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold uppercase tracking-widest text-orange-900/40">Contactate conmigo</p>
                <a
                  href="https://wa.me/543364012374?text=Quiero%20mi%20libro%20..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-all w-fit shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="font-bold">WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src={BOOK_DATA.authorImage}
                alt={BOOK_DATA.author}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-orange-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-700" />
            <span className="font-serif font-bold text-xl tracking-tight">Pablo Candela</span>
          </div>
          <p className="text-sm text-stone-400">
            © 2026 Pablo Candela. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm font-medium text-stone-500">
            <a href="#" className="hover:text-orange-700">Contacto</a>
            <a href="#" className="hover:text-orange-700">Prensa</a>
            <a href="#admin" className="hover:text-orange-700 text-stone-400">Admin</a>
          </div>
        </div>
      </footer>

      {/* Modal de Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-orange-950/40 backdrop-blur-md"
            onClick={() => !loading && setIsModalOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#FDFBF7] rounded-[2rem] p-8 max-w-md w-full border border-orange-900/10 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Decors */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-200 rounded-full blur-3xl opacity-40 pointer-events-none" />

            <button
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-30 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {!success ? (
              <div>
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-850 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  Acceso Gratuito
                </span>
                <h3 className="font-serif text-3xl font-bold text-orange-950 mb-3">
                  Descargá el adelanto
                </h3>
                <p className="text-stone-650 text-sm mb-6 leading-relaxed">
                  Completá tus datos para descargar gratis el primer capítulo de <strong>{BOOK_DATA.title}</strong> y sumarte a la comunidad.
                </p>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1.5 tracking-wider">Nombre Completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-850 focus:outline-none focus:ring-2 focus:ring-orange-500/30 placeholder:text-stone-400 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1.5 tracking-wider">Correo Electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ej: juan@example.com"
                      className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-stone-850 focus:outline-none focus:ring-2 focus:ring-orange-500/30 placeholder:text-stone-400 text-sm font-medium"
                      required
                    />
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="subscribe"
                      checked={subscribe}
                      onChange={(e) => setSubscribe(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-stone-300 text-orange-700 focus:ring-orange-500/50 accent-orange-700"
                    />
                    <label htmlFor="subscribe" className="text-xs text-stone-500 leading-normal select-none">
                      Quiero recibir reflexiones, novedades y correos de Pablo Candela.
                    </label>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-700 text-white font-bold py-3.5 rounded-full hover:bg-orange-850 transition-colors shadow-lg shadow-orange-700/10 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                      </>
                    ) : (
                      <>
                        Descargar Ahora <Download className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-3xl font-bold text-orange-950 mb-3">
                  ¡Todo Listo!
                </h3>
                <p className="text-stone-650 text-sm mb-6 leading-relaxed max-w-xs mx-auto">
                  La descarga de <strong>"{BOOK_DATA.title} - Version Gratuita"</strong> ya comenzó.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={triggerDownload}
                    className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-900 font-bold text-sm underline cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> ¿No empezó? Hacé clic acá
                  </button>
                  
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="block w-full bg-orange-50 border border-orange-200 text-orange-950 font-bold py-3.5 rounded-full hover:bg-orange-100 transition-colors text-sm mt-4 cursor-pointer"
                  >
                    Cerrar ventana
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
