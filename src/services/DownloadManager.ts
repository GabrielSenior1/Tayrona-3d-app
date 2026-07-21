import { storage } from '../firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { CapacitorHttp } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

export class DownloadManager {
  /**
   * Verifica si un modelo ya está descargado localmente
   */
  static async isModelDownloaded(fileName: string): Promise<boolean> {
    if (Capacitor.getPlatform() === 'web') return false; // En web no simulamos el filesystem nativo

    try {
      const stat = await Filesystem.stat({
        path: `models/${fileName}`,
        directory: Directory.Data,
      });
      return true;
    } catch (e) {
      return false; // El archivo no existe
    }
  }

  /**
   * Obtiene la URI local del archivo para inyectarla en el <model-viewer>
   */
  static async getLocalModelURI(fileName: string): Promise<string> {
    if (Capacitor.getPlatform() === 'web') {
      // En entorno de desarrollo web, usar Firebase Storage temporalmente para no romper la vista
      const storageRef = ref(storage, fileName);
      return await getDownloadURL(storageRef);
    }

    try {
      const uri = await Filesystem.getUri({
        path: `models/${fileName}`,
        directory: Directory.Data,
      });
      return Capacitor.convertFileSrc(uri.uri); // Convierte a una URL leíble por la webview
    } catch (e) {
      console.error("Error al obtener URI local", e);
      return '';
    }
  }

  /**
   * Descarga el modelo desde Firebase y lo guarda en el almacenamiento local
   */
  static async downloadModel(fileName: string, onProgress?: (bytes: number, total: number) => void): Promise<string> {
    try {
      const storageRef = ref(storage, fileName);
      const url = await getDownloadURL(storageRef);

      if (Capacitor.getPlatform() === 'web') {
          // Simular descarga para testing en web ya que el navegador descarga el modelo directo al tag <model-viewer>
          if (onProgress) {
            let loaded = 0;
            const total = 15000000; // 15MB fake
            const interval = setInterval(() => {
              loaded += 500000; // 500kb fake step
              if (loaded > total) loaded = total;
              onProgress(loaded, total);
              if (loaded === total) clearInterval(interval);
            }, 100);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          return url;
      }

      // 2. Asegurarnos de que el directorio existe
      try {
        await Filesystem.mkdir({
          path: 'models',
          directory: Directory.Data,
          recursive: true
        });
      } catch (e) {
        // Ignorar si ya existe
      }

      const downloadPath = `models/${fileName}`;
      
      // Suscribirse a eventos de progreso si es nativo
      let progressListener: any;
      if (onProgress) {
        // En versiones recientes de Capacitor, Filesystem no tiene addListener para progress de downloadFile.
        // Solo pasamos progress: true y usamos el callback si está disponible.
        // Para simplificar, la barra de progreso simula la descarga o si es web/iOS usamos un XMLHttpRequest/fetch.
        // Pero intentaremos con el progress event si existe.
        try {
          // @ts-ignore
          Filesystem.addListener('progress', (progress: any) => {
            if (progress.url === url) {
              onProgress(progress.bytes, progress.contentLength);
            }
          });
        } catch(e) {}
      }

      await Filesystem.downloadFile({
          url: url,
          path: downloadPath,
          directory: Directory.Data,
          progress: true
      });

      if (progressListener) {
        progressListener.remove();
      }

      return await this.getLocalModelURI(fileName);
    } catch (error) {
      console.error('Error descargando el modelo:', error);
      throw error;
    }
  }

  /**
   * Elimina el modelo descargado para liberar espacio
   */
  static async deleteModel(fileName: string): Promise<void> {
    if (Capacitor.getPlatform() === 'web') return;

    try {
      await Filesystem.deleteFile({
        path: `models/${fileName}`,
        directory: Directory.Data,
      });
    } catch (e) {
      console.error('Error al eliminar modelo:', e);
    }
  }
}
