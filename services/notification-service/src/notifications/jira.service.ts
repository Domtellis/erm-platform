import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class JiraService {
    private readonly logger = new Logger(JiraService.name);
    private readonly jiraUrl = process.env.JIRA_URL;
    private readonly jiraUser = process.env.JIRA_USER;
    private readonly jiraToken = process.env.JIRA_TOKEN;
    private readonly jiraProject = process.env.JIRA_PROJECT;

    async createIssue(plan: any) {
        if (!this.jiraUrl || !this.jiraUser || !this.jiraToken) {
            this.logger.warn('Jira credentials not configured. Skipping issue creation.');
            return;
        }

        const payload = {
            fields: {
                project: {
                    key: this.jiraProject || 'KAN'
                },
                summary: `[Remediation] ${plan.title}`,
                description: {
                    type: "doc",
                    version: 1,
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    type: "text",
                                    text: `Remediation Plan ID: ${plan.plan_id}\nAssigned To: ${plan.assigned_to}\nDue Date: ${plan.due_date}`
                                }
                            ]
                        }
                    ]
                },
                issuetype: {
                    name: 'Task'
                }
            }
        };

        try {
            this.logger.log(`Creating Jira Issue for Plan ${plan.plan_id}...`);
            const response = await axios.post(`${this.jiraUrl}/rest/api/3/issue`, payload, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${this.jiraUser}:${this.jiraToken}`).toString('base64')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            this.logger.log(`Jira Issue Created: ${response.data.key} (${response.data.self})`);
        } catch (error) {
            this.logger.error(`Failed to create Jira issue: ${error.message}`);
            if (error.response) {
                this.logger.error(`Jira API Response: ${JSON.stringify(error.response.data)}`);
            }
        }
    }
}
