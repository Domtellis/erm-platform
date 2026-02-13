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

const reportBreach = (token) => {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            site_id: 'SITE-GAMMA-03',
            metric_name: 'pressure',
            observed_value: 500,
            severity: 'medium',
            description: 'Test Medium Breach for Backend Role Fix',
            category: 'safety',
            bu_id: 'BU-WEST-01'
        });

        const req = http.request({
            hostname: 'localhost',
            port: 4010,
            path: '/breaches/manual-submission',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        }, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                if (res.statusCode === 201) {
                    resolve(JSON.parse(data).id);
                } else {
                    console.log('Failed to create breach:', res.statusCode);
                    resolve(null);
                }
            });
        });
        req.write(payload);
        req.end();
    });
};

const createAndApprove = (token, breachId) => {
    const payload = JSON.stringify({
        breach_case_id: breachId,
        decision_type: 'mitigate',
        rationale: 'Risk Lead Mitigation (Backend Role Check)',
        submitted_by: 'risk-lead-01'
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
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
            if (res.statusCode === 201) {
                const decision = JSON.parse(data);
                console.log('Created Decision. Approving...');
                approve(token, decision.id); // Note: NOT sending role here anymore (or ignore if sent)
            } else {
                console.log('Failed to create decision:', res.statusCode, data);
            }
        });
    });
    req.write(payload);
    req.end();
};

const approve = (token, decisionId) => {
    // NOTE: We are intentionally sending garbage/empty role to prove backend uses TOKEN role, not this payload.
    const payload = JSON.stringify({
        approver_user_id: 'garbage-id',
        approver_role: 'garbage-role'
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
        console.log(`Approve Status: ${res.statusCode}`);
        res.on('data', d => process.stdout.write(d));
    });
    req.write(payload);
    req.end();
};

(async () => {
    try {
        const siteToken = await getToken('site-user-01');
        const riskToken = await getToken('risk-lead-01');

        console.log('Creating Medium Breach (Site User)...');
        const breachId = await reportBreach(siteToken);
        console.log('Breach ID:', breachId);

        if (breachId) {
            console.log('Attempting Approval (Risk Lead)...');
            createAndApprove(riskToken, breachId);
        }
    } catch (e) {
        console.error(e);
    }
})();
