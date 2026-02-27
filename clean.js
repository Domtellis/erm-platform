const fs = require('fs');
const path = require('path');

function cleanJson(filePath) {
    if (!fs.existsSync(filePath)) return;
    const buffer = fs.readFileSync(filePath);
    let content = buffer.toString('utf8');
    content = content.replace(/^\uFEFF/, '');
    content = content.replace(/\\u0026/g, '&');
    content = content.replace(/\u0026/g, '&');
    try {
        const obj = JSON.parse(content);
        fs.writeFileSync(filePath, JSON.stringify(obj, null, 4), 'utf8');
        console.log(`Cleaned: ${filePath}`);
    } catch (e) {
        console.error(`Error parsing ${filePath}: ${e.message}`);
    }
}

const rootPkg = path.join(process.cwd(), 'package.json');
cleanJson(rootPkg);

['services', 'web'].forEach(dir => {
    const parentDir = path.join(process.cwd(), dir);
    if (fs.existsSync(parentDir)) {
        fs.readdirSync(parentDir).forEach(sub => {
            const pkg = path.join(parentDir, sub, 'package.json');
            cleanJson(pkg);
        });
    }
});
