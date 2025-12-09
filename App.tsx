import React, { useState, useEffect } from 'react';
import { ResumeData, INITIAL_RESUME, AnalysisResult } from './types';
import Editor from './components/Editor';
import ResumePreview from './components/ResumePreview';
import AnalysisPanel from './components/AnalysisPanel';
import ResumePDF from './components/ResumePDF';
import { parseResumeFromText, analyzeResumeFit } from './services/geminiService';
import { Download, Moon, Sun, Loader2, AlertCircle, CheckCircle2, Settings, Key } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';

export type VocabLevel = 'simple' | 'professional';

export const THEME_COLORS = [
  '#1f2937', // Gray (Default)
  '#2563eb', // Blue
  '#16a34a', // Green
  '#9333ea', // Purple
  '#dc2626', // Red
  '#ea580c', // Orange
  '#0891b2', // Cyan
];

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // New features state
  const [vocabLevel, setVocabLevel] = useState<VocabLevel>('professional');
  const [themeColor, setThemeColor] = useState<string>(THEME_COLORS[0]);
  
  // API Key State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save API Key to local storage
  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleParse = async (text: string) => {
    setIsParsing(true);
    try {
      const data = await parseResumeFromText(text, apiKey);
      if (data) {
        setResumeData(data);
        showToast("Resume parsed successfully!", "success");
      }
    } catch (error) {
      showToast((error as Error).message || "Failed to parse resume.", "error");
      if ((error as Error).message.includes("API Key")) {
        setShowSettings(true);
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      showToast("Please enter a job description first.", "error");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeResumeFit(resumeData, jobDescription, apiKey);
      if (result) {
        setAnalysisResult(result);
        showToast("Analysis complete!", "success");
      }
    } catch (error) {
      showToast((error as Error).message || "Analysis failed.", "error");
      if ((error as Error).message.includes("API Key")) {
        setShowSettings(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium z-50 animate-in slide-in-from-bottom-5 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="text-brand-600" /> App Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gemini API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API Key"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Key is stored locally in your browser. Leave empty if you are using environment variables.
                  <br />
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    Get an API Key here
                  </a>
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">AI</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">IMA FRee REsume</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <PDFDownloadLink
              document={<ResumePDF data={resumeData} themeColor={themeColor} />}
              fileName={`${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition no-underline"
            >
              {({ blob, url, loading, error }) => {
                if (error) return <span className="text-red-400 text-xs">Error</span>;
                return (
                  <>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    <span className="hidden md:inline">{loading ? 'Loading...' : 'Download PDF'}</span>
                    <span className="md:hidden">PDF</span>
                  </>
                );
              }}
            </PDFDownloadLink>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Editor */}
            <div className="lg:col-span-3 h-full overflow-hidden border-r border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 lg:bg-transparent">
                <Editor 
                    resumeData={resumeData}
                    setResumeData={setResumeData}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    onParse={handleParse}
                    isProcessing={isParsing}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    vocabLevel={vocabLevel}
                    setVocabLevel={setVocabLevel}
                    themeColor={themeColor}
                    setThemeColor={setThemeColor}
                    onShowToast={showToast}
                    apiKey={apiKey}
                />
            </div>

            {/* Middle: Preview */}
            <div className="lg:col-span-6 h-full bg-gray-100 dark:bg-gray-900/50 overflow-hidden relative">
                <ResumePreview 
                  data={resumeData} 
                  vocabLevel={vocabLevel}
                  themeColor={themeColor}
                />
            </div>

            {/* Right: Analysis */}
            <div className="lg:col-span-3 h-full overflow-hidden border-l border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <AnalysisPanel 
                  result={analysisResult} 
                  isAnalyzing={isAnalyzing} 
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                />
            </div>
        </div>
      </main>
    </div>
  );
}