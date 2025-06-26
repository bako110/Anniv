from fastapi import APIRouter, HTTPException
from app.users.models import UserProfile
from app.users import services
from fastapi import Body

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserProfile)
async def create_profile(profile: UserProfile):
    existing = await services.get_user_profile_by_email(profile.email)
    if existing:
        raise HTTPException(status_code=400, detail="Profil déjà existant")
    return await services.create_user_profile(profile)

@router.get("/{email}", response_model=UserProfile)
async def get_profile(email: str):
    profile = await services.get_user_profile_by_email(email)
    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    return profile

@router.put("/{email}", response_model=UserProfile)
async def update_profile(email: str, updates: UserProfile = Body(...)):
    updated = await services.update_user_profile(email, updates.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    return updated
