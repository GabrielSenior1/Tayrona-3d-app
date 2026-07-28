const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: "AIzaSyDPAd4dnsVp-tTJS4hZ804X0FVWHicHA2I",
  authDomain: "tayrona-3d.firebaseapp.com",
  projectId: "tayrona-3d",
  storageBucket: "tayrona-3d.firebasestorage.app",
  messagingSenderId: "250450923190",
  appId: "1:250450923190:web:a27cbd3e0a37ef76ece017"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const modelsDir = path.join(__dirname, '../iOS_models');

async function uploadFiles() {
  if (!fs.existsSync(modelsDir)) {
    console.log('Carpeta iOS_models no encontrada en ' + modelsDir);
    return;
  }

  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.usdz'));
  console.log(`Encontrados ${files.length} archivos USDZ para subir...`);

  for (const file of files) {
    const filePath = path.join(modelsDir, file);
    const buffer = fs.readFileSync(filePath);
    
    const arrayBuffer = new Uint8Array(buffer).buffer;
    
    const storageRef = ref(storage, file);
    try {
      console.log(`Subiendo ${file}... (${Math.round(buffer.length / 1024 / 1024)} MB)`);
      await uploadBytes(storageRef, arrayBuffer, { contentType: 'model/vnd.usdz+zip' });
      console.log(`✅ ${file} subido con éxito.`);
    } catch (e) {
      console.error(`❌ Error subiendo ${file}:`, e.message);
      break; 
    }
  }
  console.log('Proceso finalizado.');
}

uploadFiles();
