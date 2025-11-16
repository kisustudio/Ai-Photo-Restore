import React, { useState, useCallback } from 'react';
import { fileToBase64 } from '../utils/fileUtils';
import { restorePhoto } from '../services/geminiService';
import Spinner from './Spinner';
import { UploadIcon, SparklesIcon, DownloadIcon } from './Icons';

const ImageProcessor: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      setRestoredImage(null);
      setError(null);
      try {
        const base64 = await fileToBase64(file);
        setOriginalImagePreview(base64);
      } catch (err) {
        setError('Failed to read the image file.');
        console.error(err);
      }
    }
  };

  const handleRestoreClick = useCallback(async () => {
    if (!originalImagePreview || !originalFile) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRestoredImage(null);

    try {
      const { base64Data, mimeType } = {
        base64Data: originalImagePreview.split(',')[1],
        mimeType: originalFile.type
      };

      const restored = await restorePhoto(base64Data, mimeType);
      setRestoredImage(restored);
    } catch (err: any) {
      setError(`Restoration failed: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImagePreview, originalFile]);

  let downloadFilename = 'restored-photo.png';
  if (originalFile && restoredImage) {
      const basename = originalFile.name.lastIndexOf('.') > -1 
          ? originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) 
          : originalFile.name;
      const extension = restoredImage.split(';')[0].split('/')[1] || 'png';
      downloadFilename = `${basename}-restored.${extension}`;
  }

  return (
    <div className="flex flex-col items-center w-full">
      {!originalImagePreview && (
        <div className="w-full max-w-2xl">
          <label htmlFor="file-upload" className="relative block w-full h-64 border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-indigo-400 cursor-pointer transition-colors duration-300 bg-gray-800/50">
            <div className="flex flex-col items-center justify-center h-full">
              <UploadIcon className="w-12 h-12 text-gray-500" />
              <span className="mt-4 block text-lg font-semibold text-gray-400">
                Upload an old photo
              </span>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
      )}

      {originalImagePreview && (
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-300">Original Photo</h2>
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-800 shadow-lg">
                <img src={originalImagePreview} alt="Original" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-300">Restored Photo</h2>
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-800 shadow-lg flex items-center justify-center">
                {isLoading ? (
                  <div className="flex flex-col items-center text-gray-400">
                    <Spinner />
                    <p className="mt-4">Restoring your memory...</p>
                  </div>
                ) : restoredImage ? (
                  <img src={restoredImage} alt="Restored" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-gray-500 text-center p-4">
                    <p>Click "Restore Photo" to see the magic</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleRestoreClick}
              disabled={isLoading}
              className="flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <SparklesIcon className="w-6 h-6 mr-3" />
              {isLoading ? 'Processing...' : 'Restore Photo'}
            </button>
            {restoredImage && !isLoading && (
              <a
                href={restoredImage}
                download={downloadFilename}
                className="flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <DownloadIcon className="w-6 h-6 mr-3" />
                Download Restored Photo
              </a>
            )}
            <label htmlFor="file-upload-replace" className="cursor-pointer text-indigo-400 hover:text-indigo-300 transition-colors">
              Or upload another photo
              <input id="file-upload-replace" name="file-upload-replace" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 w-full max-w-2xl bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageProcessor;
