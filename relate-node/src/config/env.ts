if (!process.env.AUDIENCE) {
  throw new Error('Variable AUDIENCE not found.');
}
if (!process.env.DB_ENDPOINT) {
  throw new Error('Variable DB_ENDPOINT not found.');
}
if (!process.env.DB_NAME) {
  throw new Error('Variable DB_NAME not found.');
}
if (!process.env.DB_PASSWORD) {
  throw new Error('Variable DB_USERNAME not found.');
}
if (!process.env.DB_PORT) {
  throw new Error('Variable DB_PORT not found.');
}
if (!process.env.DB_USERNAME) {
  throw new Error('Variable DB_USERNAME not found.');
}
if (!process.env.JWT_SECRET) {
  throw new Error('Variable JWT_SECRET not found.');
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('Variable REFRESH_TOKEN_SECRET not found.');
}

export const AUDIENCE: string = process.env.AUDIENCE;
export const DB_ENDPOINT: string = process.env.DB_ENDPOINT;
export const DB_NAME: string = process.env.DB_NAME;
export const DB_PASSWORD: string = process.env.DB_PASSWORD;
export const DB_PORT: string = process.env.DB_PORT;
export const DB_USERNAME: string = process.env.DB_USERNAME;
export const PORT: string | undefined = process.env.PORT;
export const JWT_SECRET: string = process.env.JWT_SECRET;
export const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET;
