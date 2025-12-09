export interface ExperienceItem {
  company: string;
  role: string;
  start: string;
  end: string;
  description: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  year: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  photo?: string;
}

export interface ResumeData {
  fullName: string;
  title: string;
  contact: ContactInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
}

export interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
}

export enum AppState {
  EDITING = 'EDITING',
  GENERATING = 'GENERATING',
  ANALYZING = 'ANALYZING',
}

export const INITIAL_RESUME: ResumeData = {
  fullName: "Alex Taylor",
  title: "Senior Product Designer",
  contact: {
    email: "alex.taylor@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alextaylor"
  },
  summary: "Creative and detail-oriented Product Designer with over 6 years of experience in building user-centric digital products. Proven track record of improving user engagement and streamlining workflows.",
  experience: [
    {
      company: "TechFlow Inc.",
      role: "Senior Product Designer",
      start: "2021",
      end: "Present",
      description: [
        "Led the redesign of the core SaaS platform, resulting in a 25% increase in user retention.",
        "Collaborated with cross-functional teams to define product strategy and roadmap.",
        "Mentored junior designers and established a comprehensive design system."
      ]
    },
    {
      company: "Creative Pulse",
      role: "UI/UX Designer",
      start: "2018",
      end: "2021",
      description: [
        "Designed intuitive mobile interfaces for fintech applications.",
        "Conducted user research and usability testing to iterate on designs.",
        "Worked closely with developers to ensure high-quality implementation."
      ]
    }
  ],
  education: [
    {
      school: "California College of the Arts",
      degree: "BFA in Interaction Design",
      year: "2018"
    }
  ],
  skills: ["Figma", "Prototyping", "User Research", "HTML/CSS", "Design Systems", "Agile"]
};