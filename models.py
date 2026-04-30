from sqlalchemy import create_engine, Column, String, Integer, Boolean, Float, ForeignKey
from sqlalchemy.orm import declarative_base
from sqlalchemy_utils.types import ChoiceType

# create the conection to your database
db = create_engine("sqlite:///database.db")

# create the database base
Base = declarative_base()

# create the classes/tables of the database

class User(Base):
    __tablename__= "users"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", String)
    email = Column("email", String, nullable=False)
    number = Column("number", Float, nullable=False)
    password = Column("password", String)
    status = Column("status", Boolean)
    admin = Column("admin", Boolean, default=False)

    def __init__(self, name, email, number, password, status=True, admin=False):
        self.name = name
        self.email = email
        self.number = number
        self.password = password
        self.status = status
        self.admin = admin

class Order(Base):
    __tablename__= "orders"

    # STATUS_PEDIDOS = (
    #     ("PENDING", "PENDING"),
    #     ("CANCELED", "CANCELED"),
    #     ("COMPLETED", "COMPLETED"),
    # )

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    status = Column("status", String) # Pending, Canceled, Completed 
    user = Column("user", ForeignKey("users.id"))
    price = Column("price", Float)

    def __init__(self, user, status="PENDING", preco=0):
        self.user = user
        self.status = status
        self.preco = preco


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    quantity = Column("quantity", Integer)
    flavor = Column("flavor", String)
    size = Column("size", String)
    unit_price = Column("unit_price", Float)
    order = Column("order", ForeignKey("orders.id"))

    def __init__(self, quantity, flavor, size, unit_price, order):
        self.quantity = quantity
        self.flavor = flavor
        self.size = size
        self.unit_price = unit_price
        self.order = order

# run the metadata creation on your database