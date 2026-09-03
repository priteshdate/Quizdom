from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from database import engine, test

app = FastAPI(title="Quiz Platform")

test()

class loginreq(BaseModel):
    username:str
    password:str

class signupreq(BaseModel):
    username:str
    name:str
    password:str


@app.post("/login")
def login(login_data: loginreq):
    with engine.begin() as conn:
        result = conn.execute(
            text("CALL CheckLogin(:username, :password)"),
            {"username": login_data.username, "password": login_data.password}
        ).scalar()
        
        if result != "Verified":
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        return {"message": "Login successful"}


@app.post("/signup")
def signup(signup_data: signupreq):
    with engine.begin() as conn:
        result = conn.execute(
            text("CALL CheckLogin(:username,:name, :password)"),
            {"username": signup_data.username,"name": signup_data.password , "password": signup_data.password}
        ).scalar()
        
        if result != "Username already exists":
            raise HTTPException(status_code=401, detail="Username already exists")
            
        return {"message": "Registration Completed"}

