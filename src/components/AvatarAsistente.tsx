import React, { useState, useEffect, useRef } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import './AvatarAsistente.css';

interface AvatarProps {
  textoGuion?: string;
  audioUrl?: string;
  pose?: 'a' | 'b' | 'c';
  onSpeakEnd?: () => void;
  onSkip?: () => void;
  onStartTour?: () => void;
}

const AvatarAsistente: React.FC<AvatarProps> = ({ 
  textoGuion, 
  audioUrl,
  pose = 'a', 
  onSpeakEnd,
  onSkip,
  onStartTour
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  
  const objectRef = useRef<HTMLObjectElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSpeakId = useRef(0);

  useEffect(() => {
    const checkPreferences = async () => {
      const { value } = await Preferences.get({ key: 'avatar_enabled' });
      if (value === 'false') setIsVisible(false);
    };
    checkPreferences();
  }, []);

  const getAvatarSvg = () => {
    if (pose === 'b') return "/assets/avatar/avatar b.svg";
    if (pose === 'c') return "/assets/avatar/avatar c.svg";
    return "/assets/avatar/avatar.svg";
  };

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

  const detenerAudio = async () => {
    currentSpeakId.current += 1; 
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    await TextToSpeech.stop().catch(() => {});
    setIsSpeaking(false);
    toggleMouthAnimation(false);
  };

  const hablar = async (textToSpeak: string, audioFile?: string) => {
    if (!isVisible || !textToSpeak) return;
    
    await detenerAudio();
    
    currentSpeakId.current += 1;
    const thisSpeakId = currentSpeakId.current;

    setIsSpeaking(true);
    toggleMouthAnimation(true);
    await Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});

    if (audioFile) {
      const audio = new Audio(audioFile);
      audioRef.current = audio;
      
      audio.onended = () => {
        if (currentSpeakId.current === thisSpeakId) {
          setIsSpeaking(false);
          toggleMouthAnimation(false);
          if (onSpeakEnd) onSpeakEnd();
        }
      };
      
      audio.onerror = async () => {
        console.warn(`Audio no encontrado: ${audioFile}. Usando TTS.`);
        audioRef.current = null;
        await playTTS(textToSpeak, thisSpeakId);
      };

      audio.play().catch(async (e) => {
        console.warn("Error al reproducir audio, usando TTS:", e);
        audioRef.current = null;
        await playTTS(textToSpeak, thisSpeakId);
      });

    } else {
      await playTTS(textToSpeak, thisSpeakId);
    }
  };

  const playTTS = async (text: string, thisSpeakId: number) => {
    try {
      await TextToSpeech.speak({
        text: text,
        lang: 'es-CO',
        rate: 1.05,
        pitch: 1.1,
        volume: 1.0,
        category: 'ambient',
      });
    } catch (error) {
      console.error("Error en TTS:", error);
    } finally {
      if (currentSpeakId.current === thisSpeakId) {
        setIsSpeaking(false);
        toggleMouthAnimation(false);
        if (onSpeakEnd) onSpeakEnd();
      }
    }
  };

  // Reacciona a cambios en el guion
  useEffect(() => {
    if (textoGuion && textoGuion.trim() !== '') {
      setShowMenu(false);
      hablar(textoGuion, audioUrl);
    } else {
      detenerAudio();
    }
    return () => {
      detenerAudio();
    };
  }, [textoGuion, audioUrl, pose]);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (textoGuion && textoGuion.trim() !== '') {
      // Avanza el tour
      if (onSpeakEnd) {
        detenerAudio(); // Detiene el audio actual si tocan para avanzar
        onSpeakEnd();
      }
    } else {
      // Muestra el menú
      setShowMenu(!showMenu);
    }
  };

  const isTourActive = !!(textoGuion && textoGuion.trim() !== '');

  if (!isVisible) return null;

  return (
    <>
      {isTourActive ? (
        <div className="avatar-overlay" onClick={handleContainerClick}>
          <div className="rpg-container" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-container">
              <object 
                ref={objectRef}
                data={getAvatarSvg()} 
                type="image/svg+xml" 
                className="avatar-object"
                aria-hidden="true"
                onLoad={() => toggleMouthAnimation(isSpeaking)}
              />
            </div>
            <div className="rpg-dialog" onClick={handleContainerClick}>
              <div className="rpg-name-badge">SIMI • Guía Tayrona</div>
              <div className="rpg-text">{textoGuion}</div>
              <div className="rpg-actions">
                <div className="rpg-continue">Toca para continuar ▾</div>
                {onSkip && (
                  <button className="rpg-skip" onClick={(e) => { 
                    e.stopPropagation(); 
                    detenerAudio();
                    onSkip(); 
                  }}>
                    ✕ Omitir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="avatar-wrapper">
          {showMenu && (
            <div className="interactive-menu">
              {onStartTour && (
                <div className="menu-item" onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowMenu(false); 
                  onStartTour(); 
                }}>
                  🎓 Hacer recorrido guiado
                </div>
              )}
              <div className="menu-item" onClick={(e) => { 
                e.stopPropagation(); 
                setShowMenu(false); 
                hablar("¿Sabías que el pez loro tritura los corales con su pico y produce arena blanca? ¡Gran parte de las playas caribeñas son en realidad sus desechos!", "/assets/audio/simi/simi_pez_loro.mp3.mp3"); 
              }}>
                💡 Dato curioso marino
              </div>
              <div className="menu-item" onClick={(e) => { 
                e.stopPropagation(); 
                setShowMenu(false); 
              }}>
                ❌ Cerrar menú
              </div>
            </div>
          )}
          <div 
            className="avatar-container interactive-mode" 
            onClick={handleContainerClick}
          >
            <object 
              ref={objectRef}
              data={getAvatarSvg()} 
              type="image/svg+xml" 
              className="avatar-object"
              aria-hidden="true"
              onLoad={() => toggleMouthAnimation(isSpeaking)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AvatarAsistente;
