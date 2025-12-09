import React from 'react';
import { AnalysisResult, ResumeData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

interface AnalysisPanelProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result, isAnalyzing, resumeData, setResumeData }) => {
  const updateField = (section: keyof ResumeData, value: any) => {
    setResumeData({ ...resumeData, [section]: value });
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analyzing Resume...</h3>
        <p className="text-sm text-gray-500 mt-2">Checking keywords, formatting, and impact against the Job Description.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
          <Search className="text-gray-400 dark:text-gray-500" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Analysis Ready</h3>
        <p className="text-sm text-gray-500 mt-2">Enter a Job Description in the editor and click "Analyze" to get a detailed score and feedback.</p>
      </div>
    );
  }

  const data = [
    { name: 'Score', value: result.score },
    { name: 'Remaining', value: 100 - result.score },
  ];
  
  const scoreColor = result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full overflow-y-auto custom-scrollbar flex flex-col">
      {/* Header with Chart */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
         <div>
           <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Resume Score</h2>
           <p className="text-xs text-gray-500">Based on JD compatibility</p>
         </div>
         <div className="w-24 h-24 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={40}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={scoreColor} />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-gray-100">
              {result.score}
            </div>
         </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">AI Summary</h3>
          <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">{result.summary}</p>
        </div>

        {/* Strengths */}
        <div>
           <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
             <CheckCircle size={16} className="text-green-500" /> Key Strengths
           </h3>
           <ul className="space-y-2">
             {result.strengths.map((s, i) => (
               <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                 <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-green-500 shrink-0"></span>
                 {s}
               </li>
             ))}
           </ul>
        </div>

        {/* Improvements */}
        <div>
           <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
             <AlertTriangle size={16} className="text-yellow-500" /> Improvements Needed
           </h3>
           <ul className="space-y-2">
             {result.improvements.map((s, i) => (
               <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                 <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-yellow-500 shrink-0"></span>
                 {s}
               </li>
             ))}
           </ul>
        </div>

        {/* Missing Keywords */}
        {result.missingKeywords.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
              <XCircle size={16} className="text-red-500" /> Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.map((word, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    // Check if skill exists, if not add it
                    const currentSkills = resumeData.skills || []; // Ensure skills array exists
                    if (!currentSkills.includes(word)) {
                      updateField('skills', [...currentSkills, word]);
                    }
                  }}
                  className="px-2 py-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 hover:border-brand-500 hover:text-brand-600 text-red-600 dark:text-red-300 text-xs rounded-md font-mono transition-colors cursor-pointer flex items-center gap-1 group"
                  title="Click to add to skills"
                >
                  <span className="group-hover:hidden">+</span>
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;