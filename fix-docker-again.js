const fs = require('fs');
const path = require('path');

function findAndReplace(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory() && item !== 'node_modules') {
            findAndReplace(fullPath);
        } else if (item === 'Dockerfile.prod') {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('npm ci --omit=dev')) {
                content = content.replace(/npm ci --omit=dev/g, 'npm install --omit=dev');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`UPDATED: ${fullPath}`);
            } else {
                console.log(`SKIPPED (already fixed or missing target): ${fullPath}`);
            }
        }
    });
}

findAndReplace(process.cwd());
console.log('Dockerfile standardization attempt complete.');
