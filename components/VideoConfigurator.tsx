import React from 'react';
import { AspectRatio } from '../types';
import { RectangleHorizontalIcon } from './icons/RectangleHorizontalIcon';
import { RectangleVerticalIcon } from './icons/RectangleVerticalIcon';
import { QualityIcon } from './icons/QualityIcon';

interface VideoConfiguratorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  duration: number;
  setDuration: (duration: number) => void;
  addMusic: boolean;
  setAddMusic: (add: boolean) => void;
}

export const VideoConfigurator: React.FC<VideoConfiguratorProps> = ({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  duration,
  setDuration,
  addMusic,
  setAddMusic,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-xl font-bold text-gray-100">2. Configuración de Video</h2>
      
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Describe la animación
        </label>
        <textarea
          id="prompt"
          rows={3}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="Ej: 'Un suave zoom hacia adelante, con partículas de luz flotando'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Relación de Aspecto</h3>
        <div className="grid grid-cols-2 gap-4">
          <AspectRatioButton
            label="16:9 Horizontal"
            description="Ideal para YouTube"
            icon={<RectangleHorizontalIcon className="w-8 h-8 mb-2" />}
            isSelected={aspectRatio === AspectRatio.SixteenToNine}
            onClick={() => setAspectRatio(AspectRatio.SixteenToNine)}
          />
          <AspectRatioButton
            label="9:16 Vertical"
            description="Perfecto para TikTok, Reels"
            icon={<RectangleVerticalIcon className="w-8 h-8 mb-2" />}
            isSelected={aspectRatio === AspectRatio.NineToSixteen}
            onClick={() => setAspectRatio(AspectRatio.NineToSixteen)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Calidad de Video</h3>
        <div className="bg-gray-700/80 border border-gray-600 rounded-lg p-3 flex items-center space-x-4">
          <QualityIcon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-100">1080p (Full HD)</p>
            <p className="text-xs text-gray-400">Veo 2 genera videos en alta calidad por defecto.</p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
          Duración del Video: <span className="font-bold text-indigo-400">{duration}s</span>
        </label>
        <input
          id="duration"
          type="range"
          min="3"
          max="15"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>
      
      <div className="flex items-center">
        <input
          id="addMusic"
          type="checkbox"
          checked={addMusic}
          onChange={(e) => setAddMusic(e.target.checked)}
          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="addMusic" className="ml-3 block text-sm text-gray-300">
          Añadir música ambiental (automático por Veo 2)
        </label>
      </div>
    </div>
  );
};

interface AspectRatioButtonProps {
    label: string;
    description: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
}

const AspectRatioButton: React.FC<AspectRatioButtonProps> = ({ label, description, icon, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
        isSelected ? 'border-indigo-500 bg-indigo-900/50 scale-105' : 'border-gray-600 bg-gray-700 hover:border-gray-500'
      }`}
    >
      <div className="flex justify-center text-gray-400">{icon}</div>
      <p className="font-semibold text-gray-100">{label}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </button>
)
