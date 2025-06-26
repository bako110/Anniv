from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserProfile(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    first_name: Optional[str]
    last_name: Optional[str]
    avatar_url: str | None = None
    level: Optional[int] = 1
    points: Optional[int] = 0
    online_status: Optional[bool] = False
    registered_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat()}
