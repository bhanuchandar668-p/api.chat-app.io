import envData from "../env.js";

export const appConfig = {
  port: Number(envData.PORT!),
  apiVersion: envData.API_VERSION!,
  cookie_domain: "localhost",
};

export const dbConfig = {
  host: envData.DB_HOST!,
  port: Number(envData.DB_PORT!),
  user: envData.DB_USER!,
  password: envData.DB_PASSWORD!,
  name: envData.DB_NAME!,
};

export const jwtConfig = {
  secret: envData.JWT_SECRET!,
  expires_in: 60 * 60 * 24 * 30,
};
