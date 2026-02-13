const http = require('http');
const querystring = require('querystring');

const postData = querystring.stringify({
    client_id: 'erm-web-portal',
    username: 'site-user-01',
    password: 'password',
    grant_type: 'password'
});

const getToken = () => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8080,
            path: '/realms/erm-platform/protocol/openid-connect/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const token = JSON.parse(data).access_token;
                    resolve(token);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
};

const checkService = (name, port, path, token) => {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: path,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        }, (res) => {
            console.log(`[${name}] Status: ${res.statusCode}`);
            resolve(res.statusCode);
        });
        req.on('error', (e) => {
            console.log(`[${name}] Error: ${e.message}`);
            resolve(500);
        });
        req.end();
    });
};

(async () => {
    try {
        console.log('Retrieving Token...');
        const token = await getToken();
        if (!token) {
            console.error('Failed to get token');
            process.exit(1);
        }
        console.log('Token retrieved.');

        await checkService('Monitoring', 4010, '/breaches', token);
        await checkService('Decisioning', 4011, '/decisions', token);
        await checkService('Audit', 4013, '/audit', token);

    } catch (e) {
        console.error('Test failed:', e);
    }
})();
