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
  Quote
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Analytics } from "@vercel/analytics/react";

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
          </div>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}
