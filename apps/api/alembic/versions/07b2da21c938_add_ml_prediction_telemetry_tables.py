"""add_ml_prediction_telemetry_tables

Revision ID: 07b2da21c938
Revises: 34294627e1be
Create Date: 2026-05-09 00:12:40.953270

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '07b2da21c938'
down_revision: Union[str, Sequence[str], None] = '34294627e1be'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Add ML inference and prediction tables that were defined in models.py
    but never included in prior migrations.
    """
    # prediction_runs — parent table; must be created first
    op.create_table(
        'prediction_runs',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('model_version', sa.String(), nullable=True),
        sa.Column('simulation_source', sa.String(), nullable=True),
        sa.Column('config', sa.JSON(), nullable=True),
    )

    # model_metrics — depends on prediction_runs
    op.create_table(
        'model_metrics',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('run_id', sa.Integer(), sa.ForeignKey('prediction_runs.id'), nullable=True),
        sa.Column('metric_name', sa.String(), nullable=True),
        sa.Column('metric_value', sa.Float(), nullable=True),
    )

    # predicted_constructor_standings
    op.create_table(
        'predicted_constructor_standings',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('run_id', sa.Integer(), sa.ForeignKey('prediction_runs.id'), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('constructor_id', sa.Integer(), sa.ForeignKey('constructors.constructor_id'), nullable=True),
        sa.Column('predicted_points', sa.Float(), nullable=True),
        sa.Column('predicted_position', sa.Integer(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
    )

    # predicted_driver_standings
    op.create_table(
        'predicted_driver_standings',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('run_id', sa.Integer(), sa.ForeignKey('prediction_runs.id'), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('driver_id', sa.Integer(), sa.ForeignKey('drivers.driver_id'), nullable=True),
        sa.Column('predicted_points', sa.Float(), nullable=True),
        sa.Column('predicted_position', sa.Integer(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
    )

    # ml_features
    op.create_table(
        'ml_features',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('race_id', sa.Integer(), sa.ForeignKey('races.race_id'), nullable=True),
        sa.Column('driver_id', sa.Integer(), sa.ForeignKey('drivers.driver_id'), nullable=True),
        sa.Column('feature_vector', sa.JSON(), nullable=True),
        sa.Column('feature_version', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('source_hash', sa.String(), nullable=True),
        sa.Column('validation_status', sa.String(), nullable=True),
        sa.Column('confidence_metadata', sa.JSON(), nullable=True),
        sa.UniqueConstraint('race_id', 'driver_id', 'feature_version', name='uq_race_driver_feature_version'),
    )

    # predicted_race_results
    op.create_table(
        'predicted_race_results',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('run_id', sa.Integer(), sa.ForeignKey('prediction_runs.id'), nullable=True),
        sa.Column('race_id', sa.Integer(), sa.ForeignKey('races.race_id'), nullable=True),
        sa.Column('driver_id', sa.Integer(), sa.ForeignKey('drivers.driver_id'), nullable=True),
        sa.Column('predicted_position', sa.Integer(), nullable=True),
        sa.Column('probability_distribution', sa.JSON(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
    )

    # telemetry
    op.create_table(
        'telemetry',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('race_id', sa.Integer(), sa.ForeignKey('races.race_id'), nullable=True),
        sa.Column('driver_id', sa.Integer(), sa.ForeignKey('drivers.driver_id'), nullable=True),
        sa.Column('lap_number', sa.Integer(), nullable=True),
        sa.Column('sector1_time', sa.Float(), nullable=True),
        sa.Column('sector2_time', sa.Float(), nullable=True),
        sa.Column('sector3_time', sa.Float(), nullable=True),
        sa.Column('lap_time', sa.Float(), nullable=True),
        sa.Column('compound', sa.String(), nullable=True),
        sa.Column('tire_age', sa.Integer(), nullable=True),
        sa.Column('speed_trap', sa.Float(), nullable=True),
        sa.Column('weather_temp', sa.Float(), nullable=True),
        sa.Column('track_temp', sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('telemetry')
    op.drop_table('predicted_race_results')
    op.drop_table('ml_features')
    op.drop_table('predicted_driver_standings')
    op.drop_table('predicted_constructor_standings')
    op.drop_table('model_metrics')
    op.drop_table('prediction_runs')
