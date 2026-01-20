# Render Deployment Checklist

## Pre-deployment Steps

- [ ] Code pushed to GitHub repository
- [ ] All environment variables configured in Render dashboard
- [ ] OpenAI API key obtained and set
- [ ] Frontend CORS origins updated in ALLOWED_ORIGINS
- [ ] Dependencies tested locally

## Required Environment Variables in Render

```
OPENAI_API_KEY=sk-...your_openai_key
SECRET_KEY=your_random_secret_key_here
FLASK_ENV=production  
FLASK_DEBUG=False
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://career-app-frontend.vercel.app
MAX_CONTENT_LENGTH=16777216
```

## Render Service Configuration

- **Service Type**: Web Service
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`
- **Python Version**: 3.9.16
- **Plan**: Free tier (or paid for production)
- **Auto-Deploy**: Yes (deploys on push to main branch)

## Post-deployment Steps

- [ ] Test health check endpoint: `https://your-service.onrender.com/health`
- [ ] Test API endpoints with Postman/curl
- [ ] Update frontend VITE_BACKEND_URL to Render service URL
- [ ] Verify CORS configuration allows frontend requests
- [ ] Monitor logs for any deployment issues

## Frontend Integration

Update your frontend `.env` with the Render service URL:
```
VITE_BACKEND_URL=https://your-service-name.onrender.com
```

## Monitoring

- Check Render dashboard for deployment status
- Monitor service logs for errors
- Set up health check monitoring if needed

## Scaling Considerations

- Free tier has limitations (sleeps after 15 minutes)
- Consider paid plan for production use
- Monitor response times and resource usage