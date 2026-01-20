# Resume App - Full Stack Application

A complete resume analysis and optimization SaaS application with AI-powered features.

## � Project Structure

```
resume_app/
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment template
├── nginx/                      # Nginx reverse proxy
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ssl/
├── career_app_backend/         # Flask API
│   ├── Dockerfile
│   ├── app.py
│   ├── requirements.txt
│   └── ...
└── career_app_frontend/        # React/Vite app
    ├── Dockerfile
    ├── package.json
    └── ...
```

## 🏗️ Architecture

```
Internet (80/443)
    ↓
Nginx Container (reverse proxy)
    ├→ Frontend Container (React/Vite) - serves /
    └→ Backend Container (Flask API) - serves /api
```

## 🚀 Quick Deploy on VPS (Hostinger)

### Hostinger Docker Manager (Easiest)
1. Open **Docker Manager** in Hostinger panel
2. Add new application with Git URL: `https://github.com/SPRADEEP0727/resume_app.git`
3. Add environment variables (see `.env.example`)
4. Click Deploy!

### Manual Deployment
```bash
# Clone the repository
git clone https://github.com/SPRADEEP0727/resume_app.git resume_app
cd resume_app

# Configure environment
cp .env.example .env
nano .env  # Add your API keys

# Build and run with Docker
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

## 💻 Development (Local)

### Backend
```bash
cd career_app_backend
pip install -r requirements.txt
cp .env.example .env  # Edit with your API keys
python app.py
```

### Frontend
```bash
cd career_app_frontend
npm install
cp .env.example .env  # Edit with your config
npm run dev
```

## 📖 Complete Documentation

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for full deployment instructions.

## Project Structure

```
resume_app/
├── docker-compose.yml          # Main orchestration file
├── .env.example                # Environment template
├── nginx/                      # Nginx reverse proxy
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ssl/                    # SSL certificates
├── career_app_backend/         # Flask API
│   ├── Dockerfile
│   ├── app.py
│   ├── requirements.txt
│   └── ...
└── career_app_frontend/        # React/Vite app
    ├── Dockerfile
    ├── package.json
    └── ...
```

## Architecture

```
[Internet] → [Nginx:80/443] → [Frontend:3000]
                             → [Backend:5000] (/api)
```

## URLs
- Frontend: `http://your-domain.com`
- Backend API: `http://your-domain.com/api`
- Health: `http://your-domain.com/health`

## Key Features
- ✅ Nginx reverse proxy with SSL support
- ✅ Separate containers for frontend/backend
- ✅ Health checks & auto-restart
- ✅ Rate limiting & security headers
- ✅ Production-optimized builds
- ✅ Volume persistence for uploads

## Environment Variables

**Backend**:
- `OPENAI_API_KEY` - Your OpenAI API key
- `SECRET_KEY` - Flask secret key

**Frontend**:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_API_BASE_URL` - Backend API URL (use `/api` in production)

## Support

For issues or questions, check [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) troubleshooting section.
