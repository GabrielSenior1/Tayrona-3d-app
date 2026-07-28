const xcode = require('xcode');
const fs = require('fs');
const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
const myProj = xcode.project(projectPath);

myProj.parse(function (err) {
    if (err) {
        console.error('Error parsing pbxproj', err);
        process.exit(1);
    }
    
    const swiftFile = 'App/ARLauncherPlugin.swift';
    const mFile = 'App/ARLauncherPlugin.m';

    // Add files to the project
    myProj.addSourceFile(swiftFile);
    myProj.addSourceFile(mFile);

    // Save the changes
    fs.writeFileSync(projectPath, myProj.writeSync());
    console.log('Added ARLauncherPlugin.swift and .m to Xcode project successfully');
});
