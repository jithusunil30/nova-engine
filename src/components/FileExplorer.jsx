import React, { useState, useEffect } from 'react';
import { 
  Folder, FileCode, Save, Plus, RefreshCw, Trash2, 
  ExternalLink, Home, HardDrive, Download, FileText, Compass 
} from 'lucide-react';

export default function FileExplorer() {
  const [files, setFiles] = useState([]);
  const [currentDir, setCurrentDir] = useState('');
  const [quickPaths, setQuickPaths] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const fetchFiles = async (dir = '') => {
    try {
      const res = await fetch(`/api/tools/files?dir=${encodeURIComponent(dir)}`);
      const data = await res.json();
      setFiles(data.files || []);
      setCurrentDir(data.currentDir || '');
    } catch (err) {
      console.error('Failed to list directory', err);
    }
  };

  const fetchQuickPaths = async () => {
    try {
      const res = await fetch('/api/tools/files/quickdir');
      const data = await res.json();
      setQuickPaths(data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchFiles();
    fetchQuickPaths();
  }, []);

  const openFile = async (filePath) => {
    try {
      const res = await fetch('/api/tools/files/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      const data = await res.json();
      setSelectedFile(filePath);
      setFileContent(data.content || '');
    } catch (err) {
      console.error('Failed to read file', err);
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      await fetch('/api/tools/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: selectedFile, content: fileContent })
      });
      setIsSaving(false);
    } catch (err) {
      setIsSaving(false);
      console.error('Failed to save file', err);
    }
  };

  const openExternal = async () => {
    if (!selectedFile) return;
    try {
      await fetch('/api/tools/files/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: selectedFile })
      });
    } catch (err) {}
  };

  const deleteFile = async () => {
    if (!selectedFile) return;
    if (!window.confirm(`Are you sure you want to delete file/folder: ${selectedFile}?`)) return;
    try {
      await fetch('/api/tools/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: selectedFile })
      });
      setSelectedFile(null);
      setFileContent('');
      fetchFiles(currentDir);
    } catch (err) {}
  };

  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const fullPath = `${currentDir}/${newFileName}`;
    try {
      await fetch('/api/tools/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: fullPath, content: `// ${newFileName}\n` })
      });
      setNewFileName('');
      fetchFiles(currentDir);
      openFile(fullPath);
    } catch (err) {
      console.error('Failed to create file', err);
    }
  };

  return (
    <div className="hud-panel p-5 flex flex-col items-center gap-4 w-full">
      {/* Centered Component Header */}
      <div className="flex flex-col items-center text-center gap-1 border-b border-cyan-500/30 pb-3 w-full">
        <div className="flex items-center justify-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h2 className="font-hud font-bold text-base tracking-wider text-cyan-200">
            SYSTEM & WORKSPACE FILE EXPLORER
          </h2>
        </div>
        <p className="font-mono-hud text-xs text-amber-300 truncate max-w-full">
          Current Directory: {currentDir || 'Loading...'}
        </p>

        {/* Quick System Directory Chips */}
        {quickPaths && (
          <div className="flex items-center justify-center flex-wrap gap-2 mt-1 font-mono-hud text-[11px]">
            <button
              onClick={() => fetchFiles(quickPaths.workspace)}
              className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 flex items-center gap-1"
            >
              <Folder className="w-3 h-3 text-amber-400" /> Project Workspace
            </button>
            <button
              onClick={() => fetchFiles(quickPaths.home)}
              className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 flex items-center gap-1"
            >
              <Home className="w-3 h-3 text-cyan-400" /> User Home
            </button>
            <button
              onClick={() => fetchFiles(quickPaths.desktop)}
              className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 flex items-center gap-1"
            >
              <Folder className="w-3 h-3 text-emerald-400" /> Desktop
            </button>
            <button
              onClick={() => fetchFiles(quickPaths.downloads)}
              className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-purple-400" /> Downloads
            </button>
            <button
              onClick={() => fetchFiles(quickPaths.rootDrive)}
              className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 flex items-center gap-1"
            >
              <HardDrive className="w-3 h-3 text-rose-400" /> System Drive ({quickPaths.rootDrive})
            </button>
          </div>
        )}
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* File Tree Column */}
        <div className="flex flex-col gap-3 border-r border-cyan-500/20 pr-4">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <span className="font-hud font-bold text-xs text-cyan-200">DIRECTORY CONTENTS</span>
            <button onClick={() => fetchFiles(currentDir)} className="p-1 text-cyan-400 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Directory Items List */}
          <div className="bg-black/50 p-2 rounded border border-cyan-500/20 font-mono-hud text-xs flex flex-col gap-1 max-h-[340px] overflow-y-auto">
            {files.map((f, idx) => (
              <button
                key={idx}
                onClick={() => f.isDir ? fetchFiles(f.path) : openFile(f.path)}
                className={`flex items-center justify-between p-2 rounded text-left transition ${
                  selectedFile === f.path ? 'bg-cyan-950 border border-cyan-400 text-amber-300' : 'hover:bg-cyan-900/30 text-cyan-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {f.isDir ? <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                  <span className="truncate">{f.name}</span>
                </div>
                {f.size > 0 && <span className="text-[10px] text-cyan-600 ml-2">{Math.round(f.size / 1024)} KB</span>}
              </button>
            ))}
          </div>

          {/* Quick New File Creator */}
          <form onSubmit={handleCreateFile} className="flex gap-2 mt-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="New file (e.g. script.js)..."
              className="flex-1 bg-black/50 border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs text-cyan-100 font-mono-hud"
            />
            <button type="submit" className="btn-hud px-3 py-1.5 rounded text-xs flex items-center gap-1 font-hud font-bold">
              <Plus className="w-3.5 h-3.5" /> CREATE
            </button>
          </form>
        </div>

        {/* File Editor Column */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <span className="font-mono-hud text-xs text-amber-300 truncate max-w-[60%]">
              {selectedFile || 'Select a file from workspace tree to inspect or edit'}
            </span>
            {selectedFile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={openExternal}
                  className="p-1.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono-hud flex items-center gap-1"
                  title="Open file in OS Default App"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> OPEN IN OS
                </button>
                <button
                  onClick={deleteFile}
                  className="p-1.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:text-rose-100 text-xs font-mono-hud flex items-center gap-1"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" /> DELETE
                </button>
                <button
                  onClick={saveFile}
                  disabled={isSaving}
                  className="btn-hud-gold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 font-hud font-bold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'SAVING...' : 'SAVE'}</span>
                </button>
              </div>
            )}
          </div>

          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            placeholder="// File editor pane. Click any file from workspace tree to inspect or edit..."
            className="w-full h-[320px] bg-[#02050b] border border-cyan-500/30 rounded p-3 font-mono-hud text-xs text-emerald-300 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
