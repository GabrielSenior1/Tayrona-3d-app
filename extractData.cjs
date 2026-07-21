const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '../../');
const categories = ['Peces', 'Mangles', 'Terrestres'];
const outputData = [];

categories.forEach(category => {
    const categoryPath = path.join(basePath, category);
    if (!fs.existsSync(categoryPath)) return;
    
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.html') && f !== 'index.html');
    
    files.forEach(file => {
        const filePath = path.join(categoryPath, file);
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Extract Data using Regex
        const titleMatch = html.match(/<h1>(.*?)<\/h1>/);
        const subtitleMatch = html.match(/<p>(?:<i>)?(.*?)<\/p>/i); // Often scientific name under h1
        const tagMatch = html.match(/<span class="tag">(.*?)<\/span>/);
        const modelMatch = html.match(/<model-viewer.*?src="(.*?)".*?>/);
        
        // Find text under specific headings
        const descMatch = html.match(/<h3>¿Quién es\?<\/h3>\s*<p>(.*?)<\/p>/s);
        const funFactMatch = html.match(/<h3>.*?Dato Curioso<\/h3>\s*<p>(.*?)<\/p>/s);
        const locationMatch = html.match(/<div class="location-box">.*?<p>(.*?)<\/p>.*?<\/div>/s);
        
        let title = titleMatch ? titleMatch[1].trim() : file.replace('.html', '').replace(/_/g, ' ');
        let scientificName = subtitleMatch ? subtitleMatch[1].trim() : '';
        // If scientific name has </p>, clean it
        scientificName = scientificName.replace(/<\/?[^>]+(>|$)/g, "");

        const modelFile = modelMatch ? modelMatch[1] : '';

        // Only include if there is a 3D model
        if (modelFile) {
            outputData.push({
                id: file.replace('.html', ''),
                category: category === 'Peces' ? 'Mar' : (category === 'Mangles' ? 'Mangle' : 'Terrestre'),
                title,
                scientificName,
                tag: tagMatch ? tagMatch[1].trim() : '',
                description: descMatch ? descMatch[1].trim() : '',
                funFact: funFactMatch ? funFactMatch[1].trim() : '',
                location: locationMatch ? locationMatch[1].trim() : '',
                androidModel: modelFile,
                iosModel: modelFile.replace('.glb', '.usdz')
            });
        }
    });
});

const tsCode = `export interface ModelData {
    id: string;
    category: 'Mar' | 'Mangle' | 'Terrestre';
    title: string;
    scientificName: string;
    tag: string;
    description: string;
    funFact: string;
    location: string;
    androidModel: string;
    iosModel: string;
}

export const modelsDatabase: ModelData[] = ${JSON.stringify(outputData, null, 4)};
`;

fs.mkdirSync(path.join(__dirname, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'src/data/modelsData.ts'), tsCode);
console.log('Successfully generated modelsData.ts with ' + outputData.length + ' entries.');
