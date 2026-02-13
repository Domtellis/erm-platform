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
        req.write(postData);
        req.end();
    });
};

const getBreachId = (token) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 4010,
            path: '/breaches',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const breaches = JSON.parse(data);
                if (breaches.length > 0) resolve(breaches[0].id);
                else reject('No breaches found');
            });
        });
        req.end();
    });
};

const postDecision = (token, breachId) => {
    const payload = JSON.stringify({
        breach_case_id: breachId,
        decision_type: 'mitigate',
        rationale: 'Test rationale',
        submitted_by: 'RISK-LEAD-01'
    });

    const req = http.request({
        hostname: 'localhost',
        port: 4011,
        path: '/decisions',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    }, (res) => {
        console.log(`[Create] Status: ${res.statusCode}`);
        let data = '';
        res.on('data', (d) => { data += d; });
        res.on('end', () => {
            const decision = JSON.parse(data);
            console.log('Created decision:', decision.id);
            approveDecision(token, decision.id);
        });
    });

    req.write(payload);
    req.end();
};

const approveDecision = (token, decisionId) => {
    const payload = JSON.stringify({
        approver_user_id: 'BU-OWNER-99',
        approver_role: 'bu_risk_owner'
    });

    const req = http.request({
        hostname: 'localhost',
        port: 4011,
        path: `/decisions/${decisionId}/approve`,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    }, (res) => {
        console.log(`[Approve] Status: ${res.statusCode}`);
        res.on('data', (d) => process.stdout.write(d));
    });

    req.write(payload);
    req.end();
};

(async () => {
    try {
        const token = await getToken();
        console.log('Got token');
        const breachId = await getBreachId(token);
        console.log('Got breach ID:', breachId);
        postDecision(token, breachId);
    } catch (e) {
        console.error(e);
    }
})();
