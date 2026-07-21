import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const Home: React.FC = () => {
  const history = useHistory();

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
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
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
