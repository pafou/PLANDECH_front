import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCSVReader } from 'react-papaparse';
import { API_BASE_URL } from '../apiConfig';

interface WorkloadData {
  name: string;
  firstname: string;
  subject: string;
  type: string;
  comment?: string;
  [key: string]: string | undefined;
}

interface ImportResult {
  importedCount: number;
  skippedCount: number;
  skippedLines: any[];
  importedLines: any[];
}

const AdminWorkloadImport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const { CSVReader } = useCSVReader();

  // Remove unused navigate hook
  // const navigate = useNavigate();

  const handleFileRead = async (results: any) => {
    setLoading(true);
    setMessage('');

    try {
      console.log('CSV parsing results:', results);

      // The results object contains the parsed data in results.data
      if (!results.data || !Array.isArray(results.data)) {
        throw new Error('Invalid CSV data format');
      }

      // Log the structure of the first few rows to understand the format
      console.log('First row structure:', results.data[0]);

      const parsedData = results.data.map((row: any) => {
        // Check if row is an object with named properties (header parsing)
        if (typeof row === 'object' && !Array.isArray(row)) {
          const result: WorkloadData = {
            name: row.Name || '',
            firstname: row.Firstname || '',
            subject: row.Subject || '',
            type: row.Type || '',
            comment: row.Comment || '',
          };

          // Add the month-load pairs as properties
          for (const key in row) {
            if (key.startsWith('20') && typeof row[key] === 'string') {
              const month = key;
              const load = row[key];
              if (load) {
                result[month] = load;
              }
            }
          }

          return result;
        }
        // Handle array format (if needed)
        else if (Array.isArray(row)) {
          const result: WorkloadData = {
            name: row[0] || '',
            firstname: row[1] || '',
            subject: row[2] || '',
            type: row[3] || '',
            comment: row[4] || '',
          };

          // Add the month-load pairs as properties
          for (let i = 5; i < row.length; i += 2) {
            if (row[i] && row[i + 1]) {
              result[row[i]] = row[i + 1];
            }
          }

          return result;
        } else {
          throw new Error('Invalid row format');
        }
      });

      console.log('Parsed data:', parsedData);

      const response = await axios.post(`${API_BASE_URL}/api/workload-import`, { data: parsedData });
      const importedCount = response.data.importedCount || 0;
      const skippedCount = response.data.skipped || 0;
      const skippedLines = response.data.skippedLines || [];

      setMessage(`Import completed: ${importedCount} records imported, ${skippedCount} records skipped`);

      // Store the results for display
      setImportResults({
        importedCount,
        skippedCount,
        skippedLines,
        importedLines: parsedData.slice(0, importedCount)
      });
    } catch (error) {
      console.error('Import error:', error);
      let errorMessage = 'Import failed';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileError = (error: any) => {
    console.error('File error:', error);
    setMessage('Error reading file: ' + error.message);
    setLoading(false);
  };

  return (
    <div className="admin-workload-import">
      <h2>Workload Plan Import</h2>
      <p>Import workload data from a CSV file (semicolon-separated)</p>

      <CSVReader
        onUploadAccepted={handleFileRead}
        onError={handleFileError}
        config={{
          delimiter: ';', // Use semicolon as delimiter
          skipEmptyLines: true,
          header: true
        }}
      >
        {({
          getRootProps,
          acceptedFile,
          ProgressBar,
          getRemoveFileProps
        }: any) => (
          <div>
            <div {...getRootProps()} style={{ display: 'inline-block' }}>
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Importing...' : 'Select CSV File'}
              </button>
            </div>
            {acceptedFile && (
              <div className="accepted-file mt-2">
                {acceptedFile.name}
                <button
                  className="btn btn-danger btn-sm ml-2"
                  {...getRemoveFileProps()}
                >
                  Remove
                </button>
              </div>
            )}
            {ProgressBar && <ProgressBar />}
          </div>
        )}
      </CSVReader>

      {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}

      {importResults && (
        <div className="import-results mt-4">
          <h3>Import Results</h3>

          <div className="result-section">
            <h4>Successfully Imported Lines ({importResults.importedCount})</h4>
            {importResults.importedLines.length > 0 ? (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Firstname</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {importResults.importedLines.map((line, index) => (
                    <tr key={index}>
                      <td>{line.name}</td>
                      <td>{line.firstname}</td>
                      <td>{line.subject}</td>
                      <td>{line.type}</td>
                      <td>{line.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No lines were imported.</p>
            )}
          </div>

          {importResults.skippedCount > 0 && (
            <div className="result-section mt-4">
              <h4>Skipped Lines ({importResults.skippedCount})</h4>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Firstname</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {importResults.skippedLines.map((line, index) => (
                    <tr key={index}>
                      <td>{line.name}</td>
                      <td>{line.firstname}</td>
                      <td>{line.subject}</td>
                      <td>{line.type}</td>
                      <td>{line.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminWorkloadImport;
