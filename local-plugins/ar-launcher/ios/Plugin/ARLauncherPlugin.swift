import Foundation
import Capacitor
import QuickLook
import UIKit

@objc(ARLauncherPlugin)
public class ARLauncherPlugin: CAPPlugin, CAPBridgedPlugin, QLPreviewControllerDataSource, QLPreviewControllerDelegate {
    
    public let identifier = "ARLauncherPlugin"
    public let jsName = "ARLauncher"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "openAR", returnType: CAPPluginReturnPromise)
    ]
    var fileUrl: URL?
    
    @objc func openAR(_ call: CAPPluginCall) {
        guard let fileUriString = call.getString("fileUri") else {
            call.reject("El parámetro fileUri es requerido en iOS.")
            return
        }
        
        // Convert the URI string to a file URL.
        // file:// URIs with special characters (parentheses, accents, spaces)
        // fail with URL(string:) because it doesn't percent-encode them.
        // We extract the path and use URL(fileURLWithPath:) which handles them correctly.
        let fileUrl: URL
        if fileUriString.hasPrefix("file://") {
            // Extract the path portion after "file://" and decode any existing percent-encoding
            let pathPortion = String(fileUriString.dropFirst("file://".count))
            let decodedPath = pathPortion.removingPercentEncoding ?? pathPortion
            fileUrl = URL(fileURLWithPath: decodedPath)
        } else if fileUriString.hasPrefix("/") {
            // It's already a plain file path
            fileUrl = URL(fileURLWithPath: fileUriString)
        } else {
            // Fallback: try URL(string:) with percent-encoding for non-file URIs
            guard let encoded = fileUriString.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
                  let url = URL(string: encoded) else {
                call.reject("URI de archivo inválida: \(fileUriString)")
                return
            }
            fileUrl = url
        }
        
        // Verify the file actually exists on disk
        if fileUrl.isFileURL && !FileManager.default.fileExists(atPath: fileUrl.path) {
            call.reject("El archivo .usdz no existe en disco: \(fileUrl.path)")
            return
        }
        
        self.fileUrl = fileUrl
        
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
        return self.fileUrl! as NSURL
    }
}
