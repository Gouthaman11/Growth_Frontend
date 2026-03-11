# 🚀 Deployment Guide - EduGrow Plus

## 🔧 Fix for 404 NOT_FOUND Errors

The 404 errors you're experiencing are due to SPA (Single Page Application) routing issues. I've created configuration files to fix this for all major hosting providers.

## 📁 Added Configuration Files

### ✅ For Vercel Hosting
- **File:** `vercel.json`
- **Purpose:** Redirects all routes to index.html for client-side routing

### ✅ For Netlify Hosting 
- **File:** `public/_redirects`
- **Purpose:** Netlify-specific redirect rules

### ✅ For Apache/cPanel Hosting
- **File:** `public/.htaccess`
- **Purpose:** Apache server redirect configuration

### ✅ Enhanced Vite Config
- **File:** `vite.config.js`
- **Purpose:** Optimized build configuration with code splitting

---

## 🚀 Deployment Instructions

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts to link project
4. Deploy: `vercel --prod`

### Option 2: Netlify
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Build: `npm run build`
3. Deploy: `netlify deploy --prod --dir=dist`

### Option 3: Manual Deployment
1. Build the project: `npm run build`
2. Upload the `dist` folder contents to your hosting provider
3. Ensure the hosting provider uses the appropriate config file

---

## 🔧 Pre-Deploy Checklist

- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run build` to create production build
- [ ] Check that `dist` folder is created successfully
- [ ] Verify all environment variables are set
- [ ] Test build locally: `npm run preview`

---

## 🌐 Environment Variables

Make sure these are set in your hosting environment:

```bash
# Frontend Environment Variables (if any)
VITE_API_URL=your_backend_url
VITE_FIREBASE_CONFIG=your_firebase_config

# Backend Environment Variables (for server deployment)
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## 🔍 Troubleshooting Common Issues

### 1. 404 on Page Refresh
✅ **Fixed:** Configuration files now handle SPA routing

### 2. Assets Not Loading
- Ensure your hosting provider serves files from the `dist` directory
- Check that the base path in `vite.config.js` matches your domain structure

### 3. API Calls Failing
- Update API endpoints to use your deployed backend URL
- Check CORS configuration on your backend

### 4. Build Fails
- Check for TypeScript/ESLint errors: `npm run lint`
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules dist .vite && npm install`

---

## 📱 Testing Your Deployment

1. **Homepage:** Should load without errors
2. **Navigation:** All internal links should work
3. **Direct URL Access:** Routes like `/student/dashboard` should work
4. **Page Refresh:** No 404 errors when refreshing any page
5. **Authentication:** Login/logout functionality works

---

## 🏗️ Backend Deployment

If using the full-stack application, deploy your backend separately:

### Render/Railway/Heroku:
1. Create new web service
2. Connect your repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Set environment variables

### Vercel Functions:
1. Use the `api/` directory for serverless functions
2. Configure in `vercel.json`

---

## 📞 Support

If you continue to experience issues:
1. Check browser console for errors
2. Verify network requests in DevTools
3. Ensure all configuration files are deployed
4. Check hosting provider logs

**Last Updated:** February 12, 2026