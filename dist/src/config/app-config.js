import envData from "../env.js";
export const appConfig = {
    port: Number(envData.PORT),
    apiVersion: envData.API_VERSION,
    cookie_domain: "localhost",
    default_profile_pic: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
};
export const dbConfig = {
    host: envData.DB_HOST,
    port: Number(envData.DB_PORT),
    user: envData.DB_USER,
    password: envData.DB_PASSWORD,
    name: envData.DB_NAME,
};
export const jwtConfig = {
    secret: envData.JWT_SECRET,
    expires_in: 60 * 60 * 24 * 30,
};
export const s3Config = {
    accessKeyId: envData.S3_ACCESS_KEY_ID,
    secretAccessKey: envData.S3_SECRET_ACCESS_KEY,
    region: envData.S3_REGION,
    bucket: envData.S3_BUCKET,
};
