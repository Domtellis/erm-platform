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

const reportBreach = (token, username) => {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            site_id: 'SITE-001',
            metric_name: 'temp',
            observed_value: 99,
            severity: 'low',
            description: 'Test breach',
            category: 'safety',
            bu_id: 'BU-NORTH-01'
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
                console.log(`[${username}] Report Breach Status: ${res.statusCode}`);
                if (res.statusCode === 201) {
                    resolve(JSON.parse(data).id);
                } else {
                    resolve(null);
                }
            });
        });
        req.write(payload);
        req.end();
    });
};

const createAndApproveDecision = (token, breachId, username) => {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            breach_case_id: breachId,
            decision_type: 'mitigate',
            rationale: 'Risk Lead Mitigation',
            submitted_by: username
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
                    console.log(`[${username}] Created Decision: 201`);
                    approve(token, decision.id, username, resolve);
                } else {
                    console.log(`[${username}] Create Decision Failed: ${res.statusCode}`);
                    resolve();
                }
            });
        });
        req.write(payload);
        req.end();
    });
};

const approve = (token, decisionId, username, resolve) => {
    const payload = JSON.stringify({
        approver_user_id: username,
        approver_role: 'risk_lead'
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
        console.log(`[${username}] Approve Decision Status: ${res.statusCode}`);
        res.on('data', (d) => process.stdout.write(d));
        resolve();
    });
    req.write(payload);
    req.end();
};

(async () => {
    try {
        const riskLeadToken = await getToken('risk-lead-01');
        const siteManagerToken = await getToken('site-user-01');

        console.log('--- Testing Breach Reporting ---');
        // Expect 201
        const breachId = await reportBreach(siteManagerToken, 'site-user-01');

        // Expect 403
        await reportBreach(riskLeadToken, 'risk-lead-01');

        if (breachId) {
            console.log('\n--- Testing Decision Approval (Risk Lead) ---');
            await createAndApproveDecision(riskLeadToken, breachId, 'risk-lead-01');
        }

    } catch (e) {
        console.error(e);
    }
})();
