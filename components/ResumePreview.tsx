import React from 'react';
import { ResumeData } from '../types';
import { VocabLevel } from '../App';

interface ResumePreviewProps {
  data: ResumeData;
  previewId?: string;
  vocabLevel: VocabLevel;
  themeColor: string;
}

const VOCAB_OPTIONS = {
  simple: {
    summary: 'Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
  },
  professional: {
    summary: 'Professional Summary',
    experience: 'Professional Experience',
    education: 'Academic Background',
    skills: 'Core Competencies',
  }
};

const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  data, 
  previewId = "resume-preview",
  vocabLevel,
  themeColor
}) => {
  const vocab = VOCAB_OPTIONS[vocabLevel];

  return (
    <div className="w-full h-full flex justify-center bg-gray-200 dark:bg-gray-800 p-4 md:p-8 overflow-y-auto custom-scrollbar">
      {/* A4 Paper Aspect Ratio Container */}
      <div 
        id={previewId}
        className="bg-white text-gray-900 shadow-2xl origin-top transform scale-100 sm:scale-[0.8] md:scale-[0.9] lg:scale-100 transition-transform"
        style={{ 
          width: '210mm', 
          minHeight: '297mm',
          padding: '12mm 15mm',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <header 
          className="border-b-2 pb-6 mb-6 flex items-start justify-between gap-6"
          style={{ borderColor: themeColor }}
        >
          <div className="flex-1">
            <h1 
              className="text-3xl font-serif font-bold tracking-tight mb-2 uppercase"
              style={{ color: themeColor }}
            >
              {data.fullName}
            </h1>
            <p className="text-lg text-gray-600 font-medium mb-3">{data.title}</p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              {data.contact.email && <span>{data.contact.email}</span>}
              {data.contact.phone && <span>• {data.contact.phone}</span>}
              {data.contact.location && <span>• {data.contact.location}</span>}
              {data.contact.linkedin && <span>• {data.contact.linkedin}</span>}
              {data.contact.website && <span>• {data.contact.website}</span>}
            </div>
          </div>
          
          {data.contact.photo && (
            <img 
              src={data.contact.photo} 
              alt="Profile" 
              className="w-24 h-24 rounded-lg object-cover border-2 shadow-sm shrink-0"
              style={{ borderColor: themeColor }}
            />
          )}
        </header>

        {/* Summary */}
        {data.summary && (
          <section className="mb-6">
            <h2 
              className="text-sm font-bold uppercase tracking-widest border-b pb-1 mb-3"
              style={{ color: themeColor, borderColor: '#e5e7eb' }}
            >
              {vocab.summary}
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="mb-6">
            <h2 
              className="text-sm font-bold uppercase tracking-widest border-b pb-1 mb-3"
              style={{ color: themeColor, borderColor: '#e5e7eb' }}
            >
              {vocab.experience}
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900">{exp.role}</h3>
                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{exp.start} – {exp.end}</span>
                  </div>
                  <div className="text-sm text-gray-700 italic mb-2">{exp.company}</div>
                  <ul className="list-disc list-outside ml-4 space-y-1">
                    {exp.description.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-sm text-gray-700 leading-snug pl-1">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section className="mb-6">
            <h2 
              className="text-sm font-bold uppercase tracking-widest border-b pb-1 mb-3"
              style={{ color: themeColor, borderColor: '#e5e7eb' }}
            >
              {vocab.education}
            </h2>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                   <div>
                     <div className="font-bold text-gray-900">{edu.school}</div>
                     <div className="text-sm text-gray-700">{edu.degree}</div>
                   </div>
                   <div className="text-sm text-gray-600">{edu.year}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <section>
             <h2 
              className="text-sm font-bold uppercase tracking-widest border-b pb-1 mb-3"
              style={{ color: themeColor, borderColor: '#e5e7eb' }}
             >
              {vocab.skills}
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;