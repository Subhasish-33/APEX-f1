from enum import Enum
from pydantic import BaseModel
from typing import Optional

class LifecycleState(Enum):
    SCHEDULED = "SCHEDULED"
    FORMATION_LAP = "FORMATION_LAP"
    GREEN_FLAG = "GREEN_FLAG"
    YELLOW_FLAG = "YELLOW_FLAG"
    SAFETY_CAR = "SAFETY_CAR"
    VIRTUAL_SAFETY_CAR = "VIRTUAL_SAFETY_CAR"
    RED_FLAG = "RED_FLAG"
    PAUSED = "PAUSED"
    CHECKERED_FLAG = "CHECKERED_FLAG"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"

class SessionLifecycle(BaseModel):
    state: LifecycleState
    flag_color: str
    laps_completed: Optional[int] = 0
    total_laps: Optional[int] = None
    time_remaining_seconds: Optional[int] = None

    @property
    def is_active(self) -> bool:
        return self.state in [
            LifecycleState.FORMATION_LAP,
            LifecycleState.GREEN_FLAG,
            LifecycleState.YELLOW_FLAG,
            LifecycleState.SAFETY_CAR,
            LifecycleState.VIRTUAL_SAFETY_CAR
        ]

    @property
    def is_terminal(self) -> bool:
        return self.state in [
            LifecycleState.CHECKERED_FLAG,
            LifecycleState.COMPLETED,
            LifecycleState.ARCHIVED
        ]
