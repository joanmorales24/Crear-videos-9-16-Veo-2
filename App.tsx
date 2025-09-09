import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageEditor } from './components/ImageEditor';
import { VideoConfigurator } from './components/VideoConfigurator';
import { GenerationPanel } from './components/GenerationPanel';
import { AspectRatio, CameraMove } from './types';
import { generateVideoFromImage, editImage } from './services/geminiService';
import { Auth } from './components/Auth';

const DAILY_LIMIT = 10;

const App: React.FC = () => {
  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageBase64, setOriginalImageBase64] = useState<string | null>(null);
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ type: 'original' | 'edited'; index: number } | null>(null);

  // Edit state
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Video config state
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SixteenToNine);
  const [duration, setDuration] = useState<number>(5);
  const [audioPrompt, setAudioPrompt] = useState<string>('');
  const [cameraMove, setCameraMove] = useState<CameraMove>(CameraMove.None);

  // Generation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [generationsToday, setGenerationsToday] = useState<number>(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastGenerationDate = localStorage.getItem('lastGenerationDate');
    
    if (lastGenerationDate === today) {
        const count = parseInt(localStorage.getItem('generationCount') || '0', 10);
        setGenerationsToday(count);
    } else {
        localStorage.setItem('lastGenerationDate', today);
        localStorage.setItem('generationCount', '0');
        setGenerationsToday(0);
    }
  }, []);


  const resetAllButImage = () => {
    setEditHistory([]);
    setSelectedImage(null);
    setEditPrompt('');
    setIsEditing(false);
    setEditError(null);
    setPrompt('');
    setAspectRatio(AspectRatio.SixteenToNine);
    setDuration(5);
    setAudioPrompt('');
    setCameraMove(CameraMove.None);
    setIsLoading(false);
    setError(null);
    setVideoUrl(null);
    setStatusMessage('');
  };
  
  const handleImageUpload = useCallback((file: File | null) => {
    setImageFile(file);
    resetAllButImage();

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setOriginalImageBase64(base64String);
        setSelectedImage({ type: 'original', index: -1 });
      };
      reader.readAsDataURL(file);
    } else {
      setOriginalImageBase64(null);
    }
  }, []);

  const handleEditImage = async () => {
    let sourceImageForEdit: string | null = null;
    if (selectedImage?.type === 'original') {
        sourceImageForEdit = originalImageBase64;
    } else if (selectedImage?.type === 'edited' && selectedImage.index < editHistory.length) {
        sourceImageForEdit = editHistory[selectedImage.index];
    } else {
        sourceImageForEdit = originalImageBase64;
    }

    if (!sourceImageForEdit || !imageFile) {
      setEditError("Por favor, carga una imagen primero.");
      return;
    }
    if (!editPrompt.trim()) {
      setEditError("Por favor, describe cómo quieres editar la imagen.");
      return;
    }

    setIsEditing(true);
    setEditError(null);
    
    try {
      const newImageBase64 = await editImage(sourceImageForEdit, imageFile.type, editPrompt);
      const newHistory = [...editHistory, newImageBase64];
      setEditHistory(newHistory);
      setSelectedImage({ type: 'edited', index: newHistory.length - 1 });
    } catch (e) {
      console.error(e);
      setEditError(e instanceof Error ? e.message : "Ocurrió un error al editar la imagen.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleSelectImage = (type: 'original' | 'edited', index: number) => {
    setSelectedImage({ type, index });
  };
  
  const handleDeleteEdit = (indexToDelete: number) => {
    const newHistory = editHistory.filter((_, i) => i !== indexToDelete);
    setEditHistory(newHistory);
  
    if (selectedImage?.type === 'edited') {
      if (selectedImage.index === indexToDelete) {
        setSelectedImage({ type: 'original', index: -1 });
      } else if (selectedImage.index > indexToDelete) {
        setSelectedImage({ type: 'edited', index: selectedImage.index - 1 });
      }
    }
  };

  const handleGenerateVideo = async () => {
    let sourceImageBase64: string | null = null;
    if (selectedImage?.type === 'original') {
        sourceImageBase64 = originalImageBase64;
    } else if (selectedImage?.type === 'edited' && selectedImage.index < editHistory.length) {
        sourceImageBase64 = editHistory[selectedImage.index];
    } else {
        sourceImageBase64 = originalImageBase64;
    }


    if (!sourceImageBase64 || !imageFile) {
      setError("Por favor, selecciona una imagen para generar el video.");
      return;
    }

    if (generationsToday >= DAILY_LIMIT) {
        setError("Has alcanzado el límite de generaciones diarias.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const cameraInstruction = cameraMove !== CameraMove.None ? `Movimiento de cámara: ${cameraMove}.` : '';
      const promptParts = [
        prompt,
        cameraInstruction,
        audioPrompt,
        `Video duration: ${duration} seconds.`
      ];
      const fullPrompt = promptParts.filter(Boolean).join(' ').trim();
      
      const generatedVideoUrl = await generateVideoFromImage(
        sourceImageBase64,
        imageFile.type,
        fullPrompt,
        aspectRatio,
        (message) => setStatusMessage(message)
      );

      setVideoUrl(generatedVideoUrl);
      const newCount = generationsToday + 1;
      setGenerationsToday(newCount);
      localStorage.setItem('generationCount', newCount.toString());

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Ocurrió un error desconocido al generar el video.");
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const isLimitReached = generationsToday >= DAILY_LIMIT;
  const isGenerationDisabled = !imageFile || isLoading || isLimitReached;
  
  const getActiveImageForPreview = () => {
    if (selectedImage?.type === 'edited' && editHistory[selectedImage.index]) {
      return editHistory[selectedImage.index];
    }
    return originalImageBase64;
  };
  const imageForPreview = getActiveImageForPreview();

  const selectedEditedImageForUploader = 
    selectedImage?.type === 'edited' && editHistory[selectedImage.index] 
    ? editHistory[selectedImage.index] 
    : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-10 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
              Creador de Video con Veo 2
            </h1>
            <p className="mt-2 text-lg text-gray-400">Edita tus imágenes y transfórmalas en videos dinámicos.</p>
          </div>
          <Auth />
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              originalImage={originalImageBase64}
              selectedEditedImage={selectedEditedImageForUploader}
              editHistory={editHistory}
              selectedImage={selectedImage}
              onSelectImage={handleSelectImage}
              onDeleteEdit={handleDeleteEdit}
            />
            {originalImageBase64 && (
              <ImageEditor 
                prompt={editPrompt}
                setPrompt={setEditPrompt}
                onEdit={handleEditImage}
                isEditing={isEditing}
                error={editError}
              />
            )}
            {imageFile && (
              <VideoConfigurator
                prompt={prompt}
                setPrompt={setPrompt}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                duration={duration}
                setDuration={setDuration}
                audioPrompt={audioPrompt}
                setAudioPrompt={setAudioPrompt}
                cameraMove={cameraMove}
                setCameraMove={setCameraMove}
              />
            )}
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
                imagePreview={imageForPreview}
                generationsToday={generationsToday}
                dailyLimit={DAILY_LIMIT}
                isLimitReached={isLimitReached}
             />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
