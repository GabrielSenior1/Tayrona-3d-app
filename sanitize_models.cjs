const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function sanitizeModels() {
    console.log("Iniciando saneamiento de modelos para AR nativo (Offline)...");
    
    // Check if gltf-transform is installed
    try {
        execSync('gltf-transform --version', { stdio: 'ignore' });
    } catch (e) {
        console.error("❌ gltf-transform no está instalado globalmente.");
        console.log("Por favor ejecuta: npm install -g @gltf-transform/cli");
        process.exit(1);
    }

    const inputDir = path.join(__dirname, 'modelos_originales');
    const outputDir = path.join(__dirname, 'modelos_saneados');

    if (!fs.existsSync(inputDir)) {
        fs.mkdirSync(inputDir);
        console.log(`✅ Creada carpeta '${inputDir}'. Pon tus archivos .glb allí.`);
        return;
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.glb'));
    
    if (files.length === 0) {
        console.log(`⚠️ No se encontraron archivos .glb en '${inputDir}'.`);
        return;
    }

    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);
        
        console.log(`\nProcesando: ${file}`);
        
        try {
            // 1) Copy (decodes Draco to raw vertex arrays)
            console.log("  1/3 Decodificando mallas (Eliminando Draco)...");
            execSync(`gltf-transform copy "${inputPath}" "${outputPath}"`);
            
            // 3) Convert WEBP to PNG
            console.log("  2/2 Convirtiendo texturas WEBP a PNG para compatibilidad Filament...");
            execSync(`gltf-transform png --targetFormat png "${outputPath}" "${outputPath}"`);
            
            console.log(`✅ ¡Éxito! Modelo guardado en: ${outputPath}`);
        } catch (error) {
            console.error(`❌ Error procesando ${file}:`, error.message);
        }
    }
    
    console.log("\nProceso terminado. Sube los archivos de la carpeta 'modelos_saneados' a Firebase.");
}

sanitizeModels();
