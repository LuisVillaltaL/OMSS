import React, { useState, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BadgeAdjunto from './ui/BadgeAdjunto';

export default function EditorTicket({
  modo = 'responder', // 'crear' | 'responder'
  rolUsuario = 'usuario_final',
  ticketId = null,
  catalogoTecnicos = [],
  onCrearTicket,
  onResponderTicket,
  loading = false,
  topChildren,
  children
}) {
  const [texto, setTexto] = useState('');
  const [esInterna, setEsInterna] = useState(false);
  const [asignarA, setAsignarA] = useState('');
  const [archivos, setArchivos] = useState([]);

  // Evita re-render de la barra cada vez que tecleas
  const modules = useMemo(() => ({
    toolbar: `#toolbar-editor-ticket-${modo}`
  }), [modo]);

  const esSoporte = rolUsuario !== 'usuario_final' && rolUsuario !== 'cliente';

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    if (filesArray.length === 0) return;

    filesArray.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`El archivo "${file.name}" supera el límite de 10 MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setArchivos(prev => {
          // Si es responder, podríamos permitir varios o dejar el mismo comportamiento.
          // Para ser consistentes y robustos, permitiremos array de archivos en ambos modos.
          // Si el modo "responder" solo soporta 1 en backend, el padre puede limitarlo.
          return [...prev, {
            nombre: file.name,
            base64: reader.result,
            size: file.size
          }];
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = null; // reset input
  };

  const removeFile = (idx) => {
    setArchivos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const textOnly = texto.replace(/<[^>]*>?/gm, '').trim();
    if (!textOnly && !texto.includes('<img') && archivos.length === 0) {
      if (modo === 'responder') {
         alert('No puedes enviar una respuesta vacía.');
         return;
      }
      // En modo 'crear', el titulo/categoria importan más, pero igual exigimos cuerpo.
    }

    const datos = {
      texto,
      esInterna,
      asignarA,
      archivos,
      ticketId
    };

    if (modo === 'crear' && onCrearTicket) {
      onCrearTicket(datos);
    } else if (modo === 'responder' && onResponderTicket) {
      onResponderTicket(datos);
    }
  };

  const placeholder = modo === 'crear' 
    ? 'Describe el problema detalladamente (pasos para reproducir, impacto operativo, capturas)...' 
    : 'Escribe tu respuesta aquí...';

  const submitText = modo === 'crear' ? 'Crear Ticket de Incidente' : 'Responder Ticket';

  return (
    <div className={`w-full ${modo === 'crear' ? 'bg-slate-50/80 border border-slate-200 border-l-[3px] border-l-slate-400 rounded-xl p-5 transition-all focus-within:border-l-slate-500 focus-within:bg-white focus-within:shadow-sm' : ''}`}>
      
      {/* Tabs (Solo responder y soporte) */}
      {modo === 'responder' && esSoporte && (
        <div className="px-6 pt-4">
          <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/30 shadow-inner w-fit">
            <button
              type="button"
              onClick={() => setEsInterna(false)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                !esInterna ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              Respuesta
            </button>
            <button
              type="button"
              onClick={() => setEsInterna(true)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                esInterna ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Interna
            </button>
          </div>
        </div>
      )}

      <div className={modo === 'responder' ? 'px-6 py-4' : 'mt-3'}>
        {/* Renderizado de campos superiores (ej. Título) */}
        {topChildren}

        {/* Editor de Texto */}
        <div className="mb-3 [&_.ql-container]:!border-none [&_.ql-editor]:px-0 [&_.ql-editor]:min-h-[80px] [&_.ql-editor]:text-xs [&_.ql-editor]:text-slate-700">
          <ReactQuill
            theme="snow"
            value={texto}
            onChange={setTexto}
            placeholder={placeholder}
            modules={modules}
          />
        </div>

        {/* Renderizado de campos adicionales pasados por children */}
        {children}

        {/* Barra de Herramientas Inferior */}
        <div className="border-t border-slate-200/60 pt-3 mt-4 flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Botón Adjuntar */}
            <div>
              <input
                type="file"
                multiple
                className="hidden"
                id={`file-upload-${modo}`}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,image/*"
                onChange={handleFileChange}
              />
              <label
                htmlFor={`file-upload-${modo}`}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-full text-[10px] font-bold text-slate-550 cursor-pointer bg-white hover:bg-slate-50 transition-colors shadow-sm select-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
                <span>Adjuntar</span>
              </label>
            </div>

            {/* Toolbar Custom ReactQuill */}
            <div id={`toolbar-editor-ticket-${modo}`} className="!border-none !p-0 !m-0 !bg-transparent flex items-center gap-1 [&_.ql-picker]:!w-24 [&_.ql-picker-options]:!top-auto [&_.ql-picker-options]:!bottom-full [&_.ql-picker-options]:!mb-1">
              <select className="ql-header" defaultValue="" onChange={e => e.persist()}>
                <option value="1">Tít 1</option>
                <option value="2">Tít 2</option>
                <option value="">Normal</option>
              </select>
              <button className="ql-bold" />
              <button className="ql-italic" />
              <button className="ql-underline" />
              <button className="ql-link" />
              <button className="ql-list" value="ordered" />
              <button className="ql-list" value="bullet" />
              <button className="ql-clean" />
            </div>

            {/* Asignar A (Dinámico por rol, solo en respuesta) */}
            {esSoporte && modo === 'responder' && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Asignar a:</span>
                <select
                  value={asignarA}
                  onChange={(e) => setAsignarA(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">- Sin asignar -</option>
                  {catalogoTecnicos?.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre} ({t.perfil || 'Soporte'})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 ${
              esInterna ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#3C50E0] hover:bg-[#2B3EAF]'
            } active:scale-[0.98] disabled:opacity-60`}
          >
            {loading ? 'Procesando...' : submitText}
          </button>
        </div>

        {/* Render Badges de Archivos */}
        {archivos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {archivos.map((file, idx) => (
              <BadgeAdjunto
                key={idx}
                nombre={file.nombre}
                onRemove={() => removeFile(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
