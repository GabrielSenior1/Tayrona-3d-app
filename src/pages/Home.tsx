import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { modelsDatabase } from '../data/modelsData';
import { DownloadManager } from '../services/DownloadManager';
import { Capacitor } from '@capacitor/core';
import AvatarAsistente from '../components/AvatarAsistente';
import guiones from '../data/guiones.json';

const Home: React.FC = () => {
  const history = useHistory();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, modelName: '' });
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [totalModels] = useState(modelsDatabase.length);
  const [tourStep, setTourStep] = useState(0);

  const tourTexts = [
    "",
    "Hola, soy SIMI y hago parte del semillero de investigación de modelado e impresión 3D de la Universidad del Magdalena.",
    "Aquí te muestro las opciones que tenemos para explorar la biodiversidad del Parque Tayrona en 3D.",
    "Desde la vida marina, con peces y reptiles acuáticos...",
    "Pasando por los manglares, la sala cuna del océano...",
    "Y la vida terrestre, con habitantes de la selva.",
    "Para poder ver los modelos, primero tienes que descargarlos presionando este botón superior. ¡Empecemos!"
  ];

  const handleAvatarClick = () => {
    if (tourStep === 0) setTourStep(1);
    else setTourStep(0);
  };

  const handleSpeakEnd = () => {
    if (tourStep > 0 && tourStep < tourTexts.length - 1) {
      setTourStep(prev => prev + 1);
    } else if (tourStep === tourTexts.length - 1) {
      setTimeout(() => setTourStep(0), 4000);
    }
  };

  const stopTour = () => {
    if (tourStep !== 0) setTourStep(0);
  };

  // Check how many models are already downloaded
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      checkDownloadedModels();
    }
  }, []);

  const checkDownloadedModels = async () => {
    let count = 0;
    for (const model of modelsDatabase) {
      const exists = await DownloadManager.isModelDownloaded(model.androidModel);
      if (exists) count++;
    }
    setDownloadedCount(count);
  };

  const handleDownloadAll = async () => {
    if (isDownloadingAll) return;
    setIsDownloadingAll(true);
    setShowDownloadModal(true);

    const platform = Capacitor.getPlatform();
    let completed = 0;

    for (const model of modelsDatabase) {
      // Skip if already downloaded
      const exists = await DownloadManager.isModelDownloaded(model.androidModel);
      if (exists) {
        completed++;
        setDownloadProgress({ current: completed, total: totalModels, modelName: model.title });
        continue;
      }

      setDownloadProgress({ current: completed, total: totalModels, modelName: model.title });

      try {
        await DownloadManager.downloadModel(model.androidModel);
        // Also download iOS model if on iOS
        if (platform === 'ios' && model.iosModel) {
          await DownloadManager.downloadIOSModel(model.iosModel).catch(() => {});
        }
      } catch (e: any) {
        console.error(`Error descargando ${model.title}:`, e);
      }

      completed++;
      setDownloadProgress({ current: completed, total: totalModels, modelName: '' });
    }

    setDownloadedCount(totalModels);
    setIsDownloadingAll(false);

    // Auto close after 1.5s
    setTimeout(() => setShowDownloadModal(false), 1500);
  };

  const categories = [
    { id: 'Mar', title: 'Vida Marina', icon: '🐠', desc: 'Peces, crustáceos y reptiles acuáticos', color: 'from-blue-500 to-cyan-400' },
    { id: 'Mangle', title: 'Manglares', icon: '🌿', desc: 'La sala cuna del océano', color: 'from-green-500 to-emerald-400' },
    { id: 'Terrestre', title: 'Vida Terrestre', icon: '🐆', desc: 'Habitantes de la selva y costa', color: 'from-amber-500 to-orange-400' },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'transparent' }}>
          <IonTitle className="text-liquid-primary font-bold">Tayrona 3D</IonTitle>
          <IonButtons slot="end">
            {Capacitor.isNativePlatform() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showDownloadModal ? setShowDownloadModal(false) : setShowDownloadModal(true);
                }}
                className={tourStep === 6 ? "animate-pulse" : ""}
                style={{
                  background: tourStep === 6 ? 'rgba(105, 240, 174, 0.15)' : 'transparent',
                  border: tourStep === 6 ? '2px solid #69f0ae' : 'none',
                  borderRadius: '50%',
                  color: tourStep === 6 ? '#69f0ae' : '#c8d6e5',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: tourStep === 6 ? '0 0 25px rgba(105, 240, 174, 0.8)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      {/* Download all modal/dropdown */}
      {showDownloadModal && (
        <div style={{
          position: 'fixed',
          top: 60,
          right: 12,
          zIndex: 99999,
            background: 'rgba(15, 30, 55, 0.98)',
            border: '1px solid rgba(105, 240, 174, 0.15)',
            borderRadius: 16,
            padding: 16,
            width: 280,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            {!isDownloadingAll ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>📦</span>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Descargar Modelos</span>
                </div>
                <p style={{ color: '#8899aa', fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
                  Descarga todos los modelos 3D para verlos sin conexión a internet.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#69f0ae', fontSize: 13 }}>
                    {downloadedCount}/{totalModels} descargados
                  </span>
                  {downloadedCount >= totalModels && (
                    <span style={{ color: '#69f0ae', fontSize: 12 }}>✅ Completo</span>
                  )}
                </div>
                {downloadedCount < totalModels && (
                  <button
                    onClick={handleDownloadAll}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #69f0ae, #00e676)',
                      color: '#0a1628',
                      fontWeight: 'bold',
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 14,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(105,240,174,0.2)'
                    }}
                  >
                    ⬇ Descargar Todo ({totalModels - downloadedCount} restantes)
                  </button>
                )}
                <button
                  onClick={() => setShowDownloadModal(false)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: '#8899aa',
                    border: 'none',
                    fontSize: 13,
                    padding: '8px 0',
                    marginTop: 4,
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>⏳</span>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Descargando...</span>
                </div>
                <p style={{ color: '#69f0ae', fontSize: 13, marginBottom: 8 }}>
                  {downloadProgress.modelName || 'Preparando...'}
                </p>
                <div style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 99,
                  height: 12,
                  marginBottom: 8,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #69f0ae, #00e676)',
                    height: '100%',
                    borderRadius: 99,
                    width: `${totalModels > 0 ? Math.round((downloadProgress.current / totalModels) * 100) : 0}%`,
                    transition: 'width 0.5s ease-out'
                  }}></div>
                </div>
                <span style={{ color: '#c8d6e5', fontSize: 12 }}>
                  {downloadProgress.current}/{totalModels} modelos
                </span>
              </>
            )}
          </div>
        )}

      <IonContent fullscreen onClick={stopTour}>
        <AvatarAsistente 
          textoGuion={tourTexts[tourStep]} 
          onSpeakEnd={handleSpeakEnd} 
          onAvatarClick={handleAvatarClick} 
        />

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">Explora la</h1>
          <h1 className="text-3xl font-bold text-liquid-primary mb-8">Biodiversidad</h1>
          
          <div className="flex flex-col gap-6">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                onClick={(e) => { e.stopPropagation(); history.push(`/category/${cat.id}`); }}
                className={`glass-card p-5 relative overflow-hidden active:scale-95 transition-all duration-300 ${
                  (tourStep === 3 && cat.id === 'Mar') || 
                  (tourStep === 4 && cat.id === 'Mangle') || 
                  (tourStep === 5 && cat.id === 'Terrestre') 
                    ? 'border-2 border-[#69f0ae] shadow-[0_0_25px_rgba(105,240,174,0.6)] animate-pulse' 
                    : 'border border-[rgba(255,255,255,0.2)]'
                }`}
              >
                {/* Decorative blob */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${cat.color} opacity-20 blur-xl`}></div>
                
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 flex items-center justify-center text-3xl rounded-2xl bg-gradient-to-br ${cat.color} bg-opacity-20 shadow-lg`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{cat.title}</h2>
                    <p className="text-sm text-liquid-muted mt-1">{cat.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
