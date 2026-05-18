from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session, sessionmaker
from backend.models import User, db
from jose import jwt, JWTError
from backend.config import SECRET_KEY, ALGORITHM, oauth2_schema

def get_session():
    try:
        Session = sessionmaker(bind=db)
        session = Session()
        yield session
    finally:
        session.close()

def check_token(token: str = Depends(oauth2_schema), session: Session = Depends(get_session)):
    try: 
        dic_info = jwt.decode(token, SECRET_KEY, ALGORITHM)
        id_user = int(dic_info.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Access Denied, check the date expiration of token")

    user = session.query(User).filter(User.id==id_user).first()
    if not user:
        raise HTTPException(status_code=401, detail="Access Denied")
    return user