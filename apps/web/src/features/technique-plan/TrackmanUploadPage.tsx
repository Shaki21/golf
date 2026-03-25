/**
 * TrackMan Upload Page
 * Upload and import TrackMan CSV and PDF files
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { StandardPageHeader } from '../../components/layout/StandardPageHeader';
import api from '../../services/api';
import { SectionTitle } from '../../components/typography';

interface UploadResult {
  success: boolean;
  import?: {
    id: string;
    fileName: string;
    totalRows: number;
    importedRows: number;
    importedAt: string;
  };
  session?: {
    id: string;
    totalShots: number;
  };
  shotsImported?: number;
  error?: string;
}

interface ImportHistory {
  id: string;
  fileName: string;
  importedAt: string;
  totalRows: number;
  importedRows: number;
  sessionId: string | null;
}

export const TrackmanUploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load import history on mount
  React.useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/technique-plan/imports?limit=10&offset=0');
      if (response.data?.success && response.data?.data) {
        setImportHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load import history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ['.csv', '.pdf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validTypes.includes(fileExtension)) {
      setUploadResult({
        success: false,
        error: 'Ugyldig filtype. Kun CSV og PDF filer er støttet.',
      });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Get current user's player ID from localStorage or context
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const playerId = userData.playerId;

      if (!playerId) {
        throw new Error('No player ID found. Please log in again.');
      }

      // Determine endpoint based on file type
      const isPdf = selectedFile.name.toLowerCase().endsWith('.pdf');
      const endpoint = isPdf
        ? `/technique-plan/import/trackman-pdf?playerId=${playerId}`
        : `/technique-plan/import/trackman?playerId=${playerId}`;

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult({
        success: true,
        import: data.data?.import,
        session: data.data?.session,
        shotsImported: data.data?.shotsImported,
      });

      // Clear selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload history
      await loadImportHistory();
    } catch (error: any) {
      setUploadResult({
        success: false,
        error: error.message || 'An unknown error occurred',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-tier-navy">
      <StandardPageHeader
        title="TrackMan Import"
        subtitle="Upload TrackMan CSV or PDF files to import technical data"
        helpText="Import data from TrackMan launch monitor to track technical development. Upload CSV or PDF files with shot data for automatic analysis of club speed, ball speed, smash factor and other technical parameters."
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-tier-white p-6 mb-8">
          <SectionTitle style={{ marginBottom: '1rem' }}>Upload file</SectionTitle>

          <div
            className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
              dragActive
                ? 'border-tier-navy bg-tier-navy/5'
                : 'border-gray-300 hover:border-tier-navy/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: CSV, PDF
              </p>
            </div>
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-tier-navy" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearFile}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  disabled={uploading}
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-tier-navy text-white rounded-lg hover:bg-tier-navy-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-start space-x-3 ${
                uploadResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {uploadResult.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Upload successful!</p>
                    <p className="text-sm text-green-700 mt-1">
                      {uploadResult.shotsImported} shots imported from {uploadResult.import?.fileName}
                    </p>
                    {uploadResult.import && (
                      <p className="text-xs text-green-600 mt-1">
                        Import-ID: {uploadResult.import.id}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">Upload failed</p>
                    <p className="text-sm text-red-700 mt-1">{uploadResult.error}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Import History */}
        <div className="bg-white rounded-lg shadow-tier-white p-6">
          <SectionTitle style={{ marginBottom: '1rem' }}>Import history</SectionTitle>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-tier-navy" />
            </div>
          ) : importHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p>No previous imports</p>
            </div>
          ) : (
            <div className="space-y-3">
              {importHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-tier-navy/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-tier-navy" />
                      <div>
                        <p className="font-medium text-gray-900">{item.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {item.importedRows} of {item.totalRows} rows imported
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatDate(item.importedAt)}
                      </p>
                      {item.sessionId && (
                        <p className="text-xs text-gray-400 mt-1">
                          Session: {item.sessionId.substring(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackmanUploadPage;
