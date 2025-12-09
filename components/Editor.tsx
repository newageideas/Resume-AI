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
  onShowToast
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
        const phrases = await generateExperienceSuggestions(role);
        setSuggestions(phrases.map(text => ({ text })));
    } catch (e) {
        console.error(e);
        onShowToast("Failed to generate suggestions. Please check your connection and try again.", "error");
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
                    // In a real app, bind this to resumeData.status
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
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        value={exp.role}
                        onChange={(e) => {
                            const newExp = [...resumeData.experience];
                            newExp[idx].role = e.target.value;
                            setResumeData({ ...resumeData, experience: newExp });
                        }}
                        placeholder="Job Role (e.g. Waiter)"
                        />
                        {/* AI Trigger Button */}
                        {exp.role.length > 2 && (
                            <button
                                onClick={() => handleFetchSuggestions(idx, exp.role)}
                                className="absolute right-1 top-1 p-1.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900 rounded-md transition-colors"
                                title="Get AI suggestions for this role"
                            >
                                <Sparkles size={16} />
                            </button>
                        )}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3">
                     <input
                      className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm outline-none focus:ring-2 focus:ring-brand-500"
                      value={exp.start}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[idx].start = e.target.value;
                        setResumeData({ ...resumeData, experience: newExp });
                      }}
                      placeholder="Start (e.g. 2021)"
                    />
                    <input
                      className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm outline-none focus:ring-2 focus:ring-brand-500"
                      value={exp.end}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[idx].end = e.target.value;
                        setResumeData({ ...resumeData, experience: newExp });
                      }}
                      placeholder="End (e.g. Present)"
                    />
                  </div>

                  {/* AI Suggestions Panel */}
                  {activeSuggestionIndex === idx && (
                    <div className="mb-3 p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg animate-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-2">
                                <Lightbulb size={12} />
                                AI Suggestions for "{exp.role}"
                            </h4>
                            <button 
                                onClick={() => setActiveSuggestionIndex(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        
                        {isGeneratingPhrases ? (
                            <div className="py-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                                <RefreshCw className="animate-spin" size={14} /> Generating professional phrases...
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {suggestions.map((sug, sIdx) => (
                                    <button
                                        key={sIdx}
                                        onClick={() => addSuggestionToDescription(idx, sug.text)}
                                        className="w-full text-left p-2 text-xs hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-brand-200 dark:hover:border-brand-700 rounded transition-all group flex items-start gap-2"
                                    >
                                        <div className="mt-0.5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus size={12} />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{sug.text}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">No suggestions found. Check your API connection.</p>
                        )}
                    </div>
                  )}

                  <textarea
                    rows={4}
                    className="w-full p-3 text-xs leading-relaxed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded outline-none focus:ring-2 focus:ring-brand-500"
                    value={exp.description.join('\n')}
                    onChange={(e) => {
                       const newExp = [...resumeData.experience];
                       newExp[idx].description = e.target.value.split('\n');
                       setResumeData({ ...resumeData, experience: newExp });
                    }}
                    placeholder="• Responsibilities and achievements..."
                  />
                  <div className="flex justify-end mt-1">
                     <button 
                        onClick={() => {
                            const newExp = [...resumeData.experience];
                            newExp.splice(idx, 1);
                            setResumeData({ ...resumeData, experience: newExp });
                        }}
                        className="text-[10px] text-red-500 hover:text-red-600 font-medium"
                     >
                        Remove Role
                     </button>
                  </div>
                </div>
              ))}
            </section>
            
            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Job Description */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-brand-600"/>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Target Job Description</h3>
              </div>
              <p className="text-xs text-gray-500 mb-2">Paste the JD here to unlock AI grading and optimization.</p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-32 p-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500 outline-none resize-none mb-3"
              />
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing || !jobDescription.trim()}
                className="w-full py-2.5 bg-gray-900 dark:bg-brand-600 hover:bg-gray-800 dark:hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm"
              >
                {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
              </button>
            </section>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Layout size={18} className="text-brand-600" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Structure & Style</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vocabulary Level
                  </label>
                  <select
                    value={vocabLevel}
                    onChange={(e) => setVocabLevel(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="simple">High-school (Simple)</option>
                    <option value="professional">Professional (Polished)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Changes section titles (e.g. "Work Experience" vs "Professional Experience").</p>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div>
                   <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resume Photo
                  </label>
                  <div className="flex items-start gap-4">
                    {resumeData.contact.photo ? (
                      <div className="relative group">
                        <img 
                          src={resumeData.contact.photo} 
                          alt="Resume" 
                          className="w-16 h-16 rounded-full object-cover border border-gray-200"
                        />
                        <button 
                          onClick={() => updateContact('photo', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-gray-700 transition">
                         <Upload size={20} className="text-gray-400" />
                         <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      </label>
                    )}
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Profile Picture</p>
                        <p className="text-xs text-gray-500">Optional. JPG or PNG, max 2MB.</p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div>
                   <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {THEME_COLORS.map((c) => (
                        <button
                            key={c}
                            onClick={() => setThemeColor(c)}
                            className={`w-8 h-8 rounded-full border-2 ${themeColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-110'} transition-all shadow-sm`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <button 
                        onClick={randomizeTheme}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Random Color"
                    >
                        <RefreshCw size={14} className="text-gray-500" />
                    </button>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-brand-600" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">JSON Data</h3>
              </div>
            <p className="text-xs text-gray-500">
              Directly edit the JSON data structure. Useful for debugging or bulk updates.
            </p>
            <textarea
              value={JSON.stringify(resumeData, null, 2)}
              onChange={handleJsonChange}
              className="w-full h-96 p-3 text-xs font-mono bg-gray-900 text-green-400 rounded-lg border border-gray-700 outline-none focus:border-brand-500"
            />
            {jsonError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-200 text-xs rounded border border-red-200 dark:border-red-800">
                Error: {jsonError}
              </div>
            )}
          </div>
        )}

        {activeTab === 'import' && (
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Wand2 size={18} className="text-brand-600" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Smart Import</h3>
              </div>
            <p className="text-xs text-gray-500">
              Paste your raw resume text (from LinkedIn, PDF copy-paste, or old resume) and let AI structure it for you.
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw resume text here..."
              className="w-full h-64 p-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            />
            <button
              onClick={handleImport}
              disabled={isProcessing || !rawText.trim()}
              className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} />}
              {isProcessing ? 'Parsing with AI...' : 'Parse Resume'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;