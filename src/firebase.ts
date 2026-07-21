import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPAd4dnsVp-tTJS4hZ804X0FVWHicHA2I",
  authDomain: "tayrona-3d.firebaseapp.com",
  projectId: "tayrona-3d",
  storageBucket: "tayrona-3d.firebasestorage.app",
  messagingSenderId: "250450923190",
  appId: "1:250450923190:web:a27cbd3e0a37ef76ece017"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
