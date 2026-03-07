import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const models = [
    {
        model_id: 'gemini-2.0-flash',
        display_name: 'Gemini 2.0 Flash',
        provider: 'google',
        is_active: true,
    },
    {
        model_id: 'gemini-2.5-flash-lite',
        display_name: 'Gemini 2.5 Flash Lite',
        provider: 'google',
        is_active: true,
    },
    {
        model_id: 'gemini-1.5-pro',
        display_name: 'Gemini 1.5 Pro',
        provider: 'google',
        is_active: true,
    },
    {
        model_id: 'gemini-3.1-pro',
        display_name: 'Gemini 3.1 Pro',
        provider: 'google',
        is_active: true,
    },
    {
        model_id: 'gemini-3.1-pro-low',
        display_name: 'Gemini 3.1 Pro (Low)',
        provider: 'google',
        is_active: true,
    },
];

async function main() {
    console.log('Seeding AI Model Registry...');

    for (const model of models) {
        await prisma.modelRegistry.upsert({
            where: { model_id: model.model_id },
            update: {
                display_name: model.display_name,
                provider: model.provider,
                is_active: model.is_active,
            },
            create: model,
        });
        console.log(`- Seeded model: ${model.display_name} (${model.model_id})`);
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
