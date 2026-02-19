const http = require('http');
const querystring = require('querystring');

const getToken = (username) => {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify({
            client_id: 'erm-web-portal',
            username: username,
            password: 'password',
            grant_type: 'password'
        });
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
        req.write(postData);
        req.end();
    });
};

const createAssessment = (token) => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            breach_case_id: 'd06d1948-2b81-4235-9761-42ee30d50069',
            title: 'Pre-Remediation Risk',
            impact_score: 5,
            likelihood_score: 5,
            submitted_by: 'risk-lead-01'
        });

        const req = http.request({
            hostname: 'localhost',
            port: 4011,
            path: '/assessments',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                if (res.statusCode === 201) resolve(JSON.parse(data).id);
                else reject(new Error(data));
            });
        });
        req.write(postData);
        req.end();
    });
};

const createRemediation = (token, riskId) => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            risk_assessment_id: riskId,
            title: 'Emergency Server Upgrade',
            description: 'Purchase 2 new blades immediately.',
            assigned_to: 'infra-lead-01',
            due_date: new Date().toISOString()
        });

        const req = http.request({
            hostname: 'localhost',
            port: 4011,
            path: '/remediations',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log('Response:', data);
                if (res.statusCode === 201) resolve();
                else reject(new Error(data));
            });
        });
        req.write(postData);
        req.end();
    });
};

(async () => {
    try {
        console.log('1. Authenticating...');
        const token = await getToken('risk-lead-01');

        console.log('2. Creating Risk Assessment...');
        const riskId = await createAssessment(token);
        console.log(`   Risk ID: ${riskId}`);

        console.log('3. Creating Remediation Plan...');
        await createRemediation(token, riskId);

    } catch (e) {
        console.error(e);
    }
})();
