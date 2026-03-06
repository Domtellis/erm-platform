import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Appetite & Criteria data with industry best practice thresholds...');

    const safetyAppetite = await prisma.appetiteStatement.upsert({
        where: { id: 'appetite-safety-v1' },
        update: {},
        create: {
            id: 'appetite-safety-v1',
            title: 'Group Safety & Compliance Appetite',
            description: 'Top-tier container terminal threshold limits aligned with ILO (2018) and ISO 31000/45001 standards.',
            category: 'safety',
            version: '1.0.0',
            is_active: true,
            thresholds: {
                create: [
                    // Systemic Lagging Indicators (Target: 0.0, Breach: > 1.0)
                    { metric_name: 'ltifr', operator: '>', limit_value: 1.0, severity_mapping: { '0.5': 'low', '0.8': 'medium', '1.0': 'high' } },
                    { metric_name: 'contractor_incident_rate', operator: '>', limit_value: 1.0, severity_mapping: { '0.5': 'low', '0.8': 'medium', '1.0': 'high' } },

                    // Zero-Tolerance / Immediate Critical Breaches (Target: 0, Breach: > 0)
                    { metric_name: 'fatigue_rest_violation_rate', operator: '>', limit_value: 0, severity_mapping: { '0': 'high' } },
                    { metric_name: 'dropped_object_rate', operator: '>', limit_value: 0, severity_mapping: { '0': 'high' } },
                    { metric_name: 'wind_protocol_breach_count', operator: '>', limit_value: 0, severity_mapping: { '0': 'high' } },
                    { metric_name: 'wah_incident_rate', operator: '>', limit_value: 0, severity_mapping: { '0': 'high' } },
                    { metric_name: 'traffic_separation_breach_rate', operator: '>', limit_value: 0, severity_mapping: { '0': 'high' } },
                    { metric_name: 'safety_critical_maintenance_overdue_rate', operator: '>', limit_value: 0, severity_mapping: { '0': 'high' } },

                    // Leading Cultural Indicators (Target: High, Breach: < 2.0 or < 90%)
                    { metric_name: 'near_miss_reporting_rate', operator: '<', limit_value: 2.0, severity_mapping: { '5.0': 'low', '3.0': 'medium', '2.0': 'high' } },
                    { metric_name: 'capa_closure_rate', operator: '<', limit_value: 90, severity_mapping: { '95': 'low', '92': 'medium', '90': 'high' } },

                    // Operational Margin Indicators (Target: < 0.1%, Breach: > 0.1%)
                    { metric_name: 'overload_alarm_frequency', operator: '>', limit_value: 0.1, severity_mapping: { '0.05': 'low', '0.08': 'medium', '0.1': 'high' } },

                    // 100% Mandatory / Flawless Execution Indicators (Target: 100%, Breach < 100%)
                    { metric_name: 'ptw_audit_pass_rate', operator: '<', limit_value: 100, severity_mapping: { '99': 'low', '95': 'medium', '90': 'high' } },
                    { metric_name: 'cce_score', operator: '<', limit_value: 100, severity_mapping: { '99': 'high' } },
                    { metric_name: 'high_risk_mitigation_rate', operator: '<', limit_value: 100, severity_mapping: { '99': 'high' } }
                ]
            }
        }
    });

    console.log(`Successfully seeded appetite: ${safetyAppetite.title} with 14 aligned metric thresholds.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
