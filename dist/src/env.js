import { flatten, object, parseAsync, pipe, string, transform } from "valibot";
export const VEnvSchema = object({
    PORT: pipe(string(), transform((val) => Number(val))),
    NODE_ENV: string(),
    API_VERSION: string(),
    DATABASE_URL: string(),
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
