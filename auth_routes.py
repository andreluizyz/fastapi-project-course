from fastapi import APIRouter

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.get("/")
async def authenticate():
    """
    This is the default authentication route of our system
    """
    return {"mensagem": "Você acessou a rota padrão de autenticação", "autenticado": False}

