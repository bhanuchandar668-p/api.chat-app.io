import envData from "../env.js";
export const appConfig = {
    port: Number(envData.PORT),
    apiVersion: envData.API_VERSION,
    cookie_domain: "localhost",
};
export const dbConfig = {
    url: envData.DATABASE_URL,
};
export const jwtConfig = {
    secret: envData.JWT_SECRET,
    expires_in: 60 * 60 * 24 * 30,
};
