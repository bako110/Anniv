from fastapi import FastAPI
from app.auth import api as auth_api
from app.users import api as users_api
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(auth_api.router)
app.include_router(users_api.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En développement seulement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)