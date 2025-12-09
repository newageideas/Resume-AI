import React, { useState, useEffect } from 'react';
import { ResumeData, INITIAL_RESUME, AnalysisResult } from './types';
import Editor from './components/Editor';
import ResumePreview from './components/ResumePreview';
import AnalysisPanel from './components/AnalysisPanel';
import { parseResumeFromText, analyzeResumeFit } from './services/geminiService';
import { Download, Moon, Sun } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // New features state
  const [vocabLevel, setVocabLevel] = useState<VocabLevel>('professional');
  const [themeColor, setThemeColor] = useState<string>(THEME_COLORS[0]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleParse = async (text: string) => {
    setIsParsing(true);
    const data = await parseResumeFromText(text);
    if (data) {
      setResumeData(data);
    }
    setIsParsing(false);
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeResumeFit(resumeData, jobDescription);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;

    try {
        const canvas = await html2canvas(element, { 
            scale: 2,
            useCORS: true,
            logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (err) {
        console.error("PDF generation failed", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">AI</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Smart Resume</h1>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition"
            >
                <Download size={18} />
                <span>Export PDF</span>
            </button>
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
                <AnalysisPanel result={analysisResult} isAnalyzing={isAnalyzing} />
            </div>
        </div>
      </main>
    </div>
  );
}