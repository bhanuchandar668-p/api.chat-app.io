import { flatten, object, parseAsync, pipe, string, transform } from "valibot";
export const VEnvSchema = object({
    PORT: pipe(string(), transform((val) => Number(val))),
    NODE_ENV: string(),
    API_VERSION: string(),
    JWT_SECRET: string(),
    DB_NAME: string(),
    DB_PASSWORD: string(),
    DB_USER: string(),
    DB_HOST: string(),
    DB_PORT: pipe(string(), transform((val) => Number(val))),
    AWS_S3_ACCESS_KEY_ID: string(),
    AWS_S3_SECRET_ACCESS_KEY: string(),
    AWS_S3_REGION: string(),
    AWS_S3_BUCKET: string(),
});
// eslint-disable-next-line import/no-mutable-exports
let envData;
try {
    // eslint-disable-next-line node/no-process-env
    envData = await parseAsync(VEnvSchema, process.env, {
        abortPipeEarly: true,
    });
}
catch (e) {
    const error = e;
    console.error("❌ Invalid Env");
    console.error(flatten(error.issues));
    process.exit(1);
}
export default envData;
