package com.tayrona.app;

import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

@CapacitorPlugin(name = "ARLauncher")
public class ARLauncherPlugin extends Plugin {

    @PluginMethod
    public void openAR(PluginCall call) {
        String fileName = call.getString("fileName");
        if (fileName == null) {
            call.reject("El nombre del archivo es requerido.");
            return;
        }

        try {
            // Capacitor's Directory.Data writes to getFilesDir()
            File file = new File(getContext().getFilesDir(), "models/" + fileName);

            if (!file.exists()) {
                call.reject("El modelo no está descargado localmente: " + file.getAbsolutePath());
                return;
            }

            // Obtain the content URI using the configured FileProvider
            Uri contentUri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                file
            );

            // Build the Scene Viewer intent using the Google 3D viewer URL scheme
            // This is the documented way to launch Scene Viewer for local files
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(contentUri, "model/gltf-binary");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.setPackage("com.google.ar.core");
            
            getContext().startActivity(intent);
            call.resolve();
        } catch (android.content.ActivityNotFoundException e) {
            Log.e("ARLauncher", "No 3D viewer found, trying fallback", e);
            // Fallback: try with application/octet-stream
            try {
                File file = new File(getContext().getFilesDir(), "models/" + fileName);
                Uri contentUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    file
                );
                Intent fallbackIntent = new Intent(Intent.ACTION_VIEW);
                fallbackIntent.setDataAndType(contentUri, "model/gltf-binary");
                fallbackIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                fallbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                fallbackIntent.setPackage("com.google.android.googlequicksearchbox");
                getContext().startActivity(fallbackIntent);
                call.resolve();
            } catch (Exception ex) {
                Log.e("ARLauncher", "All attempts failed", ex);
                call.reject("No se encontró ninguna aplicación para abrir modelos 3D. Instala 'Google Play Services for AR' desde la Play Store.");
            }
        } catch (Exception e) {
            Log.e("ARLauncher", "Error launching AR", e);
            call.reject("Error al abrir AR: " + e.getMessage(), e);
        }
    }
}
