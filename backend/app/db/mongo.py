from pymongo import MongoClient
from app.config import settings

client = MongoClient(settings.MONGO_URL)
db = client[settings.MONGO_DB]
profiles_collection = db["profiles"]
