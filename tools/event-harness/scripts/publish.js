const { HTTP, CloudEvent } = require("cloudevents");
const { Kafka } = require("kafkajs");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

const ajv = new Ajv();
addFormats(ajv);

const kafka = new Kafka({
  clientId: "erm-event-publisher",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

async function publishEvent(type, data) {
  // 1. Load Schema
  const schemaPath = path.join(__dirname, `../../../content/core/specs/data-contracts/events/${type}.json`);
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema not found for event type: ${type}`);
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

  // 2. Validate Payload
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    console.error("Payload validation failed:", validate.errors);
    throw new Error("Invalid payload");
  }

  // 3. Create CloudEvent
  const ce = new CloudEvent({
    type,
    source: "/tools/event-harness",
    subject: data.breach_case_id || data.decision_id || "system",
    data,
  });

  // 4. Publish to Kafka
  await producer.connect();
  await producer.send({
    topic: "erm-audit-events", // Default audit topic for PoP
    messages: [{ value: JSON.stringify(ce) }],
  });
  console.log(`Event ${type} published successfully.`);
  await producer.disconnect();
}

// Example usage if run directly
if (require.main === module) {
  const eventType = process.argv[2];
  const payloadPath = process.argv[3];
  if (eventType && payloadPath) {
    const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
    publishEvent(eventType, payload).catch(console.error);
  }
}
