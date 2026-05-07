"""initial_schema

Revision ID: f16a913c4287
Revises: 
Create Date: 2026-04-22

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f16a913c4287'
down_revision: Union[str, Sequence[str], None] = None
branch_labels = None
depends_on = None

def downgrade() -> None:
    op.drop_index("idx_lap_times_race_driver", table_name="lap_times")
    op.drop_index("idx_results_driver_id", table_name="results")
    op.drop_index("idx_results_race_id", table_name="results")
    op.drop_index("idx_races_year", table_name="races")

    op.drop_constraint("check_position_valid", "results", type_="check")
    op.drop_constraint("check_points_non_negative", "results", type_="check")
    op.drop_constraint("check_driver_standings_position", "driver_standings", type_="check")
    op.drop_constraint("check_constructor_standings_position", "constructor_standings", type_="check")

    op.drop_table('results')
    op.drop_table('qualifying')
    op.drop_table('pit_stops')
    op.drop_table('lap_times')
    op.drop_table('driver_standings')
    op.drop_table('constructor_standings')
    op.drop_table('races')
    op.drop_table('status')
    op.drop_table('seasons')
    op.drop_table('drivers')
    op.drop_table('constructors')
    op.drop_table('circuits')

def upgrade() -> None:
    op.create_table('circuits',
        sa.Column('circuit_id', sa.Integer(), nullable=False),
        sa.Column('circuit_ref', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('circuit_id')
    )

    op.create_table('constructors',
        sa.Column('constructor_id', sa.Integer(), nullable=False),
        sa.Column('constructor_ref', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('nationality', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('constructor_id'),
        sa.UniqueConstraint('constructor_ref')
    )

    op.create_table('drivers',
        sa.Column('driver_id', sa.Integer(), nullable=False),
        sa.Column('driver_ref', sa.String(), nullable=True),
        sa.Column('number', sa.Integer(), nullable=True),
        sa.Column('code', sa.String(), nullable=True),
        sa.Column('forename', sa.String(), nullable=True),
        sa.Column('surname', sa.String(), nullable=True),
        sa.Column('dob', sa.Date(), nullable=True),
        sa.Column('nationality', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('driver_id'),
        sa.UniqueConstraint('driver_ref')
    )

    op.create_table('seasons',
        sa.Column('year', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('year')
    )

    op.create_table('status',
        sa.Column('status_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('status_id')
    )

    op.create_table('races',
        sa.Column('race_id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('round', sa.Integer(), nullable=True),
        sa.Column('circuit_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['circuit_id'], ['circuits.circuit_id']),
        sa.ForeignKeyConstraint(['year'], ['seasons.year']),
        sa.PrimaryKeyConstraint('race_id')
    )

    op.create_table('constructor_standings',
        sa.Column('constructor_standings_id', sa.Integer(), nullable=False),
        sa.Column('race_id', sa.Integer(), nullable=True),
        sa.Column('constructor_id', sa.Integer(), nullable=True),
        sa.Column('points', sa.Float(), nullable=True),
        sa.Column('position', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['constructor_id'], ['constructors.constructor_id']),
        sa.ForeignKeyConstraint(['race_id'], ['races.race_id']),
        sa.PrimaryKeyConstraint('constructor_standings_id')
    )

    op.create_table('driver_standings',
        sa.Column('driver_standings_id', sa.Integer(), nullable=False),
        sa.Column('race_id', sa.Integer(), nullable=True),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('points', sa.Float(), nullable=True),
        sa.Column('position', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.driver_id']),
        sa.ForeignKeyConstraint(['race_id'], ['races.race_id']),
        sa.PrimaryKeyConstraint('driver_standings_id')
    )

    op.create_table('lap_times',
        sa.Column('lap_time_id', sa.Integer(), nullable=False),
        sa.Column('race_id', sa.Integer(), nullable=True),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('lap', sa.Integer(), nullable=True),
        sa.Column('position', sa.Integer(), nullable=True),
        sa.Column('time', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.driver_id']),
        sa.ForeignKeyConstraint(['race_id'], ['races.race_id']),
        sa.PrimaryKeyConstraint('lap_time_id')
    )

    op.create_table('pit_stops',
        sa.Column('pit_stop_id', sa.Integer(), nullable=False),
        sa.Column('race_id', sa.Integer(), nullable=True),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('stop', sa.Integer(), nullable=True),
        sa.Column('lap', sa.Integer(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.driver_id']),
        sa.ForeignKeyConstraint(['race_id'], ['races.race_id']),
        sa.PrimaryKeyConstraint('pit_stop_id')
    )

    op.create_table('qualifying',
        sa.Column('qualify_id', sa.Integer(), nullable=False),
        sa.Column('race_id', sa.Integer(), nullable=True),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('constructor_id', sa.Integer(), nullable=True),
        sa.Column('position', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['constructor_id'], ['constructors.constructor_id']),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.driver_id']),
        sa.ForeignKeyConstraint(['race_id'], ['races.race_id']),
        sa.PrimaryKeyConstraint('qualify_id')
    )

    op.create_table('results',
        sa.Column('result_id', sa.Integer(), nullable=False),
        sa.Column('race_id', sa.Integer(), nullable=True),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('constructor_id', sa.Integer(), nullable=True),
        sa.Column('grid', sa.Integer(), nullable=True),
        sa.Column('position', sa.Integer(), nullable=True),
        sa.Column('points', sa.Float(), nullable=True),
        sa.Column('status_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['constructor_id'], ['constructors.constructor_id']),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.driver_id']),
        sa.ForeignKeyConstraint(['race_id'], ['races.race_id']),
        sa.ForeignKeyConstraint(['status_id'], ['status.status_id']),
        sa.PrimaryKeyConstraint('result_id')
    )

    # CHECK constraints
    op.create_check_constraint("check_position_valid", "results", "position >= 1 AND position <= 20")
    op.create_check_constraint("check_points_non_negative", "results", "points >= 0")

    op.create_check_constraint("check_driver_standings_position", "driver_standings", "position >= 1")
    op.create_check_constraint("check_constructor_standings_position", "constructor_standings", "position >= 1")

    # INDEXES
    op.create_index("idx_results_race_id", "results", ["race_id"])
    op.create_index("idx_results_driver_id", "results", ["driver_id"])
    op.create_index("idx_races_year", "races", ["year"])

    op.create_index("idx_lap_times_race_driver", "lap_times", ["race_id", "driver_id"])