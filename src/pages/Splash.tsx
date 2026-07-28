import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';

const Splash: React.FC = () => {
  const history = useHistory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let navigated = false;

    const goToHome = () => {
      if (navigated) return;
      navigated = true;
      // Hide video instantly to prevent native play button flash
      const v = videoRef.current;
      if (v) { v.style.display = 'none'; }
      
      // Fallback redirect if router fails
      history.replace('/home');
      setTimeout(() => {
        if (window.location.pathname !== '/home') {
          window.location.replace('/home');
        }
      }, 1000);
    };

    let playCheck: ReturnType<typeof setTimeout>;
    let progressCheck: ReturnType<typeof setInterval>;
    let lastTime = -1;

    const video = videoRef.current;
    if (video) {
      video.addEventListener('playing', () => {
        setIsPlaying(true);
        clearTimeout(playCheck); // Stop fallback if it actually plays
        
        // Verify the video is actually progressing (not stuck)
        progressCheck = setInterval(() => {
          lastTime = video.currentTime;
        }, 3000);
      });
      video.addEventListener('ended', goToHome);
      video.addEventListener('error', () => setVideoFailed(true));
      
      // Try to play. On iOS WKWebView, autoplay may be blocked.
      // Don't immediately give up — the 'playing' event is the real indicator.
      const p = video.play();
      if (p) p.catch(() => {
        // play() was blocked, but don't set videoFailed yet.
        // The playCheck timeout will handle it if the video truly can't play.
        console.log('video.play() promise rejected — waiting for playCheck timeout');
      });
    }

    // If playing doesn't fire in 3s, force fallback
    playCheck = setTimeout(() => {
      setVideoFailed(true);
    }, 3000);

    // Absolute safety: go home after 13s (video is ~10s long)
    const safety = setTimeout(goToHome, 13000);

    return () => {
      if (video) {
        video.removeEventListener('ended', goToHome);
      }
      clearTimeout(playCheck);
      clearTimeout(safety);
      clearInterval(progressCheck);
    };
  }, [history]);

  // If video fails, use fallback with timer
  useEffect(() => {
    if (!videoFailed) return;
    const t = setTimeout(() => {
      history.replace('/home');
      setTimeout(() => {
        if (window.location.pathname !== '/home') {
          window.location.replace('/home');
        }
      }, 1000);
    }, 2500);
    return () => clearTimeout(t);
  }, [videoFailed, history]);

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
              src="/assets/splash.mp4"
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
                objectFit: 'cover',
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

          {/* Absolute failsafe Skip Button */}
          <button 
            onClick={() => {
              history.replace('/home');
              setTimeout(() => {
                if (window.location.pathname !== '/home') {
                  window.location.replace('/home');
                }
              }, 500);
            }}
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
