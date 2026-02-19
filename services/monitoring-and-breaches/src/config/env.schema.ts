import * as Joi from 'joi';

export const envSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),
    PORT: Joi.number().default(4010),
    DATABASE_URL: Joi.string().required(),
    KAFKA_BROKERS: Joi.string().default('localhost:9092'),
    KEYCLOAK_ISSUER_URL: Joi.string().uri().required(),
    KEYCLOAK_JWKS_URL: Joi.string().uri().required(),
    OPA_URL: Joi.string().uri().default('http://localhost:8181/v1/data/erm/governance'),
});
