# Vercel Deployment Guide

This guide will walk you through deploying your Enterprise Project Management application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- A [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register) (for production database)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Quick Deployment Steps

### 1. Prepare Your MongoDB Database

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster or use an existing one
3. Create a database user with read/write permissions
4. **Important**: Configure Network Access
   - Go to Network Access in Atlas
   - Add `0.0.0.0/0` to allow connections from anywhere (Vercel uses dynamic IPs)
   - Or use MongoDB Atlas's Vercel integration for better security
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/database`)
   - Replace `<password>` with your actual database user password
   - Replace `<database>` with your database name (e.g., `taskmanagement`)

### 2. Generate NextAuth Secret

Generate a secure random string for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output - you'll need this for the `NEXTAUTH_SECRET` environment variable.

### 3. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended for first deployment)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure your project:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `prisma generate && next build` (auto-configured via package.json)
   - **Install Command**: `npm install` (default)

5. **Add Environment Variables** (click "Environment Variables" section):
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority
   NEXTAUTH_SECRET=your-generated-secret-from-step-2
   NEXTAUTH_URL=https://your-project.vercel.app
   NODE_ENV=production
   ```

   **Note**: For `NEXTAUTH_URL`, you can initially leave it empty or use a placeholder. After your first deployment, Vercel will assign you a domain (e.g., `your-project.vercel.app`). Then, add this URL as the `NEXTAUTH_URL` environment variable and redeploy.

6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (for first deployment)
   - What's your project's name? Enter a name
   - In which directory is your code located? **`./`**

5. Add environment variables:
   ```bash
   vercel env add MONGO_URI
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add NODE_ENV
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

### 4. Post-Deployment Configuration

After your first deployment:

1. **Update NEXTAUTH_URL**:
   - Copy your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
   - Go to your project settings in Vercel Dashboard
   - Navigate to "Environment Variables"
   - Update `NEXTAUTH_URL` with your actual deployment URL
   - Redeploy the application

2. **Verify Database Connection**:
   - Visit your deployed site
   - Try to sign up for a new account
   - Check MongoDB Atlas to verify the data was created

3. **Custom Domain (Optional)**:
   - Go to your project settings in Vercel
   - Navigate to "Domains"
   - Add your custom domain
   - Update `NEXTAUTH_URL` environment variable with your custom domain
   - Redeploy

### 5. Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js session encryption | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Full URL of your application | `https://your-project.vercel.app` |
| `NODE_ENV` | Application environment | `production` |

## Continuous Deployment

Once deployed, Vercel will automatically:
- Deploy every push to your main branch to production
- Create preview deployments for pull requests
- Run your build command and checks before deployment

## Troubleshooting

### Build Fails with Prisma Error

**Problem**: Build fails with "Prisma Client could not be generated"

**Solution**:
- Ensure `postinstall` script is in package.json: `"postinstall": "prisma generate"`
- The build command should include `prisma generate`: `"build": "prisma generate && next build"`

### Cannot Connect to Database

**Problem**: Application deployed but cannot connect to MongoDB

**Solution**:
1. Verify `MONGO_URI` is correct in Vercel environment variables
2. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
3. Ensure database user has correct permissions
4. Verify the database name in the connection string matches your Atlas database

### NextAuth Errors

**Problem**: Authentication not working or showing errors

**Solution**:
1. Verify `NEXTAUTH_SECRET` is set and is at least 32 characters
2. Ensure `NEXTAUTH_URL` matches your actual deployment URL (including `https://`)
3. Check that the URL doesn't have a trailing slash
4. Redeploy after updating environment variables

### 404 or Page Not Found

**Problem**: Some pages return 404 errors

**Solution**:
1. Ensure all required dependencies are in `dependencies` (not `devDependencies`)
2. Check build logs for any errors
3. Verify `next.config.ts` is properly configured

## Development vs Production

### Local Development
```bash
# Use your local .env file
npm run dev
```

### Production (Vercel)
- Environment variables are managed through Vercel Dashboard
- Never commit `.env` file to Git
- `.env.example` is provided as a template

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] `NEXTAUTH_SECRET` is unique and randomly generated
- [ ] MongoDB Atlas Network Access is configured
- [ ] Database user has minimum required permissions
- [ ] All environment variables are set in Vercel
- [ ] `NEXTAUTH_URL` uses HTTPS in production

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas with Vercel](https://www.mongodb.com/developer/products/atlas/mongodb-vercel-integration/)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

## Support

If you encounter issues:
1. Check Vercel deployment logs: Project → Deployments → [Select deployment] → View Function Logs
2. Review MongoDB Atlas metrics and logs
3. Verify all environment variables are correctly set
4. Ensure your Git repository is up to date

---

**Project**: Enterprise Project Management MVP
**Framework**: Next.js 15
**Database**: MongoDB (Prisma ORM)
**Authentication**: NextAuth.js
