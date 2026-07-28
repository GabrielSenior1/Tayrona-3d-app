import Foundation
import Capacitor
import QuickLook

@objc(ARLauncherPlugin)
public class ARLauncherPlugin: CAPPlugin, QLPreviewControllerDataSource, QLPreviewControllerDelegate {
    
    var fileUrl: URL?
    
    @objc func openAR(_ call: CAPPluginCall) {
        let fileUriString = call.getString("fileUri")
        if fileUriString == nil {
            // Android compat: if they passed fileName, we reject because on iOS we need fileUri
            call.reject("El parámetro fileUri es requerido en iOS.")
            return
        }
        
        guard let uriString = fileUriString, let url = URL(string: uriString) else {
            call.reject("URI de archivo inválida")
            return
        }
        
        self.fileUrl = url
        
        DispatchQueue.main.async {
            let previewController = QLPreviewController()
            previewController.dataSource = self
            previewController.delegate = self
            
            if let viewController = self.bridge?.viewController {
                viewController.present(previewController, animated: true, completion: nil)
                call.resolve()
            } else {
                call.reject("No view controller found")
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
