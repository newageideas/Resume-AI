import React, { useState } from 'react';
import { ResumeData } from '../types';
import { FileText, Wand2, RefreshCw, Sparkles, Palette, Upload, User, Layout, Plus, Lightbulb, X, Briefcase, Calendar, ChevronDown, Clock, Trash2 } from 'lucide-react';
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
    setRawText(val); // Keep raw text in sync for editing
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
      setActiveTab('visual');
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
          onClick={() => {
            setActiveTab('json');
            setRawText(JSON.stringify(resumeData, null, 2));
          }}
          className={`flex-1 py-3 text-sm font-medium whitespace-nowrap px-2 ${activeTab === 'json' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50 dark:bg-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          JSON
        </button>
        <button
          onClick={() => {
            setActiveTab('import');
            setRawText('');
          }}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1 whitespace-nowrap px-2 ${activeTab === 'import' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50 dark:bg-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <Wand2 size={14} /> Import
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'visual' && (
          <div className="space-y-6">

            {/* --- JOB TRACKER WIDGET --- */}
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
                    className="w-full appearance-none bg-gray-700/50 border border-gray-600 hover:border-brand-400 text-sm rounded px-3 py-2 outline-none focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer text-white"
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
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Job Title</label>
                  <input
                    type="text"
                    value={resumeData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
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
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Phone</label>
                  <input
                    type="text"
                    value={resumeData.contact.phone}
                    onChange={(e) => updateContact('phone', e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Location</label>
                  <input
                    type="text"
                    value={resumeData.contact.location}
                    onChange={(e) => updateContact('location', e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  />
                </div>
                 <div className="space-y-1">
                  <label className="text-xs text-gray-500">LinkedIn (Optional)</label>
                  <input
                    type="text"
                    value={resumeData.contact.linkedin || ''}
                    onChange={(e) => updateContact('linkedin', e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  />
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                 <div className="space-y-1">
                  <label className="text-xs text-gray-500">Website (Optional)</label>
                  <input
                    type="text"
                    value={resumeData.contact.website || ''}
                    onChange={(e) => updateContact('website', e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  />
                </div>
               </div>

              <div className="mt-4 space-y-1">
                 <label className="text-xs text-gray-500">Summary</label>
                 <textarea
                   rows={4}
                   value={resumeData.summary}
                   onChange={(e) => updateField('summary', e.target.value)}
                   className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                 />
              </div>
            </section>

             <hr className="border-gray-200 dark:border-gray-700" />

            {/* Experience Section with AI Suggestions */}
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
                      className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
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
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none dark:text-white pr-8"
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
                      className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                      value={exp.start}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[idx].start = e.target.value;
                        setResumeData({ ...resumeData, experience: newExp });
                      }}
                      placeholder="Start Year"
                    />
                    <input
                      className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                      value={exp.end}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience];
                        newExp[idx].end = e.target.value;
                        setResumeData({ ...resumeData, experience: newExp });
                      }}
                      placeholder="End Year"
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
                    className="w-full p-3 text-xs leading-relaxed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
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
                        className="text-[10px] text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                     >
                        <Trash2 size={12}/> Remove Role
                     </button>
                  </div>
                </div>
              ))}
            </section>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Education */}
             <section>
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Education</h3>
                 <button 
                    onClick={() => {
                        const newEdu = [...resumeData.education, { school: '', degree: '', year: '' }];
                        setResumeData({ ...resumeData, education: newEdu });
                    }}
                    className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
                 >
                    <Plus size={14} /> Add School
                 </button>
              </div>
               {resumeData.education.map((edu, idx) => (
                <div key={idx} className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="space-y-2">
                        <input
                            className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm outline-none dark:text-white"
                            value={edu.school}
                            onChange={(e) => {
                                const newEdu = [...resumeData.education];
                                newEdu[idx].school = e.target.value;
                                setResumeData({ ...resumeData, education: newEdu });
                            }}
                            placeholder="School / University"
                        />
                        <div className="flex gap-2">
                            <input
                                className="flex-[2] p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm outline-none dark:text-white"
                                value={edu.degree}
                                onChange={(e) => {
                                    const newEdu = [...resumeData.education];
                                    newEdu[idx].degree = e.target.value;
                                    setResumeData({ ...resumeData, education: newEdu });
                                }}
                                placeholder="Degree (e.g. BS Computer Science)"
                            />
                            <input
                                className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm outline-none dark:text-white"
                                value={edu.year}
                                onChange={(e) => {
                                    const newEdu = [...resumeData.education];
                                    newEdu[idx].year = e.target.value;
                                    setResumeData({ ...resumeData, education: newEdu });
                                }}
                                placeholder="Year"
                            />
                        </div>
                    </div>
                     <div className="flex justify-end mt-1">
                     <button 
                        onClick={() => {
                            const newEdu = [...resumeData.education];
                            newEdu.splice(idx, 1);
                            setResumeData({ ...resumeData, education: newEdu });
                        }}
                        className="text-[10px] text-red-500 hover:text-red-600 font-medium"
                     >
                        Remove
                     </button>
                  </div>
                </div>
               ))}
             </section>

             <hr className="border-gray-200 dark:border-gray-700" />

             {/* Skills */}
             <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Skills</h3>
                <textarea
                    rows={3}
                    className="w-full p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    value={resumeData.skills.join(', ')}
                    onChange={(e) => {
                        const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setResumeData({ ...resumeData, skills });
                    }}
                    placeholder="Comma separated list of skills (e.g. React, Node.js, Design)"
                />
             </section>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Vocabulary Level</label>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setVocabLevel('simple')}
                  className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${vocabLevel === 'simple' ? 'bg-white dark:bg-gray-600 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setVocabLevel('professional')}
                  className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${vocabLevel === 'professional' ? 'bg-white dark:bg-gray-600 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Professional
                </button>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Color Theme</label>
              <div className="flex flex-wrap gap-3">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setThemeColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${themeColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button
                  onClick={randomizeTheme}
                  className="w-8 h-8 rounded-full border border-dashed border-gray-400 flex items-center justify-center text-gray-500 hover:text-brand-600 hover:border-brand-600 transition-all"
                  title="Randomize"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="space-y-3">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Profile Photo</label>
               
               <div className="flex items-center gap-4">
                  {resumeData.contact.photo ? (
                    <div className="relative group">
                       <img src={resumeData.contact.photo} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                       <button 
                        onClick={() => updateContact('photo', '')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X size={12} />
                       </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                      <User size={24} />
                    </div>
                  )}
                  
                  <div className="flex-1">
                     <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <Upload size={14} />
                        Upload Photo
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                     </label>
                     <p className="text-xs text-gray-500 mt-2">Recommended: Square JPG/PNG, max 2MB.</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="h-full flex flex-col">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg mb-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                <AlertCircleIcon size={14} className="mt-0.5 shrink-0" />
                Advanced: Directly edit the resume JSON structure here. Invalid JSON will trigger an error.
              </p>
            </div>
            <textarea
              value={rawText}
              onChange={handleJsonChange}
              className={`flex-1 w-full p-3 font-mono text-xs bg-gray-50 dark:bg-gray-900 border rounded-lg outline-none focus:ring-2 focus:ring-brand-500 resize-none ${jsonError ? 'border-red-500 text-red-600' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}
              spellCheck={false}
            />
            {jsonError && (
              <p className="text-red-500 text-xs mt-2 font-medium">{jsonError}</p>
            )}
          </div>
        )}

        {activeTab === 'import' && (
          <div className="h-full flex flex-col">
             <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Import from Text</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Paste your existing resume text, LinkedIn PDF content, or raw notes below. 
                  Our AI will parse and format it automatically.
                </p>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste resume text here..."
                  className="w-full h-64 p-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 mb-4 dark:text-white"
                />
                
                <button
                  onClick={handleImport}
                  disabled={isProcessing || !rawText.trim()}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} /> Parsing...
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} /> Auto-Format with AI
                    </>
                  )}
                </button>
             </div>
             
             <hr className="border-gray-200 dark:border-gray-700 my-4" />
             
             <div>
               <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Analysis Job Description</h3>
               <p className="text-xs text-gray-500 mb-2">
                 Paste the job description you are applying for to get an AI score and feedback.
               </p>
               <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste Job Description here..."
                  className="w-full h-32 p-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 mb-4 dark:text-white"
               />
               <button
                  onClick={onAnalyze}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="w-full py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Grade My Resume
                    </>
                  )}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AlertCircleIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default Editor;