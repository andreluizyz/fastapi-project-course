from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import OrderSchema
from dependencies import get_session, check_token
from models import Order, User

order_router = APIRouter(prefix="/order", tags=["order"], dependencies=[Depends(check_token)])

@order_router.get("/")
async def orders():
    return {
        "message": "You access the order routes"
        }

@order_router.post("/order")
async def create_order(order_schema: OrderSchema, session: Session = Depends(get_session)):
    new_order = Order(user = order_schema.user)
    session.add(new_order)
    session.commit()
    return {
        "message": f"Order created with success. Id Order: {new_order.user}"
        }

@order_router.post("/order/cancel/{id_order}")
async def cancel_order(id_order: int, session: Session = Depends(get_session), user : User = Depends(check_token)):

    order = session.query(Order).filter(Order.id == id_order).first()
    if not order:
        raise HTTPException(status_code=400, detail="Order not found")
    if not user.admin or user.id != order.user:
        raise HTTPException(status_code=401, detail="You not have a authorization for modify this order")
    order.status = "CANCELED"
    session.commit()
    return {
        "message": f"Order number: {order.id} canceled with success",
        "order": order
    }
    