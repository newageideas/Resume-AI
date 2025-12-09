import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { ResumeData } from '../types';

// Define styles for a modern, clean look
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  sidebar: {
    width: '30%',
    padding: 20,
    backgroundColor: '#f4f4f5',
    borderRightWidth: 1,
    borderRightColor: '#e4e4e7',
  },
  mainContent: {
    width: '70%',
    padding: 24,
  },
  // Typography
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#111827',
  },
  title: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
    fontFamily: 'Helvetica',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 16,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2,
  },
  sidebarSectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 16,
    color: '#374151',
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.4,
    color: '#4b5563',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
  },
  // Experience Items
  roleTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  companyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Oblique',
    color: '#374151',
  },
  date: {
    fontSize: 9,
    color: '#6b7280',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    color: '#4b5563',
  },
  bulletContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: '#4b5563',
  },
  // Sidebar items
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    alignSelf: 'center',
  },
  contactRow: {
    marginBottom: 6,
  },
  contactLabel: {
    fontSize: 8,
    color: '#9ca3af',
    marginBottom: 1,
  },
  link: {
    fontSize: 9,
    color: '#2563eb',
    textDecoration: 'none',
  },
  skillTag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
    marginRight: 4,
    alignSelf: 'flex-start',
  },
  skillText: {
    fontSize: 9,
    color: '#374151',
  }
});

interface ResumePDFProps {
  data: ResumeData;
  themeColor: string;
}

const ResumePDF: React.FC<ResumePDFProps> = ({ data, themeColor }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          {data.contact.photo && (
            <Image 
              src={data.contact.photo} 
              style={[styles.photo, { borderColor: themeColor, borderWidth: 2 }]} 
            />
          )}

          <Text style={[styles.sidebarSectionTitle, { color: themeColor }]}>Contact</Text>
          
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.text}>{data.contact.email}</Text>
          </View>
          
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.text}>{data.contact.phone}</Text>
          </View>
          
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Location</Text>
            <Text style={styles.text}>{data.contact.location}</Text>
          </View>

          {data.contact.linkedin && (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>LinkedIn</Text>
              <Link src={data.contact.linkedin.startsWith('http') ? data.contact.linkedin : `https://${data.contact.linkedin}`} style={styles.link}>
                <Text>{data.contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</Text>
              </Link>
            </View>
          )}

          {data.contact.website && (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Website</Text>
              <Link src={data.contact.website.startsWith('http') ? data.contact.website : `https://${data.contact.website}`} style={styles.link}>
                <Text>{data.contact.website.replace(/^https?:\/\//, '')}</Text>
              </Link>
            </View>
          )}

          {/* Education - Sidebar */}
          {data.education.length > 0 && (
            <View>
              <Text style={[styles.sidebarSectionTitle, { color: themeColor }]}>Education</Text>
              {data.education.map((edu, idx) => (
                <View key={idx} style={{ marginBottom: 10 }}>
                  <Text style={[styles.text, styles.bold]}>{edu.school}</Text>
                  <Text style={styles.text}>{edu.degree}</Text>
                  <Text style={[styles.date, { marginTop: 2 }]}>{edu.year}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills - Sidebar */}
          {data.skills.length > 0 && (
            <View>
              <Text style={[styles.sidebarSectionTitle, { color: themeColor }]}>Skills</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {data.skills.map((skill, idx) => (
                  <View key={idx} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.name, { color: themeColor }]}>{data.fullName}</Text>
            <Text style={styles.title}>{data.title}</Text>
            <View style={{ height: 2, backgroundColor: '#f3f4f6', width: '100%' }} />
          </View>

          {/* Summary */}
          {data.summary && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.sectionTitle, { color: themeColor }]}>Professional Summary</Text>
              <Text style={styles.text}>{data.summary}</Text>
            </View>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { color: themeColor }]}>Experience</Text>
              {data.experience.map((exp, idx) => (
                <View key={idx} style={{ marginBottom: 16 }}>
                  <Text style={styles.roleTitle}>{exp.role}</Text>
                  <View style={styles.companyRow}>
                    <Text style={styles.companyName}>{exp.company}</Text>
                    <Text style={styles.date}>{exp.start} — {exp.end}</Text>
                  </View>
                  <View>
                    {exp.description.map((bullet, bIdx) => (
                      <View key={bIdx} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletContent}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </Page>
    </Document>
  );
};

export default ResumePDF;
