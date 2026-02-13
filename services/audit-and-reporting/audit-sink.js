const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "erm-audit-service",
    brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "erm-audit-group" });

async function startAuditSink() {
    await consumer.connect();
    await consumer.subscribe({ topic: "erm-audit-events", fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString());

            // LOGIC: In a real system, this would write to an append-only store (e.g., PostgreSQL audit schema)
            console.log(`[AUDIT STORED]: ${event.id} | Type: ${event.type} | Tenant: ${event.extension_tenant_id || "N/A"}`);

            // Trace continuity check
            if (event.extension_traceparent) {
                console.log(`[TRACE]: Continuing trace ${event.extension_traceparent}`);
            }
        },
    });
}

console.log("Audit Sink Service Started...");
startAuditSink().catch(console.error);
