export const getKafkaBrokers = () => {
    const brokers = process.env.KAFKA_BROKERS;
    if (!brokers) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error("FATAL: KAFKA_BROKERS is not defined in production environment.");
        }
        return ["localhost:9092"]; // Consistent local fallback
    }
    return brokers.split(",");
};
