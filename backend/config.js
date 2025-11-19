export const port = process.env.PORT || 3000;
export const mySecrectKey = process.env.SECRET_KEY || 'my-secret-key';

if (!mySecrectKey) {
  throw new Error('SECRET_KEY is not set');
}