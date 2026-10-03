import React, { useState, useEffect, useRef } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import './AvatarAsistente.css';

interface AvatarProps {
  textoGuion?: string; // El texto que va a leer
}

const AvatarAsistente: React.FC<AvatarProps> = ({ textoGuion }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const objectRef = useRef<HTMLObjectElement>(null);

  useEffect(() => {
    // Revisar si el usuario lo desactivó en preferencias
    const checkPreferences = async () => {
      const { value } = await Preferences.get({ key: 'avatar_enabled' });
      // Por defecto está activo a menos que guardemos 'false'
      if (value === 'false') {
        setIsVisible(false);
      }
    };
    checkPreferences();
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

  const hablar = async (texto: string) => {
    if (!isVisible) return;

    try {
      setIsSpeaking(true);
      toggleMouthAnimation(true);
      await Haptics.impact({ style: ImpactStyle.Light }); // Vibración al inicio

      await TextToSpeech.speak({
        text: texto,
        lang: 'es-ES',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient',
      });

      await Haptics.impact({ style: ImpactStyle.Light }); // Vibración al final
    } catch (error) {
      console.error("Error en TTS:", error);
    } finally {
      setIsSpeaking(false);
      toggleMouthAnimation(false);
    }
  };

  // Efecto para hablar automáticamente cuando cambia el guion
  useEffect(() => {
    if (textoGuion && textoGuion.trim() !== '') {
      hablar(textoGuion);
    }
    
    return () => {
      // Detener el audio si el componente se desmonta
      TextToSpeech.stop().catch(()=>console.log("Audio detenido"));
    };
  }, [textoGuion]);

  if (!isVisible) return null;

  return (
    <div 
      className="avatar-container" 
      onClick={() => hablar(textoGuion || "Hola, soy tu guía en este recorrido.")}
      role="button"
      aria-label="Asistente virtual. Toca para escuchar la información."
    >
      <object 
        ref={objectRef}
        data="/assets/avatar/avatar.svg" 
        type="image/svg+xml" 
        className="avatar-object"
        aria-hidden="true" // Oculto para lectores de pantalla porque la acción está en el div
        onLoad={() => toggleMouthAnimation(isSpeaking)} // Asegura que la boca empiece cerrada
      >
        Tu navegador no soporta SVG
      </object>
    </div>
  );
};

export default AvatarAsistente;
