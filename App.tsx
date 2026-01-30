
import React, { useState, useRef, useCallback } from 'react';
import { AppStatus, EditedImage } from './types';
import { editImage } from './services/geminiService';
import { uploadGeneratedImage } from './services/storageService';
import { 
  CloudArrowUpIcon, 
  SparklesIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const SUGGESTED_PROMPTS = [
  "Remove background and make it pure white",
  "Add a cinematic moody lighting",
  "Place the product on a luxury marble table",
  "Clean up background distractions",
  "Add a soft golden hour filter",
  "Make it look like a high-end catalog shot"
];

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<EditedImage[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!originalImage || !activePrompt.trim()) return;

    setStatus(AppStatus.PROCESSING);
    setErrorMessage(null);

    try {
      const result = await editImage(originalImage, activePrompt);
      setEditedImage(result);

      const newEntry: EditedImage = {
        id: Date.now().toString(),
        originalUrl: originalImage,
        editedUrl: result,
        prompt: activePrompt,
        timestamp: Date.now(),
      };

      setHistory(prev => [newEntry, ...prev]);
      setStatus(AppStatus.IDLE);

      uploadGeneratedImage(result, activePrompt)
        .then((meta) => {
          setHistory(prev =>
            prev.map((e) =>
              e.id === newEntry.id ? { ...e, firebaseUrl: meta.imageUrl } : e
            )
          );
        })
        .catch((err) => console.warn('Firebase save skipped:', err?.message || err));
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process image. Please try again.");
      setStatus(AppStatus.ERROR);
    }
  };

  const clearApp = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt('');
    setErrorMessage(null);
    setStatus(AppStatus.IDLE);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadImage = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `edited-product-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">SnapClean<span className="text-indigo-600">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {originalImage && (
              <button 
                onClick={clearApp}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Reset Studio
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Workspace Area */}
          <div className="lg:col-span-8 space-y-6">
            {!originalImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center bg-white hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CloudArrowUpIcon className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">Upload your product photo</h2>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">Drag and drop or click to browse. Best results with clear product shots.</p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all">
                  Choose Image
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="aspect-square relative bg-slate-100 flex items-center justify-center p-4">
                  {!editedImage ? (
                    <img 
                      src={originalImage} 
                      alt="Original" 
                      className="max-w-full max-h-full object-contain rounded-xl shadow-xl"
                    />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img 
                        src={editedImage} 
                        alt="Edited" 
                        className="max-w-full max-h-full object-contain rounded-xl shadow-xl animate-in fade-in duration-500"
                      />
                      <button 
                        onClick={() => setEditedImage(null)}
                        className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-md px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-600 hover:bg-white transition-all flex items-center gap-1.5"
                      >
                        <ArrowPathIcon className="w-3.5 h-3.5" />
                        Show Original
                      </button>
                    </div>
                  )}
                  
                  {status === AppStatus.PROCESSING && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <h3 className="text-lg font-bold text-slate-800">Magically editing...</h3>
                      <p className="text-sm text-slate-600 mt-2">Gemini is re-imagining your photo based on your request.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error UI */}
            {status === AppStatus.ERROR && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                <ExclamationCircleIcon className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800">Editing Failed</h4>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls & History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-indigo-500" />
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    disabled={!originalImage || status === AppStatus.PROCESSING}
                    onClick={() => {
                      setPrompt(p);
                      handleEdit(p);
                    }}
                    className="text-xs font-medium px-3 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {history.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Session History</h3>
                  <button onClick={() => setHistory([])} className="text-xs text-slate-400 hover:text-red-500">Clear All</button>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {history.map((item) => (
                    <div key={item.id} className="group relative flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden cursor-pointer" onClick={() => setEditedImage(item.editedUrl)}>
                        <img src={item.editedUrl} alt="History item" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{item.prompt}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(item.timestamp).toLocaleTimeString()}</p>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = item.editedUrl;
                              link.download = `edit-${item.id}.png`;
                              link.click();
                            }}
                            className="text-[10px] text-indigo-600 hover:underline"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Control Bar */}
      {originalImage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex items-center gap-2">
            <div className="flex-1 flex items-center px-4">
              <SparklesIcon className="w-5 h-5 text-indigo-400 mr-3" />
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                placeholder="Type your editing instruction..."
                className="bg-transparent text-white placeholder:text-slate-500 border-none outline-none w-full text-sm py-2"
                disabled={status === AppStatus.PROCESSING}
              />
            </div>
            
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-2 pr-1">
              {editedImage ? (
                <button
                  onClick={downloadImage}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white h-10 px-4 rounded-xl flex items-center gap-2 transition-all font-medium text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              ) : (
                <button
                  onClick={() => handleEdit()}
                  disabled={!prompt.trim() || status === AppStatus.PROCESSING}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white h-10 px-6 rounded-xl flex items-center gap-2 transition-all font-medium text-sm shadow-lg shadow-indigo-600/20"
                >
                  {status === AppStatus.PROCESSING ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      Apply
                    </>
                  )}
                </button>
              )}
              
              <button 
                onClick={clearApp}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Discard current edit"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;
