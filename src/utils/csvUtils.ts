export const parseCSV = (csvContent: string, delimiter = ';'): { [key: string]: string }[] => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(delimiter).map(header => header.trim());
  const result: { [key: string]: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // Skip empty lines

    const values = line.split(delimiter).map(value => value.trim());
    if (values.length !== headers.length) {
      console.warn(`Skipping line ${i+1}: incorrect number of fields`);
      continue;
    }

    const row: { [key: string]: string } = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }
    result.push(row);
  }

  return result;
};
