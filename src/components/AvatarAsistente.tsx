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
  noOverlay?: boolean;
  hiddenIfInactive?: boolean;
}

const AvatarAsistente: React.FC<AvatarProps> = ({ 
  textoGuion, 
  audioUrl,
  pose = 'a', 
  onSpeakEnd,
  onSkip,
  onStartTour,
  noOverlay = false,
  hiddenIfInactive = false
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  
  // Estado interno para cuando habla desde el menú sin recibir props del padre
  const [internalText, setInternalText] = useState("");
  const [internalAudio, setInternalAudio] = useState("");
  
  const objectRef = useRef<HTMLObjectElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSpeakId = useRef(0);

  const activeText = textoGuion || internalText;
  const activeAudio = textoGuion ? audioUrl : internalAudio;

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
          handleSpeakEnd();
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
        handleSpeakEnd();
      }
    }
  };

  const handleSpeakEnd = () => {
    if (internalText) {
      setInternalText("");
      setInternalAudio("");
    } else if (onSpeakEnd) {
      onSpeakEnd();
    }
  };

  // Reacciona a cambios en el guion del padre o interno
  useEffect(() => {
    if (activeText && activeText.trim() !== '') {
      setShowMenu(false);
      hablar(activeText, activeAudio);
    } else {
      detenerAudio();
    }
    return () => {
      detenerAudio();
    };
  }, [activeText, activeAudio, pose]);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (activeText && activeText.trim() !== '') {
      detenerAudio();
      handleSpeakEnd();
    } else {
      setShowMenu(!showMenu);
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    detenerAudio();
    if (internalText) {
      setInternalText("");
      setInternalAudio("");
    } else if (onSkip) {
      onSkip();
    } else {
      handleSpeakEnd();
    }
  };

  const isTourActive = !!(activeText && activeText.trim() !== '');

  if (!isVisible) return null;

  return (
    <>
      {isTourActive ? (
        <div className={`avatar-overlay ${noOverlay ? 'no-overlay' : ''}`} onClick={handleContainerClick}>
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
            <div className="rpg-dialog" style={{ cursor: 'pointer' }} onClick={handleContainerClick}>
              <div className="rpg-name-badge">SIMI • Guía Tayrona</div>
              <div className="rpg-text">{activeText}</div>
              <div className="rpg-actions" style={{ justifyContent: 'flex-end' }}>
                <div className="rpg-continue">Toca para continuar ▾</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !hiddenIfInactive && (
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
                setInternalAudio("/assets/audio/simi/simi_she.mp3.mp3");
                setInternalText("Aunque también hago parte del Semillero de investigación en modelado e impresión 3D, soy miembro activa de la Asociación de Estudiantes de Licenciatura en Tecnología de la Universidad del Magdalena, más conocida como ALT+TEND."); 
              }}>
                💡 SIMI
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
        )
      )}
    </>
  );
};

export default AvatarAsistente;
