const fs = require('fs');
const path = require('path');

// Simple CSV parser
function parseCSV(content, delimiter = ';') {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(delimiter).map(header => header.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // Skip empty lines

    const values = line.split(delimiter).map(value => value.trim());
    if (values.length !== headers.length) {
      console.warn(`Skipping line ${i+1}: incorrect number of fields`);
      continue;
    }

    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }
    result.push(row);
  }

  return result;
}

// Simulate the CSV import process
function simulateCSVImport() {
  const testCSVPath = '/Users/pascal/workspace/PLANDECH/front/../../../Downloads/test.csv';
  const csvContent = fs.readFileSync(testCSVPath, 'utf-8');

  console.log('CSV Content:');
  console.log(csvContent);

  console.log('\nParsed CSV:');
  const parsedData = parseCSV(csvContent);
  console.log(parsedData);

  console.log('\nMapping to subject format:');
  const subjectTypes = { 1: 'sur', 2: 'math' }; // Example subject types
  const newSubjects = parsedData.map((row) => {
    const subject = row['Subject'];
    const type = row['Type'];
    const id_subject_type = type ? Number(Object.keys(subjectTypes).find(key => subjectTypes[key] === type)) : null;
    return { subject, id_subject_type };
  });

  console.log(newSubjects);

  console.log('\nFiltering valid subjects:');
  const validSubjects = newSubjects.filter(s => Boolean(s.subject && s.id_subject_type));
  console.log(validSubjects);

  if (validSubjects.length === 0) {
    console.log('No valid subjects found in the CSV file.');
  } else {
    console.log('Valid subjects found!');
    console.log('Subjects that would be imported:');
    validSubjects.forEach(s => {
      console.log(`- Subject: ${s.subject}, Type ID: ${s.id_subject_type}`);
    });
  }
}

// Run the simulation
simulateCSVImport();
