from fastapi import APIRouter
from models import User

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.get("/")
async def authenticate():
    """
    This is the default authentication route of our system
    """
    return {"mensagem": "Você acessou a rota padrão de autenticação", "autenticado": False}

@auth_router.post("/create_user")
async def create_user(email: str, password: str):
    user = User.name