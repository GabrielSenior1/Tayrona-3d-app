import Foundation
import Capacitor
import QuickLook

@objc(ARLauncherPlugin)
public class ARLauncherPlugin: CAPPlugin, QLPreviewControllerDataSource, QLPreviewControllerDelegate {
    
    var fileUrl: URL?
    
    @objc func openAR(_ call: CAPPluginCall) {
        guard let fileUriString = call.getString("fileUri") else {
            call.reject("El parámetro fileUri es requerido.")
            return
        }
        
        guard let url = URL(string: fileUriString) else {
            call.reject("URI de archivo inválida: \(fileUriString)")
            return
        }
        
        // Verify the file exists
        if !FileManager.default.fileExists(atPath: url.path) {
            call.reject("El archivo no existe: \(url.path)")
            return
        }
        
        self.fileUrl = url
        
        DispatchQueue.main.async {
            let previewController = QLPreviewController()
            previewController.dataSource = self
            previewController.delegate = self
            
            if let viewController = self.bridge?.viewController {
                viewController.present(previewController, animated: true) {
                    call.resolve()
                }
            } else {
                call.reject("No se encontró el view controller")
            }
        }
    }
    
    // MARK: - QLPreviewControllerDataSource
    
    public func numberOfPreviewItems(in controller: QLPreviewController) -> Int {
        return self.fileUrl != nil ? 1 : 0
    }
    
    public func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem {
        return self.fileUrl! as QLPreviewItem
    }
}
