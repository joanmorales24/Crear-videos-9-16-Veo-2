import React, { useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File | null) => void;
  originalImage: string | null;
  selectedEditedImage: string | null;
  editHistory: string[];
  selectedImage: { type: 'original' | 'edited'; index: number } | null;
  onSelectImage: (type: 'original' | 'edited', index: number) => void;
  onDeleteEdit: (index: number) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onImageUpload, 
    originalImage, 
    selectedEditedImage,
    editHistory,
    selectedImage,
    onSelectImage,
    onDeleteEdit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((files: FileList | null) => {
    const file = files?.[0];
    onImageUpload(file || null);
  }, [onImageUpload]);

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const originalPreviewUrl = originalImage ? `data:image/png;base64,${originalImage}` : null;
  const editedPreviewUrl = selectedEditedImage ? `data:image/png;base64,${selectedEditedImage}` : null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100">1. Cargar Imagen</h2>
        {originalImage && (
             <button onClick={onButtonClick} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-md text-sm">
                Cambiar Imagen
             </button>
        )}
      </div>

      {!originalImage ? (
         <UploadDropzone onFileChange={handleFileChange} onButtonClick={onButtonClick} />
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImagePreviewCard title="Antes" imageUrl={originalPreviewUrl} />
              <ImagePreviewCard title="Después" imageUrl={editedPreviewUrl} />
            </div>
            <div className="mt-6">
                <h3 className="text-base font-bold text-gray-300 mb-3">Galería de Ediciones</h3>
                <div className="flex gap-3 pb-3 -mx-6 px-6 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
                    <Thumbnail
                        imageUrl={`data:image/png;base64,${originalImage}`}
                        isSelected={selectedImage?.type === 'original'}
                        onClick={() => onSelectImage('original', -1)}
                        label="Original"
                    />
                    {editHistory.map((imgBase64, index) => (
                        <Thumbnail
                            key={index}
                            imageUrl={`data:image/png;base64,${imgBase64}`}
                            isSelected={selectedImage?.type === 'edited' && selectedImage.index === index}
                            onClick={() => onSelectImage('edited', index)}
                            onDelete={() => onDeleteEdit(index)}
                            label={`Edición ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
        onChange={(e) => handleFileChange(e.target.files)}
      />
    </div>
  );
};

// --- Helper Components ---

const UploadDropzone: React.FC<{
    onFileChange: (files: FileList | null) => void;
    onButtonClick: () => void;
}> = ({ onFileChange, onButtonClick }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    
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
        onFileChange(e.dataTransfer.files);
      }, [onFileChange]);

    return (
        <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-indigo-500 bg-gray-700' : 'border-gray-600 hover:border-indigo-500'}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
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
            <p className="text-xs text-gray-500 mt-3 text-center">Formatos soportados: JPG, PNG, WEBP</p>
        </div>
    );
}

const ImagePreviewCard: React.FC<{ title: string; imageUrl: string | null; children?: React.ReactNode }> = ({ title, imageUrl, children }) => (
    <div className="bg-gray-700 rounded-lg p-3 text-center relative">
        <h3 className="font-bold text-gray-300 mb-2">{title}</h3>
        <div className="h-80 bg-gray-900 rounded-md flex items-center justify-center overflow-hidden">
            {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
            ) : (
                <p className="text-gray-500 text-sm">
                    {title === 'Antes' ? 'Imagen original' : 'La imagen editada aparecerá aquí'}
                </p>
            )}
        </div>
        {children}
    </div>
);

const Thumbnail: React.FC<{
    imageUrl: string;
    isSelected: boolean;
    onClick: () => void;
    onDelete?: () => void;
    label: string;
}> = ({ imageUrl, isSelected, onClick, onDelete, label }) => (
    <div className="relative flex-shrink-0 group">
        <button
            onClick={onClick}
            className={`w-28 h-28 block bg-gray-900 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                isSelected ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-gray-500'
            }`}
        >
            <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
        </button>
        <p className="text-xs text-center mt-1 text-gray-400">{label}</p>
        {onDelete && (
            <button
                onClick={onDelete}
                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label={`Eliminar ${label}`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        )}
    </div>
);
