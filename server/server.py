import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple, Union, TypedDict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlmodel import SQLModel, Field, create_engine, Session, select
from sqlalchemy import Column, JSON

from pydantic import BaseModel

from langchain.agents import initialize_agent, Tool
from langchain.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_community.tools import TavilySearchResults
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from langgraph.graph import StateGraph, END

from dotenv import load_dotenv


load_dotenv()
os.environ["TAVILY_API_KEY"] = ""

from sqlmodel import select
from datetime import datetime, timedelta



DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cart_2db")
engine = create_engine(DATABASE_URL, echo=False)

# Create all tables
SQLModel.metadata.create_all(engine)





class Alternatives(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    price: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    expiry: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    green: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    image: Optional[str]
    expiry_days: int
    green_score: int
    alternatives: Dict[str, Any] = Field(sa_column=Column(JSON))


class CartItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    added_at: datetime = Field(default_factory=datetime.utcnow)




class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    id: int
    quantity: int


class AgentInput(BaseModel):
    message: str




def add_item_to_cart(product_id: int, quantity: int = 1) -> CartItem:
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        cart_item = CartItem(product_id=product_id, quantity=quantity)
        session.add(cart_item)
        session.commit()
        session.refresh(cart_item)
        return cart_item


def delete_item_from_cart(item_id: int) -> None:
    with Session(engine) as session:
        item = session.get(CartItem, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        session.delete(item)
        session.commit()


def update_item_quantity(item_id: int, quantity: int) -> CartItem:
    with Session(engine) as session:
        item = session.get(CartItem, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        item.quantity = quantity
        session.add(item)
        session.commit()
        session.refresh(item)
        return item


def describe_cart() -> List[Dict[str, Any]]:
    with Session(engine) as session:
        statement = select(CartItem, Product).join(Product)
        results = session.exec(statement).all()
        description = []
        for cart_item, product in results:
            description.append(
                {
                    "cart_item_id": cart_item.id,
                    "product": {
                        "id": product.id,
                        "name": product.name,
                        "price": product.price,
                        "image": product.image,
                        "expiry_date": (
                            datetime.utcnow() + timedelta(days=product.expiry_days)
                        ).isoformat(),
                        "green_score": product.green_score,
                        "alternatives": product.alternatives,
                    },
                    "quantity": cart_item.quantity,
                }
            )
        return description


def find_products(query: str) -> List[Tuple[int, str]]:
    with Session(engine) as session:
        statement = select(Product).where(Product.name.ilike(f"%{query}%"))
        products = session.exec(statement).all()
        return [(p.id, p.name) for p in products]


def search_and_add(product_name: str, quantity: int = 1) -> str:
    matches = find_products(product_name)
    if not matches:
        return f"❌ No local product found for '{product_name}'."

    pid, name = matches[0]

    with Session(engine) as session:
        existing_item = session.exec(
            select(CartItem).where(CartItem.product_id == pid)
        ).first()

        if existing_item:
            existing_item.quantity += quantity
            session.add(existing_item)
            session.commit()
            return f"✅ Updated {name} in cart to quantity {existing_item.quantity}."
        else:
            cart_item = add_item_to_cart(pid, quantity)
            return f"✅ Added {name} (id {pid}) to cart with quantity {quantity}."



llm = ChatGroq(model="llama-3.1-8b-instant")
tavily = TavilySearchResults(k=5)


def tavily_ingredient_search(dish: str) -> List[str]:
    result = tavily.run(f"list ingredients used to make {dish}")
    if isinstance(result, list):
        return [r["title"] for r in result if "title" in r]
    return []


def find_cart_items_by_name(name: str):
    items = describe_cart()
    matched = []
    for item in items:
        if name.lower() in item["product"]["name"].lower():
            matched.append((item["cart_item_id"], item["product"]["name"]))
    return matched


def delete_cart_item_by_name(name: str):
    items = describe_cart()
    for item in items:
        if name.lower() in item["product"]["name"].lower():
            delete_item_from_cart(item["cart_item_id"])
            return f"✅ Deleted '{item['product']['name']}' from the cart (cart_item_id={item['cart_item_id']})."
    return f"⚠️ No item matching '{name}' found in the cart."


def search_and_delete(product_name: str) -> str:
    """
    Searches the cart for a product by name and deletes the first match.
    Ensures it deletes only once.
    """
    items = describe_cart()
    for item in items:
        if product_name.lower() in item["product"]["name"].lower():
            delete_item_from_cart(item["cart_item_id"])
            return f"✅ Deleted '{item['product']['name']}' from the cart (cart_item_id={item['cart_item_id']})."
    return f"⚠️ No item matching '{product_name}' found in the cart."



tools = [
    Tool(
        name="search_and_delete",
        func=search_and_delete,
        description="Finds and deletes the first matching product from the cart by name. Use this to delete once.",
    ),
    # Tool(
    #     name="delete_by_name",
    #     func=delete_cart_item_by_name,
    #     description="Delete a cart item by matching the product name (e.g. 'Mozzarella Cheese')",
    # ),
    Tool(
        name="find_cart_items_by_name",
        func=find_cart_items_by_name,
        description="Find items in the cart by product name; returns (cart_item_id, product name)",
    ),
    Tool(
        name="find_products",
        func=find_products,
        description="Search available products by keyword; returns list of (id, name).",
    ),
    Tool(
        name="add_item",
        func=lambda pid, qty=1: add_item_to_cart(int(pid), int(qty)),
        description="Add a specific product to cart by product_id and optional quantity",
    ),
    # Tool(
    #     name="delete_item",
    #     func=lambda item_id: delete_item_from_cart(int(item_id)),
    #     description="Delete an item from the cart using its cart_item_id (not product_id)",
    # ),
    Tool(
        name="update_quantity",
        func=lambda item_id, qty: update_item_quantity(int(item_id), int(qty)),
        description="Update quantity of a cart item by its cart_item_id",
    ),
    Tool(
        name="web_search_ingredients",
        func=tavily_ingredient_search,
        description=(
            "Use this first when the user asks for a DISH (e.g. 'ingredients of pizza'). "
            "It returns a list of ingredient names."
        ),
    ),
    Tool(
        name="search_and_add",
        func=search_and_add,
        description=(
            "One-shot helper that LOOKS UP a product by name in the local DB "
            "and ADDS the first match to the cart. "
            "Use this for each ingredient or product the user wants."
        ),
    ),
    Tool(
        name="describe_cart",
        func=describe_cart,
        description=(
            "Call this ONCE after you've finished modifying the cart. "
            "It returns a summary you can show to the user. "
            "After calling it, respond with:  Final Answer: <your reply>"
        ),
    ),
]

prefix = """
You are SmartCart-Bot 🛒🌱 — a helpful assistant that manages a smart shopping cart using tools.

### 🔧 Tools You Can Use:
1. web_search_ingredients(dish: str) → list[str]: Get ingredients for a dish.
2. search_and_add(name: str, qty: int = 1) → str: Add a product to the cart.
3. describe_cart() → list[dict]: Show current cart state.
4. find_cart_items_by_name(name: str) → list[tuple]: Get cart item IDs by name.
5. delete_by_name(name: str) → str: Delete item by product name.
6. delete_item(item_id: int) → str: Delete item using cart item ID.

---

### ✅ Rules for You to Follow:

1. **Casual messages** (e.g., "hello", "how are you", "thanks") → respond directly without tools.
2. **To add a product**:
   - Use `search_and_add(name, qty)` **exactly once** per product unless the user specifies multiple additions (e.g., "add pizza dough twice").
   - After a successful or failed attempt, call `describe_cart()` **once** and return a `Final Answer`.
3. **To add a dish**:
   - Use `web_search_ingredients(dish)` first.
   - Then call `search_and_add` **once per ingredient**.
   - Call `describe_cart()` **once** after all additions.
4. **To delete a product**:
   - Call `delete_by_name(name)` **exactly once**.
   - If it returns "✅ Deleted" or "⚠️ No item matching ... found," do NOT retry, do NOT call `find_products`, do NOT call `search_and_delete`, or any other tool to search again.
   - Immediately return a Final Answer`.
5. **After any action** (add, delete, or update):
   - Call `describe_cart()` **exactly once** to summarize the cart state.
   - Return: `Final Answer: <clear, friendly summary of the action or cart>`.
6. **Stopping Condition**:
   - A task is complete after a single successful or failed tool action (e.g., `search_and_add` or `delete_by_name`).
   - If a tool returns a success ("✅") or failure ("⚠️") message, do NOT repeat the action or try alternative tools for the same goal.
   - Always proceed to `describe_cart()` and return a `Final Answer` after one attempt.
7. **Tool Usage Limits**:
   - Never call `delete_by_name`, `find_products`, or `search_and_delete` more than once per user request.
   - Use `search_and_delete` only when explicitly instructed (e.g., "search and delete pizza dough"), not as a fallback.

---

### ⛔️ Absolutely Avoid:
- Repeating any tool call (e.g., `delete_by_name`, `find_products`, `search_and_delete`) for the same product or goal.
- Calling `describe_cart()` more than once per user request.
- Entering infinite loops by retrying failed actions or using alternative tools after a "not found" result.
- Ignoring success ("✅") or failure ("⚠️") messages from tools.
- Using `find_products` or `search_and_delete` to retry a failed `delete_by_name`.

You’re done when you:
- Complete the requested action (add, delete, etc.) with a single tool call.
- Call `describe_cart()` **once**.
- Return a single `Final Answer` with a clear summary.
"""


DECIDE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are a cart assistant. Classify the user message into one of the following actions:
- ADD <product name>
- REMOVE <product name>
If the message is unrelated, output NONE.
Respond with only the action and product, e.g., `ADD oat milk` or `REMOVE sugar`. Do not include punctuation.
""",
        ),
        ("user", "{user_message}"),
    ]
)


FINAL_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful shopping assistant. Compose a concise, friendly reply to the user summarising what was done to the cart.",
        ),
        ("assistant", "{tool_output}"),
    ]
)


from typing import Literal


class AgentState(TypedDict, total=False):
    user_message: str
    intent: Optional[Literal["add", "remove"]] 
    product: Optional[str]  
    tool_output: Optional[str]
    final_message: Optional[str]



async def add_product(state: AgentState) -> AgentState:
    """Call the search_and_add tool when a product is present."""
    product = state.get("product_to_add")
    if product:
        observation = search_and_add(product)
        return {**state, "tool_output": observation}
    return state


async def decide_intent(state: AgentState) -> AgentState:
    prompt = DECIDE_PROMPT.format(user_message=state["user_message"])
    result = await llm.ainvoke(prompt)
    response = result.content.strip()

    if response.upper() == "NONE":
        return {**state, "intent": None, "product": None}

    parts = response.split(maxsplit=1)
    if len(parts) != 2:
        return {**state, "intent": None, "product": None}

    intent_raw, product_name = parts
    intent = intent_raw.lower()
    return {**state, "intent": intent, "product": product_name.strip()}


async def handle_cart_action(state: AgentState) -> AgentState:
    intent = state.get("intent")
    product = state.get("product")
    if not intent or not product:
        return {**state, "tool_output": None}

    if intent == "add":
        obs = search_and_add(product)
    elif intent == "remove":
        obs = search_and_delete(product)
    else:
        obs = "Unknown intent."
    return {**state, "tool_output": obs}


SMALL_TALK_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a friendly, witty shopping assistant who helps users in a delightful tone. Keep responses short, warm, and engaging.",
        ),
        ("user", "{user_message}"),
    ]
)


async def final_response(state: AgentState) -> AgentState:
    tool_output = state.get("tool_output")

    if tool_output:
        prompt = FINAL_PROMPT.format(tool_output=tool_output)
        res = await llm.ainvoke(prompt)
        return {**state, "final_message": res.content}

    # If there's no cart action, respond in personality
    fallback = SMALL_TALK_PROMPT.format(user_message=state["user_message"])
    reply = await llm.ainvoke(fallback)
    return {**state, "final_message": reply.content}




graph = StateGraph(AgentState)

graph.add_node("decide", decide_intent)
graph.add_node("handle", handle_cart_action)
graph.add_node("final", final_response)

graph.add_edge("decide", "handle")
graph.add_edge("handle", "final")
graph.add_edge("final", END)

graph.set_entry_point("decide")
agent = graph.compile()



app = FastAPI()

origins = [
    "http://localhost:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Body


class SwapRequest(BaseModel):
    cart_item_id: int
    alternative: str  


from sqlalchemy import func


@app.post("/cart/swap")
def swap_cart_item(data: SwapRequest):
    """
    Replace the product in a cart item with another product by name.
    """
    cart_item_id = data.cart_item_id
    alt_name = data.alternative.strip().lower()

    with Session(engine) as session:
        # Fetch the cart item
        cart_line = session.get(CartItem, cart_item_id)
        if not cart_line:
            raise HTTPException(status_code=404, detail="Cart item not found")

        # Find the alternative product by name (case-insensitive)
        statement = select(Product).where(func.lower(Product.name) == alt_name)
        alt_product = session.exec(statement).first()
        if not alt_product:
            raise HTTPException(status_code=404, detail="Alternative product not found")

        # Update the cart item to point to the new product
        cart_line.product_id = alt_product.id
        session.add(cart_line)
        session.commit()
        session.refresh(cart_line)

        return {
            "cart_item_id": cart_line.id,
            "quantity": cart_line.quantity,
            "product": {
                "id": alt_product.id,
                "name": alt_product.name,
                "price": alt_product.price,
                "image": alt_product.image,
                "expiry_date": (
                    datetime.utcnow() + timedelta(days=alt_product.expiry_days)
                ).isoformat(),
                "green_score": alt_product.green_score,
                "alternatives": alt_product.alternatives,
            },
        }


@app.post("/agent")
async def chat(input_: AgentInput):
    result = await agent.ainvoke({"user_message": input_.message})
    print(result)
    return {"response": result}


@app.get("/cart")
def get_cart():
    return describe_cart()


@app.post("/cart/add")
def add_to_cart(item: CartItemCreate):
    return add_item_to_cart(item.product_id, item.quantity)


@app.delete("/cart/{item_id}")
def remove_from_cart(item_id: int):
    delete_item_from_cart(item_id)
    return {"status": "deleted", "item_id": item_id}


@app.patch("/cart/update")
def update_cart(q: CartItemUpdate):
    return update_item_quantity(q.id, q.quantity)


@app.post("/seed-products")
def seed_products():
    items = [
        {
            "name": "Mozzarella Cheese",
            "price": 250,
            "image": "https://static.toiimg.com/photo/75296834.cms",
            "expiry_days": 5,
            "green_score": 80,
            "alternatives": {
                "price": {
                    "name": "Cheddar Cheese",
                    "price": 200,
                    "savings": 50,
                    "image": "https://images.unsplash.com/photo-1606755962773-5ce770ae4c4d",
                },
                "expiry": {
                    "name": "Frozen Mozzarella",
                    "expiry_days": 30,
                    "extraDays": 25,
                    "image": "https://images.unsplash.com/photo-1588167056543-2d26f50339d5",
                },
                "green": {
                    "name": "Organic Mozzarella",
                    "greenScore": 90,
                    "improvement": 10,
                    "reason": "Made locally using eco-friendly packaging",
                    "image": "https://images.unsplash.com/photo-1612197524814-6dbccd82c6b6",
                },
            },
        },
        {
            "name": "Cheddar Cheese",
            "price": 200,
            "image": "https://images.unsplash.com/photo-1606755962773-5ce770ae4c4d",
            "expiry_days": 10,
            "green_score": 75,
        },
        {
            "name": "Frozen Mozzarella",
            "price": 260,
            "image": "https://images.unsplash.com/photo-1588167056543-2d26f50339d5",
            "expiry_days": 30,
            "green_score": 78,
        },
        {
            "name": "Organic Mozzarella",
            "price": 255,
            "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnXQgPQt2feWZJ4s8uXWH16gvfGjNenYaoRg&s",
            "expiry_days": 6,
            "green_score": 90,
        },
        {
            "name": "Pizza Dough",
            "price": 150,
            "image": "https://joyfoodsunshine.com/wp-content/uploads/2018/09/easy-homemade-pizza-dough-recipe-2-1.jpg",
            "expiry_days": 3,
            "green_score": 75,
            "alternatives": {},
        },
        {
            "name": "Tomato Sauce",
            "price": 100,
            "image": "https://images.unsplash.com/photo-1606788075761-ec6c4d8dbec5?w=400",
            "expiry_days": 10,
            "green_score": 85,
            "alternatives": {},
        },
        {
            "name": "Organic Greek Yogurt",
            "price": 399,
            "image": "https://images.unsplash.com/photo-1571212515416-6d4cdc4c37ef?w=400&h=300&fit=crop",
            "expiry_days": 2,
            "green_score": 85,
            "alternatives": {
                "price": {"name": "Regular Greek Yogurt", "price": 279, "savings": 120},
                "expiry": {
                    "name": "Long-life Greek Yogurt",
                    "expiry_days": 14,
                    "extraDays": 12,
                },
                "green": {
                    "name": "Local Organic Yogurt",
                    "greenScore": 95,
                    "improvement": 10,
                    "reason": "Locally sourced with compostable packaging",
                },
            },
        },
        {
            "name": "Free-Range Chicken Breast",
            "price": 1039,
            "image": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop",
            "expiry_days": 5,
            "green_score": 70,
            "alternatives": {
                "price": {
                    "name": "Regular Chicken Breast",
                    "price": 719,
                    "savings": 320,
                },
                "expiry": {
                    "name": "Frozen Chicken Breast",
                    "expiry_days": 90,
                    "extraDays": 85,
                },
                "green": {
                    "name": "Plant-Based Protein",
                    "greenScore": 90,
                    "improvement": 20,
                    "reason": "Lower carbon footprint and cruelty-free",
                },
            },
        },
        {
            "name": "Artisan Sourdough Bread",
            "price": 519,
            "image": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop",
            "expiry_days": 1,
            "green_score": 60,
            "alternatives": {
                "price": {"name": "Whole Wheat Bread", "price": 319, "savings": 200},
                "expiry": {
                    "name": "Preserved Artisan Bread",
                    "expiry_days": 7,
                    "extraDays": 6,
                },
                "green": {
                    "name": "Local Bakery Bread",
                    "greenScore": 85,
                    "improvement": 25,
                    "reason": "Supports local business and reduces transportation emissions",
                },
            },
        },
        {
            "name": "Olive Oil",
            "price": 459,
            "image": "https://images.unsplash.com/photo-1611048267330-8f1e7b8d3155?w=400",
            "expiry_days": 180,
            "green_score": 88,
            "alternatives": {
                "price": {"name": "Canola Oil", "price": 299, "savings": 160},
                "expiry": {
                    "name": "Refined Olive Oil",
                    "expiry_days": 365,
                    "extraDays": 185,
                },
                "green": {
                    "name": "Local Olive Oil",
                    "greenScore": 93,
                    "improvement": 5,
                    "reason": "Minimal packaging",
                },
            },
        },
        {
            "name": "Basil Leaves",
            "price": 89,
            "image": "https://images.unsplash.com/photo-1628591900570-e99ed9d44e3d?w=400",
            "expiry_days": 3,
            "green_score": 78,
            "alternatives": {},
        },
        {
            "name": "Shredded Parmesan",
            "price": 329,
            "image": "https://images.unsplash.com/photo-1600628422019-6b48a36ef21a?w=400",
            "expiry_days": 14,
            "green_score": 80,
            "alternatives": {},
        },
        {
            "name": "Canned Sweet Corn",
            "price": 99,
            "image": "https://images.unsplash.com/photo-1625945209031-62e865b0ac7d?w=400",
            "expiry_days": 60,
            "green_score": 82,
            "alternatives": {},
        },
        {
            "name": "Baby Spinach",
            "price": 199,
            "image": "https://images.unsplash.com/photo-1615486364182-7d8b4da2f7f1?w=400",
            "expiry_days": 5,
            "green_score": 87,
            "alternatives": {},
        },
        {
            "name": "Whole Milk",
            "price": 89,
            "image": "https://images.unsplash.com/photo-1625245737357-005ea6a746c5?w=400",
            "expiry_days": 6,
            "green_score": 75,
            "alternatives": {},
        },
        {
            "name": "Brown Eggs",
            "price": 169,
            "image": "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400",
            "expiry_days": 15,
            "green_score": 72,
            "alternatives": {},
        },
        {
            "name": "Tofu Cubes",
            "price": 120,
            "image": "https://images.unsplash.com/photo-1641575785129-6e9826bd2c20?w=400",
            "expiry_days": 10,
            "green_score": 90,
            "alternatives": {},
        },
        {
            "name": "Avocados",
            "price": 150,
            "image": "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400",
            "expiry_days": 4,
            "green_score": 85,
            "alternatives": {},
        },
        {
            "name": "Bananas",
            "price": 60,
            "image": "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?w=400",
            "expiry_days": 3,
            "green_score": 80,
            "alternatives": {},
        },
        {
            "name": "Peanut Butter",
            "price": 240,
            "image": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400",
            "expiry_days": 180,
            "green_score": 92,
            "alternatives": {},
        },
        {
            "name": "Almond Milk",
            "price": 199,
            "image": "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400",
            "expiry_days": 20,
            "green_score": 94,
            "alternatives": {},
        },
        {
            "name": "Instant Oats",
            "price": 130,
            "image": "https://images.unsplash.com/photo-1632407896563-0e26df4760e7?w=400",
            "expiry_days": 365,
            "green_score": 88,
            "alternatives": {},
        },
    ]

    with Session(engine) as session:
        SQLModel.metadata.create_all(engine)
        existing = session.exec(select(Product)).all()
        if not existing:
            for item in items:
                session.add(Product(**item))
            session.commit()
            print("✅ Seeded 20 products.")
        else:
            print("✅ Products already seeded.")



