import React, { useState, useEffect, useRef } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import './AvatarAsistente.css';

interface AvatarProps {
  textoGuion?: string;
  onSpeakEnd?: () => void;
  onAvatarClick?: () => void;
}

const AvatarAsistente: React.FC<AvatarProps> = ({ textoGuion, onSpeakEnd, onAvatarClick }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showBubble, setShowBubble] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const objectRef = useRef<HTMLObjectElement>(null);

  // Variable para evitar que una lectura anterior dispare onSpeakEnd cuando se canceló
  const currentSpeakId = useRef(0);

  useEffect(() => {
    const checkPreferences = async () => {
      const { value } = await Preferences.get({ key: 'avatar_enabled' });
      if (value === 'false') setIsVisible(false);
    };
    checkPreferences();
  }, []);

  const toggleMouthAnimation = (speaking: boolean) => {
    try {
      const svgDoc = objectRef.current?.contentDocument;
      if (svgDoc) {
        const mouth = svgDoc.getElementById('mouth');
        if (mouth) {
          if (speaking) mouth.classList.add('mouth-speaking');
          else mouth.classList.remove('mouth-speaking');
        }
      }
    } catch (e) {
      console.warn("No se pudo acceder al DOM del SVG", e);
    }
  };

  const hablar = async (textToSpeak: string) => {
    if (!isVisible || !textToSpeak) return;
    
    currentSpeakId.current += 1;
    const thisSpeakId = currentSpeakId.current;
    
    // Si ya estaba hablando, detenerlo primero
    await TextToSpeech.stop().catch(() => {});

    setShowBubble(true);
    setCurrentText(textToSpeak);

    try {
      setIsSpeaking(true);
      toggleMouthAnimation(true);
      await Haptics.impact({ style: ImpactStyle.Light });

      await TextToSpeech.speak({
        text: textToSpeak,
        lang: 'es-CO',
        rate: 1.05,
        pitch: 1.1,
        volume: 1.0,
        category: 'ambient',
      });

      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error("Error en TTS:", error);
    } finally {
      if (currentSpeakId.current === thisSpeakId) {
        setIsSpeaking(false);
        toggleMouthAnimation(false);
        setTimeout(() => setShowBubble(false), 2000);
        if (onSpeakEnd) onSpeakEnd();
      }
    }
  };

  const detener = async () => {
    currentSpeakId.current += 1; // Cancela cualquier callback pendiente
    await TextToSpeech.stop().catch(() => {});
    setIsSpeaking(false);
    toggleMouthAnimation(false);
    setShowBubble(false);
  };

  useEffect(() => {
    if (textoGuion && textoGuion.trim() !== '') {
      hablar(textoGuion);
    } else {
      detener();
    }
    return () => {
      detener();
    };
  }, [textoGuion]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click se propague y cancele el tour globalmente
    if (onAvatarClick) {
      onAvatarClick();
    } else if (!textoGuion) {
      // Comportamiento por defecto si no hay tour script
      hablar("Hola, soy SIMI.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="avatar-wrapper">
      {showBubble && currentText && (
        <div className="pixel-bubble">
          {currentText}
        </div>
      )}
      <div 
        className="avatar-container" 
        onClick={handleClick}
        role="button"
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
