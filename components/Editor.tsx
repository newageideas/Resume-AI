import React, { useState } from 'react';
import { ResumeData } from '../types';
import { FileText, Wand2, RefreshCw, Sparkles, Palette, Upload, User, Layout, Plus, Lightbulb, X, Briefcase, Calendar, ChevronDown, Clock } from 'lucide-react';
import { VocabLevel, THEME_COLORS } from '../App';
import { generateExperienceSuggestions } from '../services/geminiService';

interface EditorProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  onParse: (text: string) => void;
  isProcessing: boolean;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  vocabLevel: VocabLevel;
  setVocabLevel: (level: VocabLevel) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
  apiKey: string;
}

const Editor: React.FC<EditorProps> = ({ 
  resumeData, 
  setResumeData, 
  jobDescription, 
  setJobDescription, 
  onParse,
  isProcessing,
  onAnalyze,
  isAnalyzing,
  vocabLevel,
  setVocabLevel,
  themeColor,
  setThemeColor,
  onShowToast,
  apiKey
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'design' | 'json' | 'import'>('visual');
  const [rawText, setRawText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Suggestions State
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<{ text: string }[]>([]);
  const [isGeneratingPhrases, setIsGeneratingPhrases] = useState(false);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    try {
      const parsed = JSON.parse(val);
      setResumeData(parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError((err as Error).message);
    }
  };

  const handleImport = () => {
    if (rawText.trim()) {
      onParse(rawText);
    }
  };

  const updateField = (section: keyof ResumeData, value: any) => {
    setResumeData({ ...resumeData, [section]: value });
  };

  const updateContact = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      contact: { ...resumeData.contact, [field]: value }
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          updateContact('photo', evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const randomizeTheme = () => {
    const randomColor = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];
    setThemeColor(randomColor);
  };

  const handleFetchSuggestions = async (index: number, role: string) => {
    if (!role.trim()) return;
    setActiveSuggestionIndex(index);
    setIsGeneratingPhrases(true);
    setSuggestions([]);
    
    try {
        const phrases = await generateExperienceSuggestions(role, apiKey);
        setSuggestions(phrases.map(text => ({ text })));
    } catch (e) {
        console.error(e);
        onShowToast((e as Error).message || "Failed to generate suggestions.", "error");
        setActiveSuggestionIndex(null);
    } finally {
        setIsGeneratingPhrases(false);
    }
  };

  const addSuggestionToDescription = (index: number, text: string) => {
    const newExp = [...resumeData.experience];
    const currentDesc = newExp[index].description;
    // Add to end, filter empty lines to keep it clean
    newExp[index].description = [...currentDesc.filter(d => d.trim() !== ''), text];
    setResumeData({ ...resumeData, experience: newExp });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('visual')}
          className={`flex-1 py-3 text-sm font-medium whitespace-nowrap px-2 ${activeTab === 'visual' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50 dark:bg-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Editor
        </button>
         <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1 whitespace-nowrap px-2 ${activeTab === 'design' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50 dark:bg-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <Palette size={14} /> Design
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`flex-1 py-3 text-sm font-medium whitespace-nowrap px-2 ${activeTab === 'json' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50 dark:bg-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          JSON
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1 whitespace-nowrap px-2 ${activeTab === 'import' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50 dark:bg-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <Wand2 size={14} /> Import
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'visual' && (
          <div className="space-y-6">

            {/* --- NEW JOB TRACKER WIDGET --- */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 text-white shadow-lg mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-brand-200">
                  <Briefcase size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Application Status</span>
                </div>
                <div className="flex items-center gap-2 text-xs opacity-70">
                  <Clock size={14} />
                  <span>Last updated: Just now</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <select 
                    className="w-full appearance-none bg-gray-700/50 border border-gray-600 hover:border-brand-400 text-sm rounded px-3 py-2 outline-none focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
                    defaultValue="draft"
                  >
                    <option value="draft">Drafting</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer Received</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none group-hover:text-white" />
                </div>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-brand-500/20">
                  <Calendar size={14} />
                  Set Reminder
                </button>
              </div>
            </div>
            {/* ------------------------------- */}

            {/* Basic Info */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Basics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Job Title</label>
                  <input
                    type="text"
                    value={resumeData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Email</label>
                  <input
                    type="text"
                    value={resumeData.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Phone</label>
                  <input
                    type="text"
                    value={resumeData.contact.phone}
                    onChange={(e) => updateContact('phone', e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                 <label className="text-xs text-gray-500">Summary</label>
                 <textarea
                   rows={4}
                   value={resumeData.summary}
                   onChange={(e) => updateField('summary', e.target.value)}
                   className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                 />
              </div>
            </section>

             <hr className="border-gray-200 dark:border-gray-700" />

            {/* Experience */}
            <section>
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Experience</h3>
                 <button 
                    onClick={() => {
                        const newExp = [...resumeData.experience, { company: '', role: '', start: '', end: '', description: [] }];
                        setResumeData({ ...resumeData, experience: newExp });
                    }}
                    className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
                 >
                    <Plus size={14} /> Add Role
                 </button>
              </div>
              
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex gap-2 mb-3">
                    <input
                      className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[idx].company = e.target.value;
                        setResumeData({ ...resumeData, experience: newExp });
                      }}
                      placeholder="Company Name"
                    />
                    <div className="flex-1 relative">
                        <input
                        className="w-full p-2 bg-white dark:bg-