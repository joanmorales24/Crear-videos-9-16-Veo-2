import React from 'react';
import { AspectRatio } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface GenerationPanelProps {
  aspectRatio: AspectRatio;
  isLoading: boolean;
  error: string | null;
  videoUrl: string | null;
  statusMessage: string;
  onGenerate: () => void;
  isGenerationDisabled: boolean;
}

export const GenerationPanel: React.FC<GenerationPanelProps> = ({
  aspectRatio,
  isLoading,
  error,
  videoUrl,
  statusMessage,
  onGenerate,
  isGenerationDisabled,
}) => {
  const isHorizontal = aspectRatio === AspectRatio.SixteenToNine;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-100">3. Generación y Descarga</h2>
      
      <div className={`relative w-full bg-gray-900 rounded-md overflow-hidden transition-all duration-300 ${isHorizontal ? 'aspect-video' : 'aspect-[9/16] max-h-[60vh] mx-auto max-w-sm'}`}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <SpinnerIcon className="w-12 h-12 text-indigo-400" />
            <p className="mt-4 font-semibold text-lg">Generando video...</p>
            <p className="text-sm text-gray-400">{statusMessage}</p>
          </div>
        )}
        {!isLoading && videoUrl && (
          <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
        )}
        {!isLoading && !videoUrl && (
           <div className="absolute inset-0 flex items-center justify-center">
               <p className="text-gray-500">La previsualización aparecerá aquí</p>
           </div>
        )}
      </div>

      <div className="mt-6 flex-grow flex flex-col justify-end">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4 text-sm" role="alert">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
          </div>
        )}
        
        <div className="space-y-4">
          {videoUrl && !isLoading && (
            <a
              href={videoUrl}
              download={`video_generado_${Date.now()}.mp4`}
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
            >
              Descargar Video
            </a>
          )}

          <button
            onClick={onGenerate}
            disabled={isGenerationDisabled}
            className={`w-full text-lg font-bold py-3 px-4 rounded-lg transition-all duration-200 ${
            isGenerationDisabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transform hover:scale-105'
            }`}
          >
            {isLoading ? 'Generando...' : (videoUrl ? 'Generar Otro Video' : 'Generar Video')}
          </button>
        </div>
      </div>
    </div>
  );
};