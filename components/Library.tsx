
import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Search, Trash2, Sparkles, Loader2, HelpCircle, BookOpen, FileCheck, Wand2, Download, RefreshCw } from 'lucide-react';
import { analyzeImage, generateStudyImage } from '../services/geminiService';

type LibraryTab = 'upload' | 'visualizer';

export const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('upload');
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Visualizer State
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    try {
      const base64Data = selectedFile.split(',')[1];
      const prompt = `
        Analyze this document (image or PDF). 
        1. Provide a concise summary of the key concepts for a student.
        2. Generate a list of the most important study questions that might appear on an exam based on this content.
        
        Format the output clearly with Markdown headings like '### Summary' and '### Study Questions'.
      `;
      const result = await analyzeImage(base64Data, mimeType, prompt);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setAnalysis("Error analyzing document. Please ensure it is a valid image or PDF and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const visualPrompt = `A high-quality, clear educational diagram or visual aid showing: ${imagePrompt}. Professional style, accurate details, suitable for a textbook.`;
      const imageUrl = await generateStudyImage(visualPrompt);
      setGeneratedImage(imageUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Study Library</h1>
          <p className="text-slate-500 mt-1">Upload materials or generate custom diagrams for your study sessions.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload & Analyze
          </button>
          <button 
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'visualizer' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            AI Visualizer
          </button>
        </div>
      </header>

      {activeTab === 'upload' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-left-4 duration-500">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Upload Materials
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-indigo-400 transition-colors cursor-pointer group relative min-h-[300px]">
              <input 
                type="file" 
                accept="image/*,application/pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center">
                  {mimeType.includes('image') ? (
                    <img src={selectedFile} alt="Preview" className="max-h-48 rounded-lg shadow-sm mb-4 object-contain" />
                  ) : (
                    <div className="p-8 bg-indigo-50 rounded-2xl mb-4 text-indigo-600">
                      <FileText className="w-16 h-16" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 line-clamp-1 px-4">{fileName}</p>
                    <p className="text-xs text-slate-400">{mimeType.includes('pdf') ? 'PDF Document' : 'Image File'}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFileName(''); }}
                    className="mt-4 text-red-500 hover:text-red-600 text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove File
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors mb-4">
                    <ImageIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="font-semibold text-slate-800">Drop your study material here</p>
                  <p className="text-xs text-slate-400 mt-1">Supports Images & PDFs (up to 20MB)</p>
                </>
              )}
            </div>

            <button 
              disabled={!selectedFile || isAnalyzing}
              onClick={handleAnalyze}
              className="mt-6 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Document...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Summarize & Extract Questions
                </>
              )}
            </button>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                AI Insight Engine
              </h2>
              {analysis && (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1">
                  <FileCheck className="w-3 h-3" /> Ready
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {analysis ? (
                <div className="space-y-6">
                  <div className="prose prose-indigo prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {analysis}
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mt-8">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                      <HelpCircle className="w-4 h-4" />
                      Study Strategy
                    </div>
                    <p className="text-xs text-indigo-800 opacity-90 italic">
                      Focus on the summary first to build a mental map, then use the questions for an active recall session. 
                      Mastering these will significantly boost your retention!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic py-20 text-center">
                  <div className="relative">
                    <Search className="w-16 h-16 mb-6 opacity-10" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="max-w-[200px] text-sm">Upload a textbook page or PDF. I'll distill it into a concise summary and key test questions.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              Visual Prompt
            </h2>
            <p className="text-sm text-slate-500 mb-6">Describe the diagram, chart, or visual concept you want to generate for your notes.</p>
            
            <div className="space-y-4 flex-1">
              <textarea 
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="e.g., 'A detailed diagram of a plant cell with labeled organelles', 'A timeline of the Industrial Revolution', 'The water cycle process chart'..."
                className="w-full h-48 p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all placeholder:text-slate-400"
              />
              
              <div className="grid grid-cols-2 gap-3">
                {['Mind Map', 'Infographic', 'Scientific Diagram', 'Concept Sketch'].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setImagePrompt(prev => `${prev} ${hint}`.trim())}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-all text-left"
                  >
                    + {hint}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={isGenerating || !imagePrompt.trim()}
              onClick={handleGenerateImage}
              className="mt-6 w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Visual...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Custom Visual
                </>
              )}
            </button>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                Visual Result
              </h2>
              {generatedImage && (
                <div className="flex gap-2">
                   <button 
                    onClick={handleGenerateImage}
                    className="p-2 text-slate-400 hover:text-purple-600 transition-colors bg-slate-50 rounded-lg"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <a 
                    href={generatedImage} 
                    download={`EduCareAI-Visual-${Date.now()}.png`}
                    className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative group">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                  <p className="text-sm font-medium text-slate-400 animate-pulse">Lumina is crafting your visual aid...</p>
                </div>
              ) : generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="Generated study visual" 
                  className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-700"
                />
              ) : (
                <div className="text-center px-8 text-slate-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-sm italic">Enter a prompt to create a high-quality visual or diagram for your studies.</p>
                </div>
              )}
            </div>

            {generatedImage && (
              <div className="mt-4 p-4 bg-purple-50/50 rounded-xl text-[10px] text-purple-700 leading-relaxed border border-purple-100 italic">
                <strong>Tip:</strong> You can download this image and attach it to your physical notes or insert it into digital study decks.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
