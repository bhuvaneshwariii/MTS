from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from physics import simulate_trajectory

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LaunchParams(BaseModel):
    angle: float
    speed: float
    mass: float
    diameter: float
    height: float
    wind_speed: float
    wind_angle: float

@app.get("/health")
def health():
    return {"status":"healthy"}

@app.post("/simulate")
def simulate(params: LaunchParams):
    return simulate_trajectory(
        angle=params.angle,
        speed=params.speed,
        mass=params.mass,
        diameter=params.diameter,
        height=params.height,
        wind_speed=params.wind_speed,
        wind_angle=params.wind_angle
    )
