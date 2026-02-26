const { execSync } = require('child_process');
const os = require('os');

/**
 * Pact Native Binary Resolver
 * Ensures the correct platform-specific binary is installed regardless of the lockfile's origin.
 */

const platform = os.platform();
const arch = os.arch();

const pactLinux = '@pact-foundation/pact-core-linux-x64-glibc@16.2.0';
const pactWin = '@pact-foundation/pact-core-windows-x64@16.2.0';

try {
    if (platform === 'linux' && arch === 'x64') {
        console.log('Detected Linux x64. Ensuring Pact native binary is installed...');
        execSync(`npm install ${pactLinux} --no-save --no-package-lock`, { stdio: 'inherit' });
    } else if (platform === 'win32' && arch === 'x64') {
        console.log('Detected Windows x64. Ensuring Pact native binary is installed...');
        execSync(`npm install ${pactWin} --no-save --no-package-lock`, { stdio: 'inherit' });
    } else {
        console.log(`Pact binary resolution skipped for platform: ${platform}, arch: ${arch}`);
    }
} catch (error) {
    console.error('Failed to install Pact native binary:', error.message);
    // We don't exit with 1 because we don't want to break the whole install if this fails,
    // but it will likely cause tests to fail later.
}
