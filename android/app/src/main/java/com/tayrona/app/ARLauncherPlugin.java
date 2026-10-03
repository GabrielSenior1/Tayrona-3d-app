package com.tayrona.app;

import android.content.ActivityNotFoundException;
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

    private static final String TAG = "ARLauncher";

    @PluginMethod
    public void openAR(PluginCall call) {
        String fileName = call.getString("fileName");
        String fileUrl = call.getString("fileUrl");
        String title = call.getString("title", "Tayrona 3D");

        Log.d(TAG, "Iniciando Google Scene Viewer (AR). fileName: " + fileName + ", fileUrl: " + fileUrl + ", title: " + title);

        // 1. Estrategia Principal: Google Scene Viewer oficial con URL HTTPS (máxima fidelidad gráfica PBR y ARCore)
        if (fileUrl != null && !fileUrl.trim().isEmpty() && fileUrl.startsWith("http")) {
            try {
                Uri sceneViewerUri = Uri.parse("https://arvr.google.com/scene-viewer/1.0").buildUpon()
                        .appendQueryParameter("file", fileUrl)
                        .appendQueryParameter("mode", "ar_preferred")
                        .appendQueryParameter("title", title)
                        .appendQueryParameter("resizable", "true")
                        .build();

                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(sceneViewerUri);
                intent.setPackage("com.google.android.googlequicksearchbox");
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                try {
                    getContext().startActivity(intent);
                    call.resolve();
                    return;
                } catch (ActivityNotFoundException e1) {
                    Log.d(TAG, "No se encontró com.google.android.googlequicksearchbox, intentando con com.google.ar.core");
                    try {
                        intent.setPackage("com.google.ar.core");
                        getContext().startActivity(intent);
                        call.resolve();
                        return;
                    } catch (ActivityNotFoundException e2) {
                        Log.d(TAG, "Intentando abrir Scene Viewer con el visor predeterminado del sistema");
                        intent.setPackage(null);
                        getContext().startActivity(intent);
                        call.resolve();
                        return;
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "Fallo al abrir Scene Viewer con URL remota, intentando con archivo local...", e);
            }
        }

        // 2. Estrategia Secundaria: Archivo local a través de FileProvider (para modo offline o si no hay URL remota)
        if (fileName != null && !fileName.trim().isEmpty()) {
            try {
                File file = new File(getContext().getFilesDir(), "models/" + fileName);

                if (file.exists()) {
                    Uri contentUri = FileProvider.getUriForFile(
                            getContext(),
                            getContext().getPackageName() + ".fileprovider",
                            file
                    );

                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setDataAndType(contentUri, "model/gltf-binary");
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    intent.setPackage("com.google.ar.core");

                    try {
                        getContext().startActivity(intent);
                        call.resolve();
                        return;
                    } catch (ActivityNotFoundException e1) {
                        try {
                            intent.setPackage("com.google.android.googlequicksearchbox");
                            getContext().startActivity(intent);
                            call.resolve();
                            return;
                        } catch (ActivityNotFoundException e2) {
                            intent.setPackage(null);
                            getContext().startActivity(intent);
                            call.resolve();
                            return;
                        }
                    }
                } else {
                    Log.w(TAG, "Modelo local no encontrado en: " + file.getAbsolutePath());
                }
            } catch (Exception e) {
                Log.e(TAG, "Error lanzando Scene Viewer con archivo local", e);
            }
        }

        // 3. Fallback: Redirigir a Play Store para instalar o actualizar Google Play Services para RA (ARCore)
        try {
            Intent marketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=com.google.ar.core"));
            marketIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(marketIntent);
            call.reject("Google Play Services para Realidad Aumentada (ARCore / Scene Viewer) no está disponible o requiere actualización.");
        } catch (Exception ex) {
            call.reject("No se encontró Google Play Services para RA (Scene Viewer) en el dispositivo.");
        }
    }
}
