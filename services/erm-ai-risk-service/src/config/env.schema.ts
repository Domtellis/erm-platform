import * as Joi from 'joi';

export const envSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),
    PORT: Joi.number().default(4014),
    DATABASE_URL: Joi.string().required(),
    KAFKA_BROKERS: Joi.string().default('localhost:9092'),
    KEYCLOAK_ISSUER_URL: Joi.string().uri().required(),
    KEYCLOAK_JWKS_URL: Joi.string().uri().required(),
    GEMINI_API_KEY: Joi.string().required(),
    GEMINI_MODEL: Joi.string().default('gemini-2.0-flash'),
    GEMINI_API_TIMEOUT_MS: Joi.number().default(10000),
    GEMINI_MAX_RETRIES: Joi.number().default(3),
});
