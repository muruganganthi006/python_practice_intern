from pydantic import BaseModel, EmailStr


class OperatorCreate(BaseModel):
    name: str
    phone: str | None = None
    email: EmailStr | None = None


class OperatorResponse(BaseModel):
    id: int
    name: str
    phone: str | None
    email: str | None

    class Config:
        from_attributes = True