import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// Parse file data based on file type
export const parseFileData = async (file) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    console.log('Parsing file:', fileName, 'with extension:', fileExtension);
    
    // Handle Excel files differently (they need to be read as ArrayBuffer)
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      console.log('Detected Excel file, using XLSX library...');
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          console.log('File read successfully, processing with XLSX...');
          const data = new Uint8Array(event.target.result);
          console.log('Data length:', data.length);
          
          // Check if the data looks like Excel content (should not be XML-like)
          const firstBytes = data.slice(0, 10);
          const firstBytesStr = String.fromCharCode.apply(null, firstBytes);
          console.log('First bytes:', firstBytesStr);
          
          if (firstBytesStr.includes('PK') || firstBytesStr.includes('<?xml')) {
            console.log('Detected ZIP/XML content, proceeding with XLSX parsing...');
          }
          
          // Try different parsing approaches
          let workbook;
          try {
            workbook = XLSX.read(data, { type: 'array' });
          } catch (parseError) {
            console.warn('First parsing attempt failed, trying with buffer type...');
            workbook = XLSX.read(data, { type: 'buffer' });
          }
          
          console.log('Workbook created, sheet names:', workbook.SheetNames);
          
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            reject(new Error('No sheets found in Excel file'));
            return;
          }
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          console.log('Worksheet loaded:', firstSheetName);
          
          // Try different JSON conversion options
          let jsonData;
          try {
            jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1,
              defval: '',
              blankrows: false
            });
          } catch (jsonError) {
            console.warn('Header-based parsing failed, trying without header option...');
            jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              defval: '',
              blankrows: false
            });
            
            // If this returns objects directly, convert to array format
            if (jsonData.length > 0 && typeof jsonData[0] === 'object' && !Array.isArray(jsonData[0])) {
              const headers = Object.keys(jsonData[0]);
              const arrayData = [headers];
              jsonData.forEach(row => {
                arrayData.push(headers.map(header => row[header] || ''));
              });
              jsonData = arrayData;
            }
          }
          
          console.log('JSON data created, rows:', jsonData.length);
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must have at least a header row and one data row'));
            return;
          }
          
          // Convert array format to object format
          const headers = jsonData[0].map(header => header || `Column_${jsonData[0].indexOf(header)}`);
          console.log('Headers:', headers);
          const parsedData = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
              const rowObj = {};
              headers.forEach((header, index) => {
                const value = row[index] || '';
                // Try to convert to number if possible
                const numValue = parseFloat(value);
                rowObj[header] = isNaN(numValue) || value === '' || value === null ? value : numValue;
              });
              parsedData.push(rowObj);
            }
          }
          
          console.log('Parsed Excel data:', parsedData);
          if (parsedData.length === 0) {
            reject(new Error('No valid data rows found in Excel file'));
            return;
          }
          resolve(parsedData);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          console.error('Error details:', error.message, error.stack);
          
          // Try alternative parsing method as fallback
          try {
            console.log('Attempting fallback parsing method...');
            const alternativeData = new Uint8Array(event.target.result);
            const fallbackWorkbook = XLSX.read(alternativeData, { type: 'base64' });
            const fallbackSheet = fallbackWorkbook.Sheets[fallbackWorkbook.SheetNames[0]];
            const fallbackJsonData = XLSX.utils.sheet_to_json(fallbackSheet);
            
            if (fallbackJsonData && fallbackJsonData.length > 0) {
              console.log('Fallback parsing successful:', fallbackJsonData);
              resolve(fallbackJsonData);
              return;
            }
          } catch (fallbackError) {
            console.error('Fallback parsing also failed:', fallbackError);
          }
          
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Failed to read Excel file'));
      };
      
      // Read as ArrayBuffer for Excel files
      reader.readAsArrayBuffer(file);
    } else {
      // Handle CSV and JSON files as text
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          let parsedData = [];
          
          switch (fileExtension) {
            case 'csv':
              parsedData = parseCSV(content);
              break;
            case 'json':
              parsedData = parseJSON(content);
              break;
            default:
              // Try to parse as JSON first, then CSV
              try {
                parsedData = parseJSON(content);
              } catch {
                parsedData = parseCSV(content);
              }
          }
          
          if (parsedData && parsedData.length > 0) {
            resolve(parsedData);
          } else {
            reject(new Error('No valid data found in file'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Read as text for CSV and JSON files
      reader.readAsText(file);
    }
  });
};

// Parse CSV content with better handling of quoted values
export const parseCSV = (content) => {
  console.log('Parsing CSV content:', content.substring(0, 200) + '...');
  
  const lines = content.split('\n').filter(line => line.trim());
  console.log('Filtered lines:', lines.length);
  
  if (lines.length < 2) {
    console.warn('Not enough lines in CSV file');
    return [];
  }
  
  // Simple CSV parser that handles quoted values
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(value => value.replace(/^"|"$/g, '')); // Remove outer quotes
  };
  
  const headers = parseCSVLine(lines[0]);
  console.log('Headers:', headers);
  
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    console.log(`Row ${i} values:`, values);
    
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        // Try to convert to number if possible
        const value = values[index];
        const numValue = parseFloat(value);
        row[header] = isNaN(numValue) || value === '' ? value : numValue;
      });
      data.push(row);
    } else {
      console.warn(`Row ${i} has ${values.length} values but expected ${headers.length}`);
    }
  }
  
  console.log('Parsed data:', data);
  return data;
};

// Parse JSON content
export const parseJSON = (content) => {
  const data = JSON.parse(content);
  
  // Handle different JSON formats
  if (Array.isArray(data)) {
    return data;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data.records && Array.isArray(data.records)) {
    return data.records;
  } else {
    // If it's an object, try to convert to array
    return [data];
  }
};

// Custom hook for localStorage with file handling
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Save to localStorage, but exclude File objects
      const serializableValue = valueToStore.map(item => {
        if (item.file && item.file instanceof File) {
          // Create a serializable version without the File object
          const { file, ...rest } = item;
          return {
            ...rest,
            hasFile: true, // Flag to indicate we had a file
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          };
        }
        return item;
      });
      
      window.localStorage.setItem(key, JSON.stringify(serializableValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Custom hook specifically for uploaded files
export const useUploadedFiles = () => {
  const [uploadedFiles, setUploadedFiles] = useLocalStorage('uploadedFiles', []);

  const addUploadedFile = async (file) => {
    // Parse the file data first
    let fileData = null;
    try {
      fileData = await parseFileData(file);
    } catch (error) {
      console.error('Error parsing file data:', error);
    }
    
    const newFile = {
      id: Date.now(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      uploadStatus: 'success',
      status: 'uploaded',
      file: file, // Keep the actual File object in memory
      fileData: fileData // Store the parsed data
    };
    
    setUploadedFiles(prev => [...prev, newFile]);
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const updateUploadedFile = (fileId, updates) => {
    setUploadedFiles(prev => 
      prev.map(file => file.id === fileId ? { ...file, ...updates } : file)
    );
  };

  return {
    uploadedFiles,
    addUploadedFile,
    removeUploadedFile,
    updateUploadedFile
  };
}; 