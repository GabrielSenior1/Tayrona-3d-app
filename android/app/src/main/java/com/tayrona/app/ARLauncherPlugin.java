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

            // Create an intent specifically for Scene Viewer
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(contentUri, "model/gltf-binary"); // Use application/octet-stream if this fails
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            // Scene viewer package name
            intent.setPackage("com.google.ar.core");

            // Attempt to start Scene Viewer. If it's not installed, it will throw an ActivityNotFoundException.
            getContext().startActivity(intent);
            
            call.resolve();
        } catch (android.content.ActivityNotFoundException e) {
            Log.e("ARLauncher", "Google Play Services for AR not installed", e);
            try {
                Intent marketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=com.google.ar.core"));
                marketIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(marketIntent);
                call.reject("Google Play Services for AR no está instalado. Redirigiendo a Play Store...");
            } catch (android.content.ActivityNotFoundException anfe) {
                Intent webIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=com.google.ar.core"));
                webIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(webIntent);
                call.reject("Por favor instala Google Play Services for AR.");
            }
        } catch (Exception e) {
            Log.e("ARLauncher", "Error launching AR", e);
            call.reject("Error al abrir AR: " + e.getMessage(), e);
        }
    }
}
