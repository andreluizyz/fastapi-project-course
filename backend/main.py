from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
	from backend.auth_routes import auth_router
	from backend.order_routes import order_router
	from backend.config import *
except ModuleNotFoundError:
	from auth_routes import auth_router
	from order_routes import order_router
	from config import *

app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(order_router)

# para rodar o código, execute no terminal: uvicorn main:app --reload
# ou pela raiz do projeto: uvicorn backend.main:app --reload

# endpoint:
# /ordens 

# get
# post
# put/patch
# delete