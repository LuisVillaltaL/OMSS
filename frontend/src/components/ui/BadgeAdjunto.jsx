import React from 'react';

export function AttachmentIcon({ extension }) {
  const ext = (extension || '').toLowerCase();
  if (ext === 'pdf') {
    return (
      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12h9m9-3H9m1.5-6H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    );
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return (
      <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M10.5 5.25v13.5m4-13.5v13.5" />
      </svg>
    );
  }
  if (['doc', 'docx'].includes(ext)) {
    return (
      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h1.5m-1.5-3H12m-9-3.75h16.5M5.625 4.5h12.75c.621 0 1.125.504 1.125 1.125v17.25c0 .621-.504 1.125-1.125 1.125H5.625a1.125 1.125 0 0 1-1.125-1.125V5.625c0-.621.504-1.125 1.125-1.125Z" />
      </svg>
    );
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
    return (
      <svg className="w-4 h-4 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function BadgeAdjunto({ nombre, url, onRemove }) {
  const extension = (nombre || '').split('.').pop() || '';
  
  const getAttachmentBadgeClasses = (ext) => {
    const e = ext.toLowerCase();
    if (e === 'pdf') {
      return 'bg-rose-50/60 text-rose-600 border-rose-200/50 hover:bg-rose-100/50';
    }
    if (['xls', 'xlsx', 'csv'].includes(e)) {
      return 'bg-emerald-50/60 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100/50';
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(e)) {
      return 'bg-blue-50/60 text-blue-600 border-blue-200/50 hover:bg-blue-100/50';
    }
    return 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100';
  };

  const badgeContent = (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all duration-150 shadow-sm ${getAttachmentBadgeClasses(extension)}`}>
      <AttachmentIcon extension={extension} />
      <span className="truncate max-w-[150px]">{nombre}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="text-slate-400 hover:text-red-500 ml-1.5 transition-colors flex items-center justify-center flex-shrink-0"
          title="Eliminar archivo"
        >
          <CloseIcon />
        </button>
      )}
    </span>
  );

  if (url) {
    const handleDownload = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      } catch (err) {
        console.error('Error al descargar el archivo:', err);
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <span
        onClick={handleDownload}
        className="inline-block cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleDownload(e)}
      >
        {badgeContent}
      </span>
    );
  }

  return badgeContent;
}
