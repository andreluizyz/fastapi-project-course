from fastapi import APIRouter
from models import User, db
from sqlalchemy.orm import sessionmaker

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.get("/")
async def authenticate():
    """
    This is the default authentication route of our system
    """
    return {"mensagem": "Você acessou a rota padrão de autenticação", "autenticado": False}

@auth_router.post("/create_user")
async def create_user(email: str, password: str, name: str, number: str):
    Session = sessionmaker(bind=db)
    session = Session()
    user = session.query(User).filter(User.email == email).first()
    if user:
        return {"mensagem": "User alredy exists"}
    else:
        new_user = User(name=name, email=email, password=password, number=number) 
        session.add(new_user)
        session.commit()
        return {"mensagem": "User created sucessfully"}
