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

const modelsDir = path.join(__dirname, '../android_models');

async function uploadFiles() {
  if (!fs.existsSync(modelsDir)) {
    console.log('Carpeta android_models no encontrada.');
    return;
  }

  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.glb'));
  console.log(`Encontrados ${files.length} archivos para subir...`);

  for (const file of files) {
    const filePath = path.join(modelsDir, file);
    const buffer = fs.readFileSync(filePath);
    
    // Create a Blob-like object for the Web SDK in Node
    const arrayBuffer = new Uint8Array(buffer).buffer;
    
    const storageRef = ref(storage, file);
    try {
      console.log(`Subiendo ${file}...`);
      await uploadBytes(storageRef, arrayBuffer, { contentType: 'model/gltf-binary' });
      console.log(`✅ ${file} subido con éxito.`);
    } catch (e) {
      console.error(`❌ Error subiendo ${file}:`, e.message);
      break; // Detener si hay error (probablemente por reglas de seguridad)
    }
  }
  console.log('Proceso finalizado.');
}

uploadFiles();
