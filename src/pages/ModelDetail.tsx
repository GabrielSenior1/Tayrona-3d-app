import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { modelsDatabase } from '../data/modelsData';
import { DownloadManager } from '../services/DownloadManager';
import { Capacitor, registerPlugin } from '@capacitor/core';
const ARLauncher = registerPlugin<any>('ARLauncher');
import { ScreenOrientation } from '@capacitor/screen-orientation';
const ModelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const model = modelsDatabase.find(m => m.id === id);
  
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [localUri, setLocalUri] = useState<string>('');
  const [iosLocalUri, setIosLocalUri] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeedText, setDownloadSpeedText] = useState("");
  const [isVRMode, setIsVRMode] = useState(false);

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
      if (Capacitor.getPlatform() === 'ios' && model.iosModel) {
        DownloadManager.isIOSModelDownloaded(model.iosModel).then((exists) => {
          if (exists) {
            DownloadManager.getLocalIOSModelURI(model.iosModel).then(setIosLocalUri);
          }
        });
      }
    }
  }, [model]);

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
          .then(setIosLocalUri)
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

  // AR handler: uses local files for offline support
  // Android: model-viewer.activateAR() uses the .glb already loaded in memory
  // iOS: local .usdz file via capacitor://localhost/... (URL ends in .usdz → Apple always recognizes it)
  const handleAR = async () => {
    if (!localUri || !model) return;
    
    if (Capacitor.getPlatform() === 'ios') {
      if (model.iosModel) {
        try {
          // Intentar obtener la ruta local del .usdz
          let usdzUri = await DownloadManager.getLocalIOSModelURI(model.iosModel);
          
          if (!usdzUri) {
            // Si no está descargado, descargarlo ahora (requiere internet solo esta vez)
            usdzUri = await DownloadManager.downloadIOSModel(model.iosModel);
          }
          
          // Crear enlace con rel="ar" usando la ruta local
          // La URL termina en .usdz → Apple siempre abre AR Quick Look
          const a = document.createElement('a');
          a.setAttribute('rel', 'ar');
          a.href = usdzUri;
          // Apple requiere que haya un hijo (como una imagen) en el enlace para que Quick Look funcione
          a.appendChild(document.createElement('img')); 
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
        } catch (e: any) {
          console.error("Error abriendo AR en iOS", e);
          alert("Error al abrir AR: " + (e.message || "Verifica tu conexión para la primera descarga"));
        }
      } else {
        alert("Modelo AR no disponible para iOS.");
      }
    } else if (Capacitor.getPlatform() === 'android' || Capacitor.isNativePlatform()) {
      try {
        if (Capacitor.isNativePlatform()) {
          // Usar el plugin nativo que provee un FileProvider URI para offline AR
          await ARLauncher.openAR({ fileName: model.androidModel });
        } else {
          // Web fallback
          const viewer = document.getElementById('main-viewer') as any;
          if (viewer && viewer.activateAR) {
            await viewer.activateAR();
          }
        }
      } catch (e: any) {
        console.error("No se pudo abrir AR", e);
        alert(e.message || "Error al abrir AR. Verifica que tu dispositivo soporte ARCore.");
      }
    }
  };

  if (!model) return <IonPage><IonContent>No encontrado</IonContent></IonPage>;

  // VR Mode: split screen for cardboard glasses
  if (isVRMode && isDownloaded && localUri) {
    return (
      <IonPage>
        <IonContent className="ion-no-padding" fullscreen scrollY={false}>
          <div 
            style={{ 
              display: 'flex', 
              width: '100vw', 
              height: '100vh', 
              backgroundColor: '#000',
              position: 'relative'
            }}
          >
            {/* Exit hint */}
            <div style={{
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 50,
              color: 'rgba(255,255,255,0.5)',
              fontSize: 11,
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(0,0,0,0.4)'
            }}
              onClick={() => setIsVRMode(false)}
            >
              ✕ Salir de VR
            </div>

            {/* Center divider line */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: 2,
              background: 'rgba(255,255,255,0.15)',
              zIndex: 10
            }}></div>

            {/* Left eye */}
            <div style={{ 
              width: '50%', 
              height: '100%', 
              overflow: 'hidden',
              borderRadius: '50% 20% 20% 50% / 50% 20% 20% 50%',
              margin: '10px 5px 10px 10px',
              border: '2px solid rgba(255,255,255,0.1)',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
            }}>
              {/* @ts-ignore */}
              <model-viewer 
                src={localUri} 
                auto-rotate 
                rotation-per-second="20deg"
                shadow-intensity="0.8"
                exposure="1.2"
                environment-image="neutral"
                style={{ width: '100%', height: '100%', background: '#000', transform: 'scale(1.1)' }}
              ></model-viewer>
            </div>

            {/* Right eye */}
            <div style={{ 
              width: '50%', 
              height: '100%', 
              overflow: 'hidden',
              borderRadius: '20% 50% 50% 20% / 20% 50% 50% 20%',
              margin: '10px 10px 10px 5px',
              border: '2px solid rgba(255,255,255,0.1)',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
            }}>
              {/* @ts-ignore */}
              <model-viewer 
                src={localUri} 
                auto-rotate 
                rotation-per-second="20deg"
                shadow-intensity="0.8"
                exposure="1.2"
                environment-image="neutral"
                style={{ width: '100%', height: '100%', background: '#000', transform: 'scale(1.1)' }}
              ></model-viewer>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#0a1628' } as any}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" color="light" text="" />
          </IonButtons>
          <IonTitle className="text-liquid-light">{model.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ '--background': '#0a1628' } as any} fullscreen>
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

            {isDownloaded && localUri ? (
              <>
                {/* @ts-ignore */}
                <model-viewer 
                  id="main-viewer"
                  src={localUri} 
                  camera-controls 
                  auto-rotate 
                  ar
                  shadow-intensity="1" 
                  exposure="1.1"
                  environment-image="neutral"
                  style={{ width: '100%', height: '100%', minHeight: 300 }}
                ></model-viewer>

                {/* AR button */}
                {Capacitor.getPlatform() === 'ios' ? (
                  <a 
                    rel="ar" 
                    href={iosLocalUri || '#'} 
                    onClick={(e) => { 
                      if (!iosLocalUri) { 
                        e.preventDefault(); 
                        alert("El modelo de AR se está descargando o preparando, por favor espera un momento."); 
                      } 
                    }}
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      background: '#69f0ae',
                      color: '#0a1628',
                      fontWeight: 'bold',
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(105,240,174,0.3)',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      textDecoration: 'none'
                    }}
                  >
                    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style={{display: 'none'}} />
                    🌿 Mostrar en AR
                  </a>
                ) : (
                  <button 
                    onClick={handleAR}
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      background: '#69f0ae',
                      color: '#0a1628',
                      fontWeight: 'bold',
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(105,240,174,0.3)',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    🌿 Mostrar en AR
                  </button>
                )}

                {/* VR button */}
                <button 
                  onClick={() => setIsVRMode(true)}
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    background: '#7c3aed',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: 'none',
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  🥽 Ver en VR
                </button>
              </>
            ) : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
    </IonPage>
  );
};

export default ModelDetail;
