const { Kafka } = require("kafkajs");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

const ajv = new Ajv();
addFormats(ajv);

const kafka = new Kafka({
    clientId: "erm-event-consumer",
    brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "erm-harness-group" });

async function run() {
    await consumer.connect();
    await consumer.subscribe({ topic: "erm-audit-events", fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString());
            console.log(`\n[RECEIVED EVENT]: ${event.type}`);

            // Load Schema for Validation
            const schemaPath = path.join(__dirname, `../../../content/core/specs/data-contracts/events/${event.type}.json`);
            if (fs.existsSync(schemaPath)) {
                const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                const validate = ajv.compile(schema);
                if (validate(event.data)) {
                    console.log("✅ Validation Passed");
                } else {
                    console.error("❌ Validation Failed:", validate.errors);
                }
            } else {
                console.warn("⚠️ No schema found for validation.");
            }

            console.log("Data:", JSON.stringify(event.data, null, 2));
        },
    });
}

run().catch(console.error);
