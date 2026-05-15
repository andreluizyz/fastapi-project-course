from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas import OrderSchema
from dependencies import get_session, check_token
from models import Order

order_router = APIRouter(prefix="/order", tags=["order"], dependencies=[Depends(check_token)])

@order_router.get("/")
async def orders():
    return {"mensagem" : "Você acessou a rota de pedidos"}

@order_router.post("/order")
async def create_order(order_schema: OrderSchema, session: Session = Depends(get_session)):
    new_order = Order(user = order_schema.user)
    session.add(new_order)
    session.commit()
    return {"mensagem": f"Pedido criado com sucesso. ID do pedido: {new_order.user}"}