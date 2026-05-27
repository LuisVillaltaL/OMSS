import React, { useState, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BadgeAdjunto from './ui/BadgeAdjunto';

export default function EditorTextoEnriquecido({
  modo = 'default',
  placeholder = 'Escribe aquí...',
  textoBotonPrincipal = 'Enviar',
  onAccionPrincipal,
  mostrarPestanas = false,
  loading = false,
  elementosBarraExtra = null
}) {
  const [texto, setTexto] = useState('');
  const [esInterna, setEsInterna] = useState(false);
  const [archivos, setArchivos] = useState([]);

  // Evita re-render de la barra cada vez que tecleas
  const modules = useMemo(() => ({
    toolbar: `#toolbar-editor-${modo}`
  }), [modo]);

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
        setArchivos(prev => [...prev, {
          nombre: file.name,
          base64: reader.result,
          size: file.size
        }]);
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
         alert('No puedes enviar una respuesta vacía sin adjuntos.');
         return;
      }
    }

    const datos = {
      texto,
      esInterna,
      archivos
    };

    if (onAccionPrincipal) {
      onAccionPrincipal(datos);
    }
    
    // Opcional: Limpiar el editor tras enviar si el componente padre no se desmonta.
    // En "crear" el modal se cierra. En "responder" deberíamos limpiarlo.
    if (modo === 'responder') {
       setTexto('');
       setArchivos([]);
       setEsInterna(false);
    }
  };

  return (
    <div className={`w-full bg-slate-50/80 border border-slate-200 rounded-xl p-5 transition-all focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-sm ${mostrarPestanas ? 'border-l-[3px] border-l-slate-400 focus-within:border-l-slate-500' : ''}`}>
      
      {/* Pestañas Superiores (Opcional) */}
      {mostrarPestanas && (
        <div className="mb-4">
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

      <div>
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

        {/* Render Badges de Archivos antes de la barra */}
        {archivos.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 animate-scale-up">
            {archivos.map((file, idx) => (
              <BadgeAdjunto
                key={idx}
                nombre={file.nombre}
                onRemove={() => removeFile(idx)}
              />
            ))}
          </div>
        )}

        {/* Barra de Herramientas Inferior */}
        <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center gap-4 flex-wrap">
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
            <div id={`toolbar-editor-${modo}`} className="!border-none !p-0 !m-0 !bg-transparent flex items-center gap-1 [&_.ql-picker]:!w-24 [&_.ql-picker-options]:!top-auto [&_.ql-picker-options]:!bottom-full [&_.ql-picker-options]:!mb-1">
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

            {/* Elementos extra en la barra (ej. Asignar A) */}
            {elementosBarraExtra}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 bg-[#3C50E0] hover:bg-[#2B3EAF] active:scale-[0.98] disabled:opacity-60 whitespace-nowrap`}
          >
            {loading ? 'Procesando...' : textoBotonPrincipal}
          </button>
        </div>
      </div>
    </div>
  );
}
