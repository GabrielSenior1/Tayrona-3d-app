const xcode = require('xcode');
const fs = require('fs');
const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
const myProj = xcode.project(projectPath);

myProj.parse(function (err) {
    if (err) {
        console.error('Error parsing project:', err);
        return;
    }

    // Add QuickLook framework
    myProj.addFramework('QuickLook.framework');
    
    // Add Swift and ObjC files
    // The files are inside ios/App/App/ directory.
    // The group 'App' corresponds to the 'App' directory relative to 'ios/App'
    
    const swiftFile = myProj.addSourceFile('App/ARLauncherPlugin.swift', null, myProj.findPBXGroupKey({name: 'App'}));
    const objcFile = myProj.addSourceFile('App/ARLauncherPlugin.m', null, myProj.findPBXGroupKey({name: 'App'}));
    
    if (swiftFile) {
        console.log('Added ARLauncherPlugin.swift successfully.');
    } else {
        console.log('Failed to add ARLauncherPlugin.swift (maybe it already exists).');
    }
    
    if (objcFile) {
        console.log('Added ARLauncherPlugin.m successfully.');
    } else {
        console.log('Failed to add ARLauncherPlugin.m (maybe it already exists).');
    }

    fs.writeFileSync(projectPath, myProj.writeSync());
    console.log('Saved project.pbxproj successfully.');
});
