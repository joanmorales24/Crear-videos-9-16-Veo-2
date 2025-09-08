
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      onImageUpload(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      onImageUpload(null);
      setImagePreview(null);
    }
  }, [onImageUpload]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-100">1. Cargar Imagen</h2>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-indigo-500 bg-gray-700' : 'border-gray-600 hover:border-indigo-500'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {imagePreview ? (
          <div className="relative group">
             <img src={imagePreview} alt="Preview" className="mx-auto max-h-48 rounded-md" />
             <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                 <button onClick={onButtonClick} className="bg-white text-black py-2 px-4 rounded-md font-semibold">Cambiar imagen</button>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
             <UploadIcon className="w-12 h-12 text-gray-500" />
            <p className="text-gray-400">Arrastra y suelta tu imagen aquí</p>
            <p className="text-gray-500 text-sm">o</p>
            <button
              onClick={onButtonClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Examinar Archivos
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg, image/png, image/webp"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">Formatos soportados: JPG, PNG, WEBP</p>
    </div>
  );
};
