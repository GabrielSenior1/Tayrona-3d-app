#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(ARLauncherPlugin, "ARLauncher",
    CAP_PLUGIN_METHOD(openAR, CAPPluginReturnPromise);
)
