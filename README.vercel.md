Vercel deployment helper

What I added

- vercel.json: Routes and function runtime configuration to serve the client from client/dist and expose serverless API endpoints under /api/*.
- api/case-study.mjs: Vercel serverless function that returns the same case-study JSON as the original Express API endpoint.
- api/health.mjs: Simple health check endpoint used by platforms to verify deployment.

Notes & next steps

1. Ensure the client build exists at client/dist in the repository. Vercel will serve static files from client/dist. If your client is a separate project, either copy the built dist into client/dist or update vercel.json to point to the correct path.

2. If you prefer to run the monolithic Express server instead of serverless functions, update package.json with a build/start script and set the Vercel project to use "Node.js" with a custom start command. Serverless functions are recommended for simplicity and fast scaling.

3. Deploy on Vercel:
   - Push these changes to GitHub (done).
   - Sign in to Vercel, import the GitHub repo, and deploy. Vercel will detect the api functions and use vercel.json configuration.

4. Test endpoints after deploy:
   - https://<your-vercel-domain>/api/case-study
   - https://<your-vercel-domain>/api/health

If you want, I can instead convert your existing Express app into a single serverless function (using the code in index.js) or add a Vercel build step to produce the client into client/dist. Tell me which you prefer and I'll update the repository accordingly.
