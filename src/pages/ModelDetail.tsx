import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { modelsDatabase } from '../data/modelsData';
import { DownloadManager } from '../services/DownloadManager';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import AvatarAsistente from '../components/AvatarAsistente';
import guiones from '../data/guiones.json';

const ARLauncher = registerPlugin<any>('ARLauncher');

const ModelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const model = modelsDatabase.find(m => m.id === id);
  
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [localUri, setLocalUri] = useState<string>('');
  const [remoteUrl, setRemoteUrl] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeedText, setDownloadSpeedText] = useState("");
  
  // VR states & refs for synchronized stereoscopic Cardboard view
  const [isVRMode, setIsVRMode] = useState(false);
  const [vrEye1Mounted, setVrEye1Mounted] = useState(false);
  const [vrEye2Mounted, setVrEye2Mounted] = useState(false);
  const [vrLoaded, setVrLoaded] = useState(false);
  const vrEye1Ref = useRef<any>(null);
  const vrEye2Ref = useRef<any>(null);
  const vrAngleRef = useRef<number>(0);
  
  // Model controls
  const [modelScale, setModelScale] = useState('1 1 1');
  const [isLocked, setIsLocked] = useState(false);
  const [isPreparingAR, setIsPreparingAR] = useState(false);

  // Assistant states
  const [modelText, setModelText] = useState("");
  const [hasSpoken, setHasSpoken] = useState(false);

  // Exit VR cleanly and restore portrait orientation
  const exitVRMode = useCallback(async () => {
    setIsVRMode(false);
    if (Capacitor.isNativePlatform()) {
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
        setTimeout(() => {
          ScreenOrientation.unlock().catch(() => {});
        }, 500);
      } catch {
        ScreenOrientation.unlock().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    // Dynamic import to prevent WebGL crash on boot
    import('@google/model-viewer').catch(err => console.error("Model viewer load error", err));

    if (model) {
      DownloadManager.isModelDownloaded(model.androidModel).then((exists) => {
        if (exists) {
          setIsDownloaded(true);
          DownloadManager.getLocalModelURI(model.androidModel).then(setLocalUri);
        }
      });
      DownloadManager.getRemoteModelURL(model.androidModel).then((url) => {
        if (url) setRemoteUrl(url);
      }).catch(() => {});
    }
  }, [model]);

  useEffect(() => {
    if (isDownloaded && !hasSpoken && model) {
      setHasSpoken(true);
      setModelText((guiones.modelos as any)[model.id] || guiones.modelos.default);
    }
  }, [isDownloaded, hasSpoken, model]);

  // Handle VR Orientation
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      if (isVRMode) {
        ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => {});
      } else {
        ScreenOrientation.unlock().catch(() => {});
      }
    }
    return () => {
      if (Capacitor.isNativePlatform()) {
        ScreenOrientation.unlock().catch(() => {});
      }
    };
  }, [isVRMode]);

  // Handle Android Hardware Back Button to exit VR
  useEffect(() => {
    let backListener: any = null;
    if (Capacitor.isNativePlatform() && isVRMode) {
      App.addListener('backButton', () => {
        exitVRMode();
      }).then(l => {
        backListener = l;
      });
    }
    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, [isVRMode, exitVRMode]);

  // Keyboard Escape listener for web/emulator
  useEffect(() => {
    if (!isVRMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitVRMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVRMode, exitVRMode]);

  // Staged mounting for VR eyes and auto-dismiss loading text after 1 second
  useEffect(() => {
    if (isVRMode) {
      setVrLoaded(false);
      setVrEye1Mounted(false);
      setVrEye2Mounted(false);
      vrAngleRef.current = 0;

      const t1 = setTimeout(() => {
        setVrEye1Mounted(true);
      }, 100);

      const t2 = setTimeout(() => {
        setVrEye2Mounted(true);
      }, 300);

      // Dismiss loading overlay after 1 second so the 3D model appears cleanly
      const tDismiss = setTimeout(() => {
        setVrLoaded(true);
      }, 1000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(tDismiss);
      };
    } else {
      setVrEye1Mounted(false);
      setVrEye2Mounted(false);
      setVrLoaded(false);
    }
  }, [isVRMode]);

  // Synchronized stereoscopic rotation loop for Cardboard VR
  // Both eyes rotate in exact lockstep, with a precise 2.5° parallax disparity for real 3D depth
  useEffect(() => {
    if (!isVRMode) return;
    let animationFrameId: number;
    let lastTime = performance.now();
    const speedDegPerSec = 20; // 20 degrees per second smooth rotation
    const ipdOffset = 2.5; // Stereoscopic disparity angle

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      vrAngleRef.current = (vrAngleRef.current + speedDegPerSec * delta) % 360;

      const baseAngle = vrAngleRef.current;
      const leftOrbit = `${baseAngle - ipdOffset / 2}deg 75deg 105%`;
      const rightOrbit = `${baseAngle + ipdOffset / 2}deg 75deg 105%`;

      if (vrEye1Ref.current) {
        try {
          vrEye1Ref.current.cameraOrbit = leftOrbit;
          if (typeof vrEye1Ref.current.jumpCameraToGoal === 'function') {
            vrEye1Ref.current.jumpCameraToGoal();
          }
        } catch (_) {}
      }

      if (vrEye2Ref.current) {
        try {
          vrEye2Ref.current.cameraOrbit = rightOrbit;
          if (typeof vrEye2Ref.current.jumpCameraToGoal === 'function') {
            vrEye2Ref.current.jumpCameraToGoal();
          }
        } catch (_) {}
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVRMode]);

  const handleDownload = async () => {
    if (!model) return;
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      setDownloadSpeedText("Iniciando...");

      let lastBytes = 0;
      let lastTime = Date.now();

      const uri = await DownloadManager.downloadModel(model.androidModel, (bytes, total) => {
        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000;
        if (timeDiff >= 0.5) {
          const bytesDiff = bytes - lastBytes;
          const speedBps = bytesDiff / timeDiff;
          let speedText = "";
          if (speedBps > 1024 * 1024) {
            speedText = (speedBps / (1024 * 1024)).toFixed(1) + " MB/s";
          } else {
            speedText = (speedBps / 1024).toFixed(0) + " KB/s";
          }
          setDownloadSpeedText(speedText);
          lastBytes = bytes;
          lastTime = now;
        }
        if (total > 0) {
          setDownloadProgress(bytes / total);
        }
      });
      setLocalUri(uri);
      setIsDownloaded(true);
      // En iOS, también descargar el .usdz en segundo plano para AR offline
      if (Capacitor.getPlatform() === 'ios' && model.iosModel) {
        DownloadManager.downloadIOSModel(model.iosModel)
          .catch(err => console.error('Error descargando .usdz en segundo plano:', err));
      }
    } catch (e: any) {
      console.error("Fallo al descargar", e);
      alert("Error al descargar el modelo: " + (e.message || "Revisa tu conexión"));
    } finally {
      setIsDownloading(false);
      setDownloadSpeedText("");
    }
  };

  // AR handler: uses local files for offline support
  // Android: model-viewer.activateAR() uses the .glb already loaded in memory
  // iOS: local .usdz file via capacitor://localhost/... (URL ends in .usdz → Apple always recognizes it)
  const handleAR = async () => {
    if (!localUri || !model) return;
    
    if (Capacitor.getPlatform() === 'ios') {
      if (model.iosModel) {
        try {
          if (Capacitor.isNativePlatform()) {
            // First verify the .usdz is actually downloaded
            const usdzExists = await DownloadManager.isIOSModelDownloaded(model.iosModel);
            let usdzUri: string;
            
            if (!usdzExists) {
              // Download the .usdz first — show feedback to user
              setIsPreparingAR(true);
              try {
                await DownloadManager.downloadIOSModel(model.iosModel);
              } finally {
                setIsPreparingAR(false);
              }
            }
            
            // Get the raw file:// URI for the native plugin
            usdzUri = await DownloadManager.getRawIOSModelURI(model.iosModel);
            
            if (!usdzUri) {
              alert("No se pudo obtener la ruta del modelo AR. Intenta descargarlo nuevamente.");
              return;
            }
            
            await ARLauncher.openAR({ fileUri: usdzUri });
          } else {
            // Web fallback for iOS
            let usdzUri = await DownloadManager.getLocalIOSModelURI(model.iosModel);
            if (!usdzUri) usdzUri = await DownloadManager.downloadIOSModel(model.iosModel);
            const a = document.createElement('a');
            a.setAttribute('rel', 'ar');
            a.href = usdzUri;
            a.appendChild(document.createElement('img')); 
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } catch (e: any) {
          console.error("Error abriendo AR en iOS", e);
          alert(e.message || "Error al abrir AR en iOS.");
        }
      } else {
        alert("Modelo AR no disponible para iOS.");
      }
    } else if (Capacitor.getPlatform() === 'android' || Capacitor.isNativePlatform()) {
      try {
        if (Capacitor.isNativePlatform()) {
          setIsPreparingAR(true);
          let rUrl = '';
          try {
            rUrl = await DownloadManager.getRemoteModelURL(model.androidModel);
          } catch (err) {
            console.warn("No se pudo obtener URL remota, usando archivo local:", err);
          } finally {
            setIsPreparingAR(false);
          }

          // Usar el plugin nativo que abre Google Scene Viewer con máxima calidad y escala
          await ARLauncher.openAR({ 
            fileName: model.androidModel,
            fileUrl: rUrl,
            title: model.title 
          });
        } else {
          // Web fallback
          const viewer = document.getElementById('main-viewer') as any;
          if (viewer && viewer.activateAR) {
            await viewer.activateAR();
          }
        }
      } catch (e: any) {
        console.error("No se pudo abrir AR", e);
        alert(e.message || "Error al abrir AR en Android.");
      } finally {
        setIsPreparingAR(false);
      }
    }
  };

  if (!model) return <IonPage><IonContent>No encontrado</IonContent></IonPage>;

  const modelSource = localUri || remoteUrl;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#0a1628' } as any}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" color="light" text="" />
          </IonButtons>
          <IonTitle className="text-liquid-light">{model.title}</IonTitle>
          <IonButtons slot="end">
            <button 
              onClick={() => setModelText((guiones.modelos as any)[model.id] || guiones.modelos.default)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <img 
                src="/assets/icons/icon-simi.webp" 
                alt="SIMI" 
                style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #69f0ae', boxShadow: '0 0 10px rgba(105, 240, 174, 0.5)' }} 
              />
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#0a1628' } as any} fullscreen>
        <AvatarAsistente 
          textoGuion={modelText} 
          audioUrl={`/assets/audio/simi/simi_${model.id}.mp3.mp3`}
          onSpeakEnd={() => setModelText("")}
          onSkip={() => setModelText("")}
          noOverlay={true}
          hiddenIfInactive={true}
        />

        <div style={{ padding: 16 }}>
          {/* 3D Viewer Card */}
          <div className="glass-card" style={{ 
            minHeight: 320, 
            marginBottom: 24, 
            borderRadius: 24, 
            overflow: 'hidden', 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!isDownloaded && !isDownloading && (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <p style={{ color: '#c8d6e5', marginBottom: 16, fontSize: 15 }}>
                  El modelo 3D requiere ser descargado (Aprox 15MB)
                </p>
                <button 
                  onClick={handleDownload}
                  style={{
                    background: '#69f0ae',
                    color: '#0a1628',
                    fontWeight: 'bold',
                    padding: '12px 24px',
                    borderRadius: 12,
                    border: 'none',
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(105,240,174,0.3)'
                  }}
                >
                  Descargar Modelo 3D
                </button>
              </div>
            )}
            
            {isDownloading && (
              <div style={{ textAlign: 'center', padding: 24, width: '100%', maxWidth: 280 }}>
                <p style={{ color: '#69f0ae', fontWeight: 'bold', marginBottom: 8 }}>Descargando...</p>
                <div style={{ 
                  width: '100%', 
                  background: 'rgba(0,0,0,0.3)', 
                  borderRadius: 99, 
                  height: 16, 
                  marginBottom: 8,
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    background: '#69f0ae', 
                    height: '100%', 
                    borderRadius: 99,
                    width: `${Math.round(downloadProgress * 100)}%`,
                    transition: 'width 0.3s ease-out'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c8d6e5', fontSize: 13 }}>
                  <span>{Math.round(downloadProgress * 100)}%</span>
                  <span>{downloadSpeedText}</span>
                </div>
              </div>
            )}

            {isDownloaded && modelSource ? (
              <>
                <model-viewer 
                  id="main-viewer"
                  src={modelSource} 
                  camera-controls={!isLocked}
                  auto-rotate={!isLocked}
                  scale={modelScale}
                  ar
                  ar-modes="scene-viewer webxr quick-look"
                  shadow-intensity="1" 
                  exposure="1.1"
                  environment-image="neutral"
                  style={{ width: '100%', height: '100%', minHeight: 300, display: isVRMode ? 'none' : 'block' }}
                />

                {/* Left Controls */}
                <div style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  zIndex: 10
                }}>
                  <button 
                    onClick={() => {
                      const viewer = document.getElementById('main-viewer') as any;
                      if (viewer && viewer.cameraTarget) {
                        viewer.cameraTarget = 'auto auto auto';
                        viewer.cameraOrbit = '0deg 75deg 105%';
                      }
                      setModelScale('1 1 1');
                    }}
                    style={{ background: 'rgba(105,240,174,0.8)', color: '#000', padding: '6px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}
                  >
                    Centrar
                  </button>
                  <button 
                    onClick={() => setModelScale('1 1 1')}
                    style={{ background: 'rgba(255,255,255,0.8)', color: '#000', padding: '6px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}
                  >
                    Tamaño Flex
                  </button>
                  <button 
                    onClick={() => setModelScale('2 2 2')}
                    style={{ background: 'rgba(255,255,255,0.8)', color: '#000', padding: '6px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}
                  >
                    Tamaño Real
                  </button>
                  <button 
                    onClick={() => setIsLocked(!isLocked)}
                    style={{ background: isLocked ? 'rgba(255,0,0,0.8)' : 'rgba(0,150,255,0.8)', color: '#fff', padding: '6px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}
                  >
                    {isLocked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                </div>

                {/* Bottom Button row */}
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  zIndex: 10
                }}>
                  {/* VR button */}
                  <button 
                    onClick={() => setIsVRMode(true)}
                    style={{
                      background: '#7c3aed',
                      color: '#fff',
                      fontWeight: 'bold',
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 12,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    🥽 VR
                  </button>

                  {/* AR button */}
                  <button 
                    onClick={handleAR}
                    style={{
                      background: '#69f0ae',
                      color: '#0a1628',
                      fontWeight: 'bold',
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 12,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(105,240,174,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    disabled={isPreparingAR}
                  >
                    {isPreparingAR ? '⏳ Preparando...' : '🌿 AR Nativo'}
                  </button>
                </div>
              </>
            ) : null}
          </div>

          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 16,
              transition: 'all 0.3s ease',
              filter: modelText ? 'blur(4px)' : 'none',
              opacity: modelText ? 0.4 : 1,
              pointerEvents: modelText ? 'none' : 'auto'
            }}
          >
            <div className="glass-panel" style={{ borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 'bold', color: '#69f0ae', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📖</span> ¿Quién es?
              </h3>
              <p style={{ fontSize: 14, color: '#b0bec5', lineHeight: 1.6 }}>{model.description}</p>
            </div>

            {model.funFact && (
              <div className="glass-panel" style={{ borderRadius: 16, padding: 20, borderColor: 'rgba(105,240,174,0.15)' }}>
                <h3 style={{ fontSize: 17, fontWeight: 'bold', color: '#69f0ae', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎲</span> Dato Curioso
                </h3>
                <p style={{ fontSize: 14, color: '#b0bec5', lineHeight: 1.6 }}>{model.funFact}</p>
              </div>
            )}

            {model.location && (
              <div className="glass-panel" style={{ borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 'bold', color: '#69f0ae', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📍</span> Ubicación
                </h3>
                <p style={{ fontSize: 14, color: '#b0bec5', lineHeight: 1.6 }}>{model.location}</p>
              </div>
            )}
          </div>
          
        </div>
      </IonContent>

      {/* VR Mode: Fullscreen split-screen overlay for cardboard glasses */}
      {isVRMode && modelSource && (
        <div
          id="vr-fullscreen-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000000',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
            touchAction: 'none'
          }}
        >
          {/* Center Bottom Tap Pill to Exit (unobtrusive, no top buttons) */}
          <div
            onClick={(e) => { e.stopPropagation(); exitVRMode(); }}
            onTouchEnd={(e) => { e.stopPropagation(); exitVRMode(); }}
            style={{
              position: 'fixed',
              bottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000000,
              background: 'rgba(0, 0, 0, 0.65)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '6px 18px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'auto'
            }}
          >
            Tocar para salir de aquí
          </div>

          {/* Loading indicator while model compiles in VR */}
          {!vrLoaded && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.85)',
                zIndex: 999998,
                pointerEvents: 'none',
                gap: '12px'
              }}
            >
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  border: '3px solid rgba(105, 240, 174, 0.2)',
                  borderTop: '3px solid #69f0ae',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <p style={{ color: '#69f0ae', fontSize: '15px', fontWeight: 'bold', margin: 0 }}>
                Iniciando modo Cardboard VR...
              </p>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                Inserta tu teléfono en el visor
              </p>
            </div>
          )}

          {/* Center Divider Line for Cardboard separator */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: '2px',
              background: 'rgba(255, 255, 255, 0.25)',
              zIndex: 50,
              transform: 'translateX(-50%)',
              pointerEvents: 'none'
            }}
          />

          {/* Left Eye Viewport */}
          <div
            style={{
              width: '50vw',
              height: '100vh',
              position: 'relative',
              overflow: 'hidden',
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Center Focus Dot */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.4)',
                zIndex: 40,
                pointerEvents: 'none'
              }}
            />

            {vrEye1Mounted && (
              <model-viewer
                ref={vrEye1Ref}
                src={modelSource}
                camera-orbit="-1.25deg 75deg 105%"
                camera-target="auto auto auto"
                field-of-view="auto"
                scale={modelScale || '1 1 1'}
                shadow-intensity="1"
                exposure="1.2"
                onError={(err: any) => console.warn('Left eye load error:', err)}
                style={{
                  width: '100%',
                  height: '100%',
                  minWidth: '200px',
                  minHeight: '200px',
                  background: '#000'
                }}
              />
            )}
          </div>

          {/* Right Eye Viewport */}
          <div
            style={{
              width: '50vw',
              height: '100vh',
              position: 'relative',
              overflow: 'hidden',
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Center Focus Dot */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.4)',
                zIndex: 40,
                pointerEvents: 'none'
              }}
            />

            {vrEye2Mounted && (
              <model-viewer
                ref={vrEye2Ref}
                src={modelSource}
                camera-orbit="1.25deg 75deg 105%"
                camera-target="auto auto auto"
                field-of-view="auto"
                scale={modelScale || '1 1 1'}
                shadow-intensity="1"
                exposure="1.2"
                onError={(err: any) => console.warn('Right eye load error:', err)}
                style={{
                  width: '100%',
                  height: '100%',
                  minWidth: '200px',
                  minHeight: '200px',
                  background: '#000'
                }}
              />
            )}
          </div>
        </div>
      )}
    </IonPage>
  );
};

export default ModelDetail;
