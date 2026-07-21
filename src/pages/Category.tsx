import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { modelsDatabase } from '../data/modelsData';

const Category: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  // Filtramos la base de datos por categoría
  const models = modelsDatabase.filter(m => m.category === id);

  const getTitle = () => {
    if (id === 'Mar') return 'Vida Marina';
    if (id === 'Mangle') return 'Manglares';
    return 'Vida Terrestre';
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'transparent' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" color="light" text="" />
          </IonButtons>
          <IonTitle className="text-liquid-primary font-bold">{getTitle()}</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div className="p-4 pb-12">
          <div className="grid grid-cols-2 gap-4">
            {models.map(model => (
              <div 
                key={model.id}
                onClick={() => history.push(`/model/${model.id}`)}
                className="glass-card flex flex-col items-center justify-center p-4 active:scale-95 transition-transform duration-200"
              >
                {/* Fallback Icon for visual representation */}
                <div className="w-16 h-16 rounded-full bg-liquid-dark border border-liquid-primary/30 flex items-center justify-center mb-3 shadow-liquid">
                  <span className="text-2xl">{id === 'Mar' ? '🐟' : id === 'Mangle' ? '🌱' : '🦎'}</span>
                </div>
                <h3 className="text-center font-semibold text-sm text-white line-clamp-2 leading-tight">
                  {model.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Category;
