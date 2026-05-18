from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.schemas import OrderSchema, OrderItemSchema, ResponseOrderSchema
from backend.dependencies import get_session, check_token
from backend.models import Order, User, OrderItem
from typing import List

order_router = APIRouter(prefix="/orders", tags=["orders"], dependencies=[Depends(check_token)])

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
        "message": f"Order created successfully. Id Order: {new_order.user}"
        }

@order_router.post("/order/cancel/{id_order}")
async def cancel_order(id_order: int, session: Session = Depends(get_session), user : User = Depends(check_token)):

    order = session.query(Order).filter(Order.id == id_order).first()
    if not order:
        raise HTTPException(status_code=400, detail="Order not found")
    if not user.admin or user.id != order.user:
        raise HTTPException(status_code=401, detail="You are not authorized for modify this order")
    order.status = "CANCELED"
    session.commit()
    return {
        "message": f"Order number: {order.id} canceled successfully",
        "order": order
    }

@order_router.get("/list")
async def order_list(session: Session = Depends(get_session), user : User = Depends(check_token)):
    if not user.admin:
        raise HTTPException(status_code=401, detail="You are not authorized for this operation")
    else:
        orders = session.query(Order).all()
        return {
            "orders": orders
        }
    
@order_router.post("/order/add-item/{id_order}")
async def add_item_order(id_order: int, order_item_Schema: OrderItemSchema, session: Session = Depends(get_session), user : User = Depends(check_token)):
    order = session.query(Order).filter(Order.id == id_order).first()
    if not order:
        raise HTTPException(status_code=400, detail="Order not found")
    if not user.admin or user.id != order.user:
        raise HTTPException(status_code=401, detail="You are not authorized for modify this order")
    order_item = OrderItem(order_item_Schema.quantity, order_item_Schema.flavor, order_item_Schema.size, order_item_Schema.unit_price, id_order)
    session.add(order_item)
    order.calculate_price()    
    session.commit()
    return {
        "message": "Order created successfully",
        "id_item": order_item.id,
        "item": order_item.flavor,
        "order_price": order.price
    }

@order_router.post("/order/remove-item/{id_item_order}")
async def remove_item_order(id_item_order: int, session: Session = Depends(get_session), user : User = Depends(check_token)):
    item_order = session.query(OrderItem).filter(OrderItem.id == id_item_order).first()
    order = session.query(Order).filter(Order.id == item_order.order).first()
    if not order:
        raise HTTPException(status_code=400, detail="Order not found")
    if not user.admin or user.id != order.user:
        raise HTTPException(status_code=401, detail="You are not authorized for modify this order")
    session.delete(item_order)
    session.flush()
    order.calculate_price()
    session.commit()
    return {
        "message": "Item removed successfully",
        "quantity_order_items": len(order.items),
        "order": order
    }

@order_router.post("/order/finish/{id_order}")
async def finish_order(id_order: int, session: Session = Depends(get_session), user : User = Depends(check_token)):
    order = session.query(Order).filter(Order.id == id_order).first()
    if not order:
        raise HTTPException(status_code=400, detail="Order not found")
    if not user.admin or user.id != order.user:
        raise HTTPException(status_code=401, detail="You are not authorized for modify this order")  
    order.status = "COMPLETED"
    session.commit()
    return {
        "message": "Order completed successfully",
        "order": order
    }

@order_router.get("/order/orders-user", response_model=List[ResponseOrderSchema])
async def list_orders(session: Session = Depends(get_session), user : User = Depends(check_token)):
    orders = session.query(Order).filter(Order.user == user.id).all()
    return orders

@order_router.get("/order/{id_order}")
async def view_order(id_order: int, session: Session = Depends(get_session), user : User = Depends(check_token)):
    order = session.query(Order).filter(Order.id == id_order).first()
    if not order:
        raise HTTPException(status_code=400, detail="Order not found")
    if not user.admin or user.id != order.user:
        raise HTTPException(status_code=401, detail="You are not authorized for modify this order")  
    return {
        "quantity_items_order": len(order.items), 
        "order": order
    }
    

# @order_router.get("/order/orders-user/{id_user}")
# async def list_orders(id_user: int, session: Session = Depends(get_session), user : User = Depends(check_token)):
#     order = session.query(Order).filter(Order.user == id_user).all()
#     if not order:
#         raise HTTPException(status_code=400, detail="Order not found for this user")
#     if not user.admin or user.id != id_user:
#         raise HTTPException(status_code=401, detail="You are not authorized for modify this order")  
#     return {
#         "user": user.name,
#         "quantity_orders": len(order),
#         "order": order
#     }


