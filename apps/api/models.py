from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    driver_ref = Column(String, unique=True, index=True)
    code = Column(String, nullable=True)
    name = Column(String)
    dob = Column(Date)
    nationality = Column(String)

class Constructor(Base):
    __tablename__ = "constructors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    nationality = Column(String)

class Race(Base):
    __tablename__ = "races"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, index=True)
    round = Column(Integer)
    circuit = Column(String)
    date = Column(Date)

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    race_id = Column(Integer, ForeignKey("races.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    constructor_id = Column(Integer, ForeignKey("constructors.id"))

    grid = Column(Integer)
    position = Column(Integer)
    points = Column(Float)
    laps = Column(Integer)
    time = Column(String)
    status = Column(String)