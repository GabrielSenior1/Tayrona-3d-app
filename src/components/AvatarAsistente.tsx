import React, { useState, useEffect, useRef } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import './AvatarAsistente.css';

interface AvatarProps {
  textoGuion?: string;
}

const DEFAULT_TEXT = "Hola, soy SIMI y hago parte del semillero de investigación de modelado e impresión 3D de la Universidad del Magdalena.";

const AvatarAsistente: React.FC<AvatarProps> = ({ textoGuion }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showBubble, setShowBubble] = useState(true); // Mostrar nubecita al inicio
  const [currentText, setCurrentText] = useState(textoGuion || DEFAULT_TEXT);
  const objectRef = useRef<HTMLObjectElement>(null);

  useEffect(() => {
    setCurrentText(textoGuion || DEFAULT_TEXT);
  }, [textoGuion]);

  useEffect(() => {
    const checkPreferences = async () => {
      const { value } = await Preferences.get({ key: 'avatar_enabled' });
      if (value === 'false') {
        setIsVisible(false);
      }
    };
    checkPreferences();
    
    // Ocultar la burbuja inicial después de 5 segundos
    const timer = setTimeout(() => setShowBubble(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMouthAnimation = (speaking: boolean) => {
    try {
      const svgDoc = objectRef.current?.contentDocument;
      if (svgDoc) {
        const mouth = svgDoc.getElementById('mouth');
        if (mouth) {
          if (speaking) {
            mouth.classList.add('mouth-speaking');
          } else {
            mouth.classList.remove('mouth-speaking');
          }
        }
      }
    } catch (e) {
      console.warn("No se pudo acceder al DOM del SVG", e);
    }
  };

  const hablar = async () => {
    if (!isVisible) return;
    
    setShowBubble(true);

    try {
      setIsSpeaking(true);
      toggleMouthAnimation(true);
      await Haptics.impact({ style: ImpactStyle.Light });

      await TextToSpeech.speak({
        text: currentText,
        lang: 'es-ES',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient',
      });

      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error("Error en TTS:", error);
    } finally {
      setIsSpeaking(false);
      toggleMouthAnimation(false);
      setTimeout(() => setShowBubble(false), 3000);
    }
  };

  useEffect(() => {
    if (textoGuion && textoGuion.trim() !== '') {
      hablar();
    }
    return () => {
      TextToSpeech.stop().catch(()=>console.log("Audio detenido"));
    };
  }, [textoGuion]);

  if (!isVisible) return null;

  return (
    <div className="avatar-wrapper">
      {showBubble && (
        <div className="pixel-bubble">
          {currentText}
        </div>
      )}
      <div 
        className="avatar-container" 
        onClick={hablar}
        role="button"
        aria-label="Asistente virtual SIMI"
      >
        <object 
          ref={objectRef}
          data="/assets/avatar/avatar.svg" 
          type="image/svg+xml" 
          className="avatar-object"
          aria-hidden="true"
          onLoad={() => toggleMouthAnimation(isSpeaking)}
        >
          Tu navegador no soporta SVG
        </object>
      </div>
    </div>
  );
};

export default AvatarAsistente;
