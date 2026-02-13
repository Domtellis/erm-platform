import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Appetite & Criteria data...');

    const safetyAppetite = await prisma.appetiteStatement.upsert({
        where: { id: 'appetite-safety-v1' },
        update: {},
        create: {
            id: 'appetite-safety-v1',
            title: 'Group Safety Appetite',
            description: 'Thresholds for physical and operational safety across all business units.',
            category: 'safety',
            version: '1.0.0',
            is_active: true,
            thresholds: {
                create: [
                    {
                        metric_name: 'sensor_pressure_psi',
                        operator: '>',
                        limit_value: 1000,
                        severity_mapping: {
                            '1000': 'low',
                            '1200': 'medium',
                            '1500': 'high'
                        }
                    }
                ]
            }
        }
    });

    console.log(`Seeded appetite: ${safetyAppetite.title}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
