from fastapi import APIRouter, Depends, HTTPException
try:
    from backend.models import User
    from backend.dependencies import get_session, check_token
    from backend.config import bcrypt_context, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY
    from backend.schemas import UserSchema, LoginSchema
except ModuleNotFoundError:
    from models import User
    from dependencies import get_session, check_token
    from config import bcrypt_context, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY
    from schemas import UserSchema, LoginSchema
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm

auth_router = APIRouter(prefix="/auth", tags=["auth"])

def create_token(id_user, duration_token=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    date_expiration = datetime.now(timezone.utc) + duration_token   
    dic_info = {"sub": str(id_user), "exp": date_expiration}
    jwt_encoded = jwt.encode(dic_info, SECRET_KEY, ALGORITHM)
    return jwt_encoded


def user_authenticate(email, password, session):
    user = session.query(User).filter(User.email == email).first()
    if not user:
        return False
    elif not bcrypt_context.verify(password, user.password):
        return False
    return user

@auth_router.get("/")
async def home():
    """
    This is the default authentication route of our system.
    """
    return {
        "mensagem": "You access the standard route", "autenticado": False
        }

@auth_router.post("/create_user")
async def create_user(user_schema: UserSchema, session: Session = Depends(get_session)):
    user = session.query(User).filter(User.email == user_schema.email).first()
    if user:
        raise HTTPException(status_code=400, detail="User email already exists")
    else:
        crypt_password = bcrypt_context.hash(user_schema.password)
        new_user = User(name=user_schema.name, email=user_schema.email, password=crypt_password, number=user_schema.number, status=user_schema.status, admin=user_schema.admin) 
        session.add(new_user)
        session.commit()
        return {
            "mensagem": f"User created sucessfully {user_schema.email}"
            }
    

@auth_router.post("/login")
async def login(login_schema: LoginSchema, session: Session = Depends(get_session)):
    user = user_authenticate(login_schema.email, login_schema.password, session)
    if not user:
        raise HTTPException(status_code=400, detail="User not found or invalid credentials")
    else:
        access_token = create_token(user.id)
        refresh_token = create_token(user.id, duration_token=timedelta(days=7))
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer"
        }
    
@auth_router.post("/login-form")
async def login_form(data_form: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = user_authenticate(data_form.username, data_form.password, session)
    if not user:
        raise HTTPException(status_code=400, detail="User not found or invalid credentials")
    else:
        access_token = create_token(user.id)
        return {
            "access_token": access_token,
            "token_type": "Bearer"
        }

@auth_router.get("/refresh")
async def use_refresh_token(user: User = Depends(check_token)):
    access_token = create_token(user.id)
    return {
            "access_token": access_token,
            "token_type": "Bearer"
        }