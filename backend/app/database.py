import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(DATABASE_URL,connect_args={"ssl": {}} )

def test():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("Connected Succesfully")
    except Exception as e:
        print("Database not connected")
        print(e)
