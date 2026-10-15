import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';

const Splash: React.FC = () => {
  const history = useHistory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const navigatedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  const goToHome = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    clearAllTimers();

    const v = videoRef.current;
    if (v) { 
      try { v.pause(); v.style.display = 'none'; } catch (_) {}
    }
    
    history.replace('/home');
  };

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      const onPlaying = () => {
        setIsPlaying(true);
        // Auto-navigate after 10 seconds of playback
        const cutTimer = setTimeout(goToHome, 10000);
        timersRef.current.push(cutTimer);
      };

      video.addEventListener('playing', onPlaying);
      video.addEventListener('ended', goToHome);
      video.addEventListener('error', () => setVideoFailed(true));
      
      fetch('/assets/splash2.mp4')
        .then(res => res.blob())
        .then(blob => {
          if (!video || navigatedRef.current) return;
          video.src = URL.createObjectURL(blob);
          const p = video.play();
          if (p) p.catch(() => {});
        })
        .catch(() => {
          setVideoFailed(true);
        });

      return () => {
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('ended', goToHome);
        clearAllTimers();
      };
    }

    // Safety fallback: 12 seconds max
    const safetyTimer = setTimeout(goToHome, 12000);
    timersRef.current.push(safetyTimer);

    return () => {
      clearAllTimers();
    };
  }, [history]);

  // If video fails, quickly go home after brief title flash
  useEffect(() => {
    if (!videoFailed || navigatedRef.current) return;
    const t = setTimeout(goToHome, 2000);
    timersRef.current.push(t);
    return () => clearTimeout(t);
  }, [videoFailed]);

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          background: '#0a1628',
          position: 'relative',
        }}>
          {!videoFailed ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              // @ts-ignore
              webkit-playsinline="true"
              controls={false}
              preload="auto"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                pointerEvents: 'none',
                opacity: isPlaying ? 1 : 0,
                transition: 'opacity 0.2s ease',
              }}
            />
          ) : (
            // Fallback: CSS animation if video fails
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: 56, marginBottom: 24 }}>🐢</span>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: 6 }}>TAYRONA 3D</h1>
              <p style={{ color: '#69f0ae', letterSpacing: 3, fontSize: 12, marginTop: 8 }}>Explora la biodiversidad</p>
            </div>
          )}

          {/* Skip Button */}
          <button 
            onClick={goToHome}
            style={{
              position: 'absolute',
              bottom: '40px',
              padding: '12px 30px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '30px',
              color: 'white',
              fontWeight: 'bold',
              letterSpacing: '2px',
              backdropFilter: 'blur(10px)',
              zIndex: 100,
              cursor: 'pointer'
            }}
          >
            SALTAR
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Splash;
