import React from 'react';
import { AspectRatio, CameraMove } from '../types';
import { RectangleHorizontalIcon } from './icons/RectangleHorizontalIcon';
import { RectangleVerticalIcon } from './icons/RectangleVerticalIcon';
import { QualityIcon } from './icons/QualityIcon';
import { CameraIcon } from './icons/CameraIcon';
import { MusicIcon } from './icons/MusicIcon';

interface VideoConfiguratorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  duration: number;
  setDuration: (duration: number) => void;
  audioPrompt: string;
  setAudioPrompt: (prompt: string) => void;
  cameraMove: CameraMove;
  setCameraMove: (move: CameraMove) => void;
}

export const VideoConfigurator: React.FC<VideoConfiguratorProps> = ({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  duration,
  setDuration,
  audioPrompt,
  setAudioPrompt,
  cameraMove,
  setCameraMove,
}) => {
  const cameraMoves = Object.values(CameraMove);
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-xl font-bold text-gray-100">3. Configuración de Video</h2>
      
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
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <CameraIcon className="w-5 h-5 text-indigo-400" />
            Movimiento de Cámara
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cameraMoves.map((move) => (
                <button
                    key={move}
                    onClick={() => setCameraMove(move)}
                    className={`p-2 border-2 rounded-lg text-center transition-all duration-200 text-sm font-medium ${
                        cameraMove === move
                            ? 'border-indigo-500 bg-indigo-900/50 scale-105 text-white'
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300'
                    }`}
                    aria-pressed={cameraMove === move}
                >
                    {move}
                </button>
            ))}
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
      
      <div>
        <label htmlFor="audioPrompt" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <MusicIcon className="w-5 h-5 text-indigo-400" />
          Descripción del Audio (Opcional)
        </label>
        <input
          id="audioPrompt"
          type="text"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="Ej: 'Música de rock épica', 'Sonido de olas y gaviotas'"
          value={audioPrompt}
          onChange={(e) => setAudioPrompt(e.target.value)}
        />
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
      aria-pressed={isSelected}
    >
      <div className="flex justify-center text-gray-400">{icon}</div>
      <p className="font-semibold text-gray-100">{label}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </button>
)
