import React from 'react';
import { EditIcon } from './icons/EditIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ImageEditorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onEdit: () => void;
  isEditing: boolean;
  error: string | null;
}

const photoStyles = [
    {
        name: 'Retrato 50mm f/1.8',
        prompt: 'Ajusta la foto para que parezca tomada con una lente de 50mm a f/1.8. Es crucial mantener a todas las personas en la imagen nítidas y perfectamente enfocadas, creando un desenfoque de fondo (bokeh) suave y estético.',
    },
    {
        name: 'Retrato 70mm f/1.8',
        prompt: 'Simula un retrato tomado con una lente de 70mm a f/1.8. El foco debe estar perfectamente definido sobre las personas, dejándolas completamente nítidas, mientras se aplica una compresión de perspectiva y un desenfoque pronunciado al fondo.',
    },
    {
        name: 'Gran Angular 24mm',
        prompt: 'Aplica un estilo de lente gran angular de 24mm. Toda la escena, especialmente las personas, debe permanecer nítida y enfocada, con una ligera distorsión natural en los bordes para un look auténtico.',
    },
    {
        name: 'Look Cinematográfico',
        prompt: 'Aplica una gradación de color cinematográfica (teal and orange) y añade un ligero grano de película. Importante: la nitidez original de las personas en la foto no debe verse afectada por los efectos de color.',
    },
    {
        name: 'Blanco y Negro',
        prompt: 'Convierte la imagen a un blanco y negro de alto contraste para un efecto impactante y artístico. El punto de foco principal son las personas; preserva su nitidez y detalle por encima de todo.',
    },
    {
        name: 'Estilo Vintage',
        prompt: 'Dale a la foto un aspecto de película analógica vintage con colores desaturados y un suave viñeteado. Aunque el estilo es "suave", las personas en la imagen deben mantener su nitidez y no verse borrosas.',
    },
    {
        name: 'Ampliar Imagen',
        prompt: 'Aleja ligeramente el encuadre de la imagen, como si hicieras un \'zoom out\'. Genera de forma inteligente nuevo contenido en los bordes que se integre perfectamente con la foto original en estilo, iluminación y contexto. Es fundamental que el contenido original de la imagen, especialmente las personas, se mantenga intacto, sin alteraciones y perfectamente nítido.',
    },
];


export const ImageEditor: React.FC<ImageEditorProps> = ({ prompt, setPrompt, onEdit, isEditing, error }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <EditIcon className="w-6 h-6 text-indigo-400" />
            2. Edición de Imagen (Opcional)
        </h2>
      
        <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Estilos Fotográficos Rápidos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photoStyles.map((style) => (
                    <button
                        key={style.name}
                        onClick={() => setPrompt(style.prompt)}
                        className={`p-2 border-2 rounded-lg text-center transition-all duration-200 text-xs sm:text-sm font-medium ${
                            prompt === style.prompt
                                ? 'border-indigo-500 bg-indigo-900/50 scale-105 text-white'
                                : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300'
                        }`}
                        aria-pressed={prompt === style.prompt}
                    >
                        {style.name}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                O describe tu propio estilo (Avanzado)
            </label>
            <textarea
                id="edit-prompt"
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Describe los cambios que quieres aplicar a la imagen..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
        </div>

        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-3 py-2 rounded-md text-sm" role="alert">
                <span>{error}</span>
            </div>
        )}

        <button
            onClick={onEdit}
            disabled={isEditing || !prompt.trim()}
            className="w-full flex items-center justify-center font-bold py-2 px-4 rounded-lg transition-colors bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            {isEditing ? (
                <>
                    <SpinnerIcon className="w-5 h-5 mr-2" />
                    Aplicando Estilo...
                </>
            ) : (
                'Aplicar Estilo'
            )}
        </button>
    </div>
  );
};
