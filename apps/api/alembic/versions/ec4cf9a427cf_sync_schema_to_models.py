"""sync_schema_to_models

Revision ID: ec4cf9a427cf
Revises: 07b2da21c938
Create Date: 2026-05-09 00:34:08.862224

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ec4cf9a427cf'
down_revision: Union[str, Sequence[str], None] = '07b2da21c938'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Drop foreign keys that prevent table/column modifications
    op.drop_constraint('results_status_id_fkey', 'results', type_='foreignkey')
    op.drop_constraint('races_circuit_ref_fkey', 'races', type_='foreignkey')

    # 2. Alter circuits table (ID type change and remove ref)
    # Note: We need to handle the serial sequence if it was an integer
    op.execute("ALTER TABLE circuits ALTER COLUMN circuit_id TYPE VARCHAR")
    op.drop_constraint('circuits_circuit_ref_key', 'circuits', type_='unique')
    op.drop_column('circuits', 'circuit_ref')

    # 3. Alter races table (rename/add circuit_id)
    op.add_column('races', sa.Column('circuit_id', sa.String(), nullable=True))
    # Migrate data if needed, but since we are re-ingesting, we can just drop the old one
    op.drop_column('races', 'circuit_ref')
    op.create_foreign_key('races_circuit_id_fkey', 'races', 'circuits', ['circuit_id'], ['circuit_id'])

    # 4. Clean up other tables
    op.drop_table('status')
    op.drop_column('results', 'status_id')
    op.create_unique_constraint('uq_race_driver_result', 'results', ['race_id', 'driver_id'])

    # 5. Standings updates
    op.add_column('constructor_standings', sa.Column('id', sa.Integer(), nullable=False, primary_key=True, autoincrement=True))
    op.add_column('constructor_standings', sa.Column('wins', sa.Integer(), nullable=True))
    op.create_unique_constraint('uq_race_constructor_standing', 'constructor_standings', ['race_id', 'constructor_id'])
    op.drop_column('constructor_standings', 'constructor_standings_id')

    op.add_column('driver_standings', sa.Column('id', sa.Integer(), nullable=False, primary_key=True, autoincrement=True))
    op.add_column('driver_standings', sa.Column('wins', sa.Integer(), nullable=True))
    op.create_unique_constraint('uq_race_driver_standing', 'driver_standings', ['race_id', 'driver_id'])
    op.drop_column('driver_standings', 'driver_standings_id')

    # 6. Drivers updates
    op.drop_column('drivers', 'number')
    op.drop_column('drivers', 'dob')

    # 7. Lap times & Pit stops
    op.add_column('lap_times', sa.Column('id', sa.Integer(), nullable=False, primary_key=True, autoincrement=True))
    op.add_column('lap_times', sa.Column('milliseconds', sa.Integer(), nullable=True))
    op.execute("ALTER TABLE lap_times ALTER COLUMN time TYPE VARCHAR")
    op.create_unique_constraint('uq_race_driver_lap', 'lap_times', ['race_id', 'driver_id', 'lap'])
    op.drop_column('lap_times', 'lap_time_id')

    op.add_column('pit_stops', sa.Column('id', sa.Integer(), nullable=False, primary_key=True, autoincrement=True))
    op.add_column('pit_stops', sa.Column('time', sa.String(), nullable=True))
    op.execute("ALTER TABLE pit_stops ALTER COLUMN duration TYPE VARCHAR")
    op.create_unique_constraint('uq_race_driver_stop', 'pit_stops', ['race_id', 'driver_id', 'stop'])
    op.drop_column('pit_stops', 'pit_stop_id')

    op.add_column('qualifying', sa.Column('id', sa.Integer(), nullable=False, primary_key=True, autoincrement=True))
    op.create_unique_constraint('uq_race_driver_qualifying', 'qualifying', ['race_id', 'driver_id'])
    op.drop_column('qualifying', 'qualify_id')


def downgrade() -> None:
    # Minimal downgrade for now as this is a destructive sync
    pass
