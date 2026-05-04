from fastapi import APIRouter, Depends, HTTPException
from models import User
from dependencies import get_session
from main import bcrypt_context
from schemas import UserSchema
from sqlalchemy.orm import Session

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.get("/")
async def authenticate():
    """
    This is the default authentication route of our system
    """
    return {"mensagem": "Você acessou a rota padrão de autenticação", "autenticado": False}

@auth_router.post("/create_user")
async def create_user(user_schema: UserSchema, session: Session = Depends(get_session)):
    user = session.query(User).filter(User.email == user_schema.email).first()
    if user:
        return HTTPException(status_code=400, detail="User email already exists")
    else:
        crypt_password = bcrypt_context.hash(user_schema.passsword)
        new_user = User(name=user_schema.name, email=user_schema.email, password=crypt_password, number=user_schema.number, status=user_schema.status, admin=user_schema.admin) 
        session.add(new_user)
        session.commit()
        return {"mensagem": f"User created sucessfully {user_schema.email}"}
    
