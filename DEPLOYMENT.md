# Deployment Guide - Tech Leader Journal App

## Prerequisites

1. ✅ **Supabase Project** - Database and storage configured
2. ✅ **Groq API Key** - For prompt generation  
3. ✅ **GitHub Repository** - Code pushed to GitHub
4. ✅ **Vercel Account** - For deployment

## Step-by-Step Deployment

### 1. Supabase Setup

1. **Create Project**
   ```bash
   # Go to https://supabase.com
   # Click "New Project"
   # Choose organization and name your project
   ```

2. **Run Database Schema**
   ```sql
   # Copy content from supabase/schema.sql
   # Go to Supabase Dashboard > SQL Editor
   # Paste and run the schema
   ```

3. **Get API Keys**
   ```bash
   # Go to Settings > API
   # Copy Project URL and anon key
   ```

### 2. Groq API Setup

1. **Get API Key**
   ```bash
   # Go to https://console.groq.com
   # Create account and generate API key
   ```

### 3. Local Testing

1. **Environment Setup**
   ```bash
   # Create .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GROQ_API_KEY=your-groq-api-key
   ```

2. **Test Locally**
   ```bash
   npm install
   npm run dev
   # Test at http://localhost:3000
   ```

3. **Run Tests**
   ```bash
   npm run test
   npm run build  # Ensure production build works
   ```

### 4. Vercel Deployment

1. **Connect Repository**
   ```bash
   # Go to https://vercel.com
   # Click "Import Project"
   # Connect your GitHub repository
   ```

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key  
   GROQ_API_KEY=your-groq-api-key
   ```

3. **Deploy**
   ```bash
   # Vercel will automatically deploy on git push
   # Or click "Deploy" in Vercel dashboard
   ```

### 5. Post-Deployment Verification

1. **Test Core Features**
   - [ ] Theme selection works
   - [ ] Prompt generation works (Groq API)
   - [ ] Journal entries save (Supabase)
   - [ ] Past entries load
   - [ ] Bookmarking works
   - [ ] Streak tracking displays

2. **Test Edge Cases**
   - [ ] No internet connection handling
   - [ ] API rate limits
   - [ ] Large text entries
   - [ ] Image uploads

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   ```
   Error: Invalid API key
   Solution: Check environment variables in Vercel
   ```

2. **Groq API Error**
   ```
   Error: 401 Unauthorized
   Solution: Verify GROQ_API_KEY is set correctly
   ```

3. **Build Errors**
   ```
   Error: Module not found
   Solution: Check import paths use @/ alias
   ```

### Environment Variables Checklist

```bash
# Required for production
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ GROQ_API_KEY

# Optional for development
🔧 NEXT_PUBLIC_ENVIRONMENT=production
🔧 NODE_ENV=production
```

## Performance Optimization

1. **Database Indexes** - Already included in schema
2. **Image Optimization** - Next.js handles automatically  
3. **API Caching** - Consider adding for prompt generation
4. **CDN** - Vercel provides automatically

## Security Notes

1. **RLS Enabled** - Row Level Security configured
2. **API Keys** - Stored securely in Vercel
3. **CORS** - Handled by Next.js API routes
4. **Auth** - Ready for Supabase auth integration

## Monitoring

1. **Vercel Analytics** - Built-in performance monitoring
2. **Supabase Dashboard** - Database monitoring
3. **Error Tracking** - Consider adding Sentry

## Next Steps

1. **Custom Domain** - Add in Vercel settings
2. **Performance Monitoring** - Set up alerts
3. **User Feedback** - Add feedback collection
4. **Feature Flags** - For A/B testing new features

## Support

- **Documentation**: README.md
- **API Reference**: Supabase docs, Groq docs
- **Community**: GitHub issues 