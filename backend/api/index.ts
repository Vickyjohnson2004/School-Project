// Vercel serverless entrypoint for the Express backend.
// Vercel sets process.env.VERCEL, so server.ts exports the app WITHOUT calling
// app.listen(). We simply hand Vercel the Express instance as the request handler.
import app from '../src/server';

export default app;
