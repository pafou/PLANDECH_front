import React, { useState } from 'react';
import { API_BASE_URL } from '../apiConfig';
import { parseCSV } from '../utils/csvUtils';

interface Subject {
  id_subject: number;
  subject: string;
  id_subject_type: number;
  type?: string;
}

interface AdminManageSubjectsProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  subjectTypes: { [id: number]: string };
  subjectTypeColors: { [id: number]: string };
  newSubject: string;
  setNewSubject: React.Dispatch<React.SetStateAction<string>>;
  selectedSubjectType: number | null;
  setSelectedSubjectType: React.Dispatch<React.SetStateAction<number | null>>;
}

const AdminManageSubjects: React.FC<AdminManageSubjectsProps> = ({
  subjects,
  setSubjects,
  subjectTypes,
  subjectTypeColors,
  newSubject,
  setNewSubject,
  selectedSubjectType,
  setSelectedSubjectType
}) => {
  const [sortColumn, setSortColumn] = useState<'subject' | 'type'>('subject');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleSort = (column: 'subject' | 'type') => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
  };

  const sortedSubjects = subjects.slice().sort((a, b) => {
    if (sortColumn === 'subject') {
      return sortDirection === 'asc'
        ? a.subject.localeCompare(b.subject)
        : b.subject.localeCompare(a.subject);
    } else {
      return sortDirection === 'asc'
        ? (a.id_subject_type || 0) - (b.id_subject_type || 0)
        : (b.id_subject_type || 0) - (a.id_subject_type || 0);
    }
  });

  const handleDeleteSubject = (id: number, subject: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the subject "${subject}"?`);
    if (isConfirmed) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        fetch(`${API_BASE_URL}/api/subjects/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(response => {
            if (response.ok) {
              setSubjects(subjects.filter(s => s.id_subject !== id));
            } else {
              // No alert for error
            }
          })
          .catch(error => {
            console.error('Error deleting subject:', error);
            // No alert for error
          });
      }
    }
  };

  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleCSVUpload = () => {
    if (!csvFile) {
      alert('Please select a CSV file first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsedData = parseCSV(content);

      // Map CSV data to subject format
      const newSubjects = parsedData.map((row: { [key: string]: string }) => {
        const subject = row['Subject'];
        const type = row['Type'];
        const id_subject_type = type ? Number(Object.keys(subjectTypes).find(key => subjectTypes[key as unknown as keyof typeof subjectTypes] === type)) as number | null : null;
        return { subject, id_subject_type };
      });

      // Filter out invalid entries
      const validSubjects = newSubjects.filter((s: any) => {
        return Boolean(s.subject && s.id_subject_type);
      });

      if (validSubjects.length === 0) {
        alert('No valid subjects found in the CSV file.');
        return;
      }

      const token = localStorage.getItem('jwtToken');
      if (token) {
        // Add subjects one by one
        const addSubjectPromises = validSubjects.map((s: any) =>
          fetch(`${API_BASE_URL}/api/subjects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              subject: s.subject,
              id_subject_type: s.id_subject_type,
            }),
          })
        );

        Promise.all(addSubjectPromises)
          .then(responses => {
            const success = responses.every(response => response.ok);
            if (success) {
              // Fetch the updated list of subjects
              fetch(`${API_BASE_URL}/api/subjects`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
                .then(response => response.json())
                .then(subjectData => {
                  setSubjects(subjectData);
                  setCsvFile(null);
                  alert('Subjects imported successfully!');
                })
                .catch(error => {
                  console.error('Error fetching subjects:', error);
                  alert('Error updating subject list after import.');
                });
            } else {
              alert('Some subjects failed to import. Please check the CSV format.');
            }
          })
          .catch(error => {
            console.error('Error importing subjects:', error);
            alert('Error importing subjects.');
          });
      }
    };
    reader.readAsText(csvFile);
  };

  return (
    <div className="subject-container">
      <div className="admin-section">
        <h2>Subjects</h2>
          <div className="admin-content">
            <div className="admin-section-content">
              <div className="admin-add">
                <h3>Add Subject</h3>
                <input
                  type="text"
                  placeholder="Subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
                <select
                  value={selectedSubjectType !== null ? selectedSubjectType : ''}
                  onChange={(e) => setSelectedSubjectType(Number(e.target.value))}
                >
                  <option value="">Select a type</option>
                  {Object.entries(subjectTypes).map(([id, type]) => (
                    <option key={id} value={id}>
                      {type}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (newSubject && selectedSubjectType !== null) {
                      const token = localStorage.getItem('jwtToken');
                      if (token) {
                        fetch(`${API_BASE_URL}/api/subjects`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            subject: newSubject,
                            id_subject_type: selectedSubjectType,
                          }),
                        })
                          .then(response => {
                            if (response.ok) {
                              // Fetch the updated list of subjects
                              fetch(`${API_BASE_URL}/api/subjects`, {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              })
                                .then(response => response.json())
                                .then(subjectData => {
                                  setSubjects(subjectData);
                                  setNewSubject('');
                                  setSelectedSubjectType(null);
                                })
                                .catch(error => {
                                  console.error('Error fetching subjects:', error);
                                });
                            } else {
                              // No alert for error
                            }
                          })
                          .catch(error => {
                            console.error('Error adding subject:', error);
                            // No alert for error
                          });
                      }
                    } else {
                      alert('Please fill in all required fields.');
                    }
                  }}
                  disabled={!newSubject || selectedSubjectType === null}
                >
                  Add Subject
                </button>
              </div>
            </div>
            <div className="admin-section-content">
              <div className="csv-import">
                <h3>CSV import</h3>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVChange}
                />
                <button
                  onClick={handleCSVUpload}
                  disabled={!csvFile}
                >
                  Import Subjects from CSV
                </button>
              </div>
            </div>
            <div className="admin-section-content">
              <div className="admin-list">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th onClick={() => handleSort('subject')} style={{ cursor: 'pointer' }}>
                        Subject {sortColumn === 'subject' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                        Type {sortColumn === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubjects.map(subject => (
                      <tr key={subject.id_subject} style={{ backgroundColor: subjectTypeColors[subject.id_subject_type] }}>
                        <td>{subject.id_subject}</td>
                        <td
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newSubjectName = e.currentTarget.textContent;
                            if (newSubjectName !== subject.subject) {
                              const token = localStorage.getItem('jwtToken');
                              if (token) {
                                fetch(`${API_BASE_URL}/api/subjects/${subject.id_subject}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ subject: newSubjectName }),
                                })
                                  .then(response => {
                                    if (response.ok) {
                                      // Update the subject name in the state
                                      setSubjects(prevSubjects =>
                                        prevSubjects.map(s =>
                                          s.id_subject === subject.id_subject
                                            ? { ...s, subject: newSubjectName as string }
                                            : s
                                        )
                                      );
                                    } else {
                                      // No alert for error
                                    }
                                  })
                                  .catch(error => {
                                    console.error('Error updating subject:', error);
                                    // No alert for error
                                  });
                              }
                            }
                          }}
                        >
                          {subject.subject}
                        </td>
                        <td>
                          <select
                            value={subject.id_subject_type}
                            onChange={(e) => {
                              const newSubjectType = Number(e.target.value);
                              if (newSubjectType !== subject.id_subject_type) {
                                const token = localStorage.getItem('jwtToken');
                                if (token) {
                                  fetch(`${API_BASE_URL}/api/subjects/${subject.id_subject}`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ id_subject_type: newSubjectType }),
                                  })
                                    .then(response => {
                                      if (response.ok) {
                                        // Update the subject type in the state
                                        setSubjects(prevSubjects =>
                                          prevSubjects.map(s =>
                                            s.id_subject === subject.id_subject
                                              ? { ...s, id_subject_type: newSubjectType }
                                              : s
                                          )
                                        );
                                      } else {
                                        // No alert for error
                                      }
                                    })
                                    .catch(error => {
                                      console.error('Error updating subject type:', error);
                                      // No alert for error
                                    });
                                }
                              }
                            }}
                          >
                            {Object.entries(subjectTypes).map(([id, type]) => (
                              <option key={id} value={id}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button className="admin-add-button" onClick={() => handleDeleteSubject(subject.id_subject, subject.subject)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default AdminManageSubjects;
