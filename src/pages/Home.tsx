import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { modelsDatabase } from '../data/modelsData';
import { DownloadManager } from '../services/DownloadManager';
import { Capacitor } from '@capacitor/core';

const Home: React.FC = () => {
  const history = useHistory();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, modelName: '' });
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [totalModels] = useState(modelsDatabase.length);

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
                onClick={() => showDownloadModal ? setShowDownloadModal(false) : setShowDownloadModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#c8d6e5',
                  fontSize: 22,
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
              >
                ⋮
              </button>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        {/* Download all modal/dropdown */}
        {showDownloadModal && (
          <div style={{
            position: 'fixed',
            top: 56,
            right: 12,
            zIndex: 999,
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

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">Explora la</h1>
          <h1 className="text-3xl font-bold text-liquid-primary mb-8">Biodiversidad</h1>
          
          <div className="flex flex-col gap-6">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => history.push(`/category/${cat.id}`)}
                className="glass-card p-5 relative overflow-hidden active:scale-95 transition-transform duration-200"
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
