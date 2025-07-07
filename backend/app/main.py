import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.users.api import mark_users_offline_if_inactive  # Import de la fonction à appeler périodiquement
from app.auth.api import router as auth_router
from app.users.api import router as users_router
from app.friends.api import router as friends_router
from app.events.api import router as event_router

app = FastAPI()

upload_dir = Path("static/upload")
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router, prefix="/auth")
app.include_router(users_router)
app.include_router(friends_router, prefix="/friends")
app.include_router(event_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ limiter en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Bienvenue sur mon API FastAPI déployée sur Render !"}

# Fonction asynchrone qui tourne en boucle pour checker l'inactivité
async def start_offline_checker():
    while True:
        await mark_users_offline_if_inactive()
        await asyncio.sleep(60)  # pause 60 secondes

# Lancement de la tâche au démarrage de l'app
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_offline_checker())
