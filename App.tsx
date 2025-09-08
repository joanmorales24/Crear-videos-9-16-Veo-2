
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { GenerateVideosOperationResponse } from '@google/genai';
import { ImageUploader } from './components/ImageUploader';
import { VideoConfigurator } from './components/VideoConfigurator';
import { GenerationPanel } from './components/GenerationPanel';
import { AspectRatio } from './types';
import { generateVideoFromImage } from './services/geminiService';
import { Auth } from './components/Auth';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SixteenToNine);
  const [duration, setDuration] = useState<number>(5);
  const [addMusic, setAddMusic] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  const handleImageUpload = useCallback((file: File | null) => {
    setImageFile(file);
    setVideoUrl(null);
    setError(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setImageBase64(null);
    }
  }, []);

  const handleGenerateVideo = async () => {
    if (!imageBase64 || !imageFile) {
      setError("Por favor, carga una imagen primero.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const fullPrompt = `${prompt} Video duration: ${duration} seconds. ${addMusic ? 'Add ambient music.' : ''}`.trim();
      
      const generatedVideoUrl = await generateVideoFromImage(
        imageBase64,
        imageFile.type,
        fullPrompt,
        aspectRatio,
        (message) => setStatusMessage(message)
      );

      setVideoUrl(generatedVideoUrl);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Ocurrió un error desconocido al generar el video.");
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const isGenerationDisabled = !imageFile || isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-10 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
              Creador de Video con Veo 2
            </h1>
            <p className="mt-2 text-lg text-gray-400">Transforma tus imágenes estáticas en videos dinámicos.</p>
          </div>
          <Auth />
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
            <ImageUploader onImageUpload={handleImageUpload} />
            <VideoConfigurator
              prompt={prompt}
              setPrompt={setPrompt}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              duration={duration}
              setDuration={setDuration}
              addMusic={addMusic}
              setAddMusic={setAddMusic}
            />
          </div>
          <div className="lg:sticky lg:top-8 h-max">
             <GenerationPanel
                aspectRatio={aspectRatio}
                isLoading={isLoading}
                error={error}
                videoUrl={videoUrl}
                statusMessage={statusMessage}
                onGenerate={handleGenerateVideo}
                isGenerationDisabled={isGenerationDisabled}
             />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
