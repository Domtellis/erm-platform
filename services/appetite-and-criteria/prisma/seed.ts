import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Appetite & Criteria data with industry best practice thresholds...');

    await prisma.threshold.deleteMany({ where: { appetite: { id: 'appetite-safety-v1' } } });
    await prisma.appetiteStatement.deleteMany({ where: { id: 'appetite-safety-v1' } });

    const safetyAppetite = await prisma.appetiteStatement.create({
        data: {
            id: 'appetite-safety-v1',
            title: 'Group Safety & Compliance Appetite',
            description: 'Top-tier container terminal threshold limits aligned with ILO (2018) and ISO 31000/45001 standards.',
            category: 'safety',
            version: '1.0.0',
            is_active: true,
            thresholds: {
                create: [
                    // Systemic Lagging Indicators (Target: 0.0, Breach: > 1.0)
                    {
                        metric_name: 'ltifr',
                        display_name: 'Lost Time Injury Frequency Rate',
                        description: 'Rate of lost time injuries per million man-hours.',
                        operator: '>',
                        limit_value: 1.0,
                        severity_mapping: { '0.5': 'low', '0.8': 'medium', '1.0': 'high' }
                    },
                    {
                        metric_name: 'contractor_incident_rate',
                        display_name: 'Contractor Incident Rate',
                        description: 'Total recordable injury rate for on-site contractors.',
                        operator: '>',
                        limit_value: 1.0,
                        severity_mapping: { '0.5': 'low', '0.8': 'medium', '1.0': 'high' }
                    },

                    // Zero-Tolerance / Immediate Critical Breaches (Target: 0, Breach: > 0)
                    {
                        metric_name: 'fatigue_rest_violation_rate',
                        display_name: 'Fatigue Risk / Hours of Rest',
                        description: 'Percentage of personnel exceeding maximum shift hours.',
                        operator: '>',
                        limit_value: 0,
                        severity_mapping: { '0': 'high' }
                    },
                    {
                        metric_name: 'dropped_object_rate',
                        display_name: 'Dropped Object Rate',
                        description: 'Count of dropped container or equipment events.',
                        operator: '>',
                        limit_value: 0,
                        severity_mapping: { '0': 'high' }
                    },
                    {
                        metric_name: 'wind_protocol_breach_count',
                        display_name: 'Wind Protocol Breaches',
                        description: 'Operations conducted above safe anemometer levels.',
                        operator: '>',
                        limit_value: 0,
                        severity_mapping: { '0': 'high' }
                    },
                    {
                        metric_name: 'wah_incident_rate',
                        display_name: 'Working at Height Incidents',
                        description: 'Unsafe acts or falls during elevated port work.',
                        operator: '>',
                        limit_value: 0,
                        severity_mapping: { '0': 'high' }
                    },
                    {
                        metric_name: 'traffic_separation_breach_rate',
                        display_name: 'Traffic Separation Breaches',
                        description: 'Unauthorized interaction between machinery and pedestrians.',
                        operator: '>',
                        limit_value: 0,
                        severity_mapping: { '0': 'high' }
                    },
                    {
                        metric_name: 'safety_critical_maintenance_overdue_rate',
                        display_name: 'Maintenance Overdue Rate',
                        description: 'Percentage of SECE equipment with expired maintenance.',
                        operator: '>',
                        limit_value: 0,
                        severity_mapping: { '0': 'high' }
                    },

                    // Leading Cultural Indicators (Target: High, Breach: < 2.0 or < 90%)
                    {
                        metric_name: 'near_miss_reporting_rate',
                        display_name: 'Near Miss Reporting Rate',
                        description: 'Active reporting of unsafe conditions (higher is better).',
                        operator: '<',
                        limit_value: 2.0,
                        severity_mapping: { '5.0': 'low', '3.0': 'medium', '2.0': 'high' }
                    },
                    {
                        metric_name: 'capa_closure_rate',
                        display_name: 'CAPA Closure Rate',
                        description: 'Percentage of corrective actions closed within SLA.',
                        operator: '<',
                        limit_value: 90,
                        severity_mapping: { '95': 'low', '92': 'medium', '90': 'high' }
                    },

                    // Operational Margin Indicators (Target: < 0.1%, Breach: > 0.1%)
                    {
                        metric_name: 'overload_alarm_frequency',
                        display_name: 'Crane Overload Alarms',
                        description: 'Frequency of lifting beyond rated capacity.',
                        operator: '>',
                        limit_value: 0.1,
                        severity_mapping: { '0.05': 'low', '0.08': 'medium', '0.1': 'high' }
                    },

                    // 100% Mandatory / Flawless Execution Indicators (Target: 100%, Breach < 100%)
                    {
                        metric_name: 'ptw_audit_pass_rate',
                        display_name: 'PTW Audit Pass Rate',
                        description: 'Successful compliance in Permit-to-Work audits.',
                        operator: '<',
                        limit_value: 100,
                        severity_mapping: { '99': 'low', '95': 'medium', '90': 'high' }
                    },
                    {
                        metric_name: 'cce_score',
                        display_name: 'Critical Control Effectiveness',
                        description: 'Validation of critical barrier health.',
                        operator: '<',
                        limit_value: 100,
                        severity_mapping: { '99': 'high' }
                    },
                    {
                        metric_name: 'high_risk_mitigation_rate',
                        display_name: 'High Risk Mitigation Rate',
                        description: 'Application of treatment strategies to identified risks.',
                        operator: '<',
                        limit_value: 100,
                        severity_mapping: { '99': 'high' }
                    }
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
