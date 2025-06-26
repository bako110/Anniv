from app.users.models import UserProfile
from app.db.mongo import profiles_collection
from typing import Optional
from datetime import datetime
from bson import ObjectId

async def create_user_profile(profile: UserProfile) -> UserProfile:
    profile_dict = profile.dict(by_alias=True, exclude={"id"})
    profile_dict["registered_at"] = datetime.utcnow()
    result = await profiles_collection.insert_one(profile_dict)
    profile.id = str(result.inserted_id)
    return profile

async def get_user_profile_by_email(email: str) -> Optional[UserProfile]:
    data = await profiles_collection.find_one({"email": email})
    if data:
        return UserProfile(**data)
    return None

async def update_user_profile(email: str, updates: dict) -> Optional[UserProfile]:
    await profiles_collection.update_one({"email": email}, {"$set": updates})
    return await get_user_profile_by_email(email)
