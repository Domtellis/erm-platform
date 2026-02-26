const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

/**
 * Pact Native Binary Resolver
 * Ensures the correct platform-specific binary is installed at the monorepo root.
 */

const rootDir = path.resolve(__dirname, '..');
const platform = os.platform();
const arch = os.arch();

const pactLinux = '@pact-foundation/pact-core-linux-x64-glibc@16.2.0';
const pactWin = '@pact-foundation/pact-core-windows-x64@16.2.0';

try {
    process.chdir(rootDir);
    console.log(`Pact Resolver: Operating in ${rootDir}`);

    if (platform === 'linux' && arch === 'x64') {
        console.log('Detected Linux x64. Ensuring Pact native binary is installed at root...');
        execSync(`npm install ${pactLinux} --no-save --no-package-lock`, { stdio: 'inherit' });
    } else if (platform === 'win32' && arch === 'x64') {
        console.log('Detected Windows x64. Ensuring Pact native binary is installed at root...');
        execSync(`npm install ${pactWin} --no-save --no-package-lock`, { stdio: 'inherit' });
    } else {
        console.log(`Pact binary resolution skipped for platform: ${platform}, arch: ${arch}`);
    }
} catch (error) {
    console.error('Failed to install Pact native binary:', error.message);
}
