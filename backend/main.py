from fastapi import FastAPI

from backend.auth_routes import auth_router
from backend.order_routes import order_router
from backend.config import *

app = FastAPI()

app.include_router(auth_router)
app.include_router(order_router)

# para rodar o código, execute no terminal: uvicorn main:app --reload

# endpoint:
# /ordens 

# get
# post
# put/patch
# delete