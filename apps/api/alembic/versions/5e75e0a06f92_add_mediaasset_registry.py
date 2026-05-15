"""Add MediaAsset registry

Revision ID: 5e75e0a06f92
Revises: 3a3167aac657
Create Date: 2026-05-15 19:49:16.014101

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5e75e0a06f92'
down_revision: Union[str, Sequence[str], None] = '3a3167aac657'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema — Tier 5 Canonical Media Registry."""
    op.create_table(
        'media_assets',
        # Identity
        sa.Column('id',          sa.String(),  nullable=False),
        sa.Column('entity_type', sa.String(),  nullable=False),
        sa.Column('entity_ref',  sa.String(),  nullable=False),
        sa.Column('category',    sa.String(),  nullable=False),
        sa.Column('season',      sa.Integer(), nullable=True),
        sa.Column('priority',    sa.Integer(), nullable=True),
        # Storage
        sa.Column('source_url',   sa.Text(), nullable=True),
        sa.Column('internal_url', sa.Text(), nullable=True),
        sa.Column('cdn_url',      sa.Text(), nullable=True),
        # Lifecycle
        sa.Column('lifecycle_state',    sa.String(), nullable=False, server_default='PROCESSING'),
        sa.Column('clearance_status',   sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('is_production_safe', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        # Provenance & Legal
        sa.Column('source_type',         sa.String(), nullable=True),
        sa.Column('owner_id',            sa.String(), nullable=True),
        sa.Column('license_type',        sa.String(), nullable=True),
        sa.Column('attribution_text',    sa.Text(),   nullable=True),
        sa.Column('license_url',         sa.Text(),   nullable=True),
        sa.Column('attribution_required',sa.Boolean(), nullable=False, server_default=sa.text('false')),
        # Verification
        sa.Column('checksum',            sa.String(), nullable=True),
        sa.Column('checksum_verified',   sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('last_verified',       sa.DateTime(), nullable=True),
        sa.Column('verification_error',  sa.Text(), nullable=True),
        # Processing Metadata (CLS prevention)
        sa.Column('width',           sa.Integer(), nullable=True),
        sa.Column('height',          sa.Integer(), nullable=True),
        sa.Column('aspect_ratio',    sa.Float(),   nullable=True),
        sa.Column('blurhash',        sa.String(),  nullable=True),
        sa.Column('has_transparency',sa.Boolean(), nullable=True),
        # Optimization
        sa.Column('avif_available',       sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('webp_available',       sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('optimization_version', sa.Integer(), nullable=False, server_default=sa.text('0')),
        # Color & Composition
        sa.Column('dominant_palette', sa.JSON(), nullable=True),
        sa.Column('focal_point',      sa.JSON(), nullable=True),
        # Variant Orchestration
        sa.Column('variants', sa.JSON(), nullable=True),
        # Fallback
        sa.Column('fallback_strategy', sa.String(), nullable=False, server_default='APEX_PLACEHOLDER'),
        # Audit Trail
        sa.Column('audit_log',        sa.JSON(), nullable=True),
        sa.Column('ingestion_source', sa.String(), nullable=True),
        sa.Column('created_at',       sa.DateTime(), nullable=True),
        sa.Column('updated_at',       sa.DateTime(), nullable=True),
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('entity_type', 'entity_ref', 'category', 'season',
                            name='uq_media_slot'),
    )
    op.create_index('ix_media_lifecycle',     'media_assets', ['lifecycle_state'])
    op.create_index('ix_media_entity_ref',    'media_assets', ['entity_ref'])
    op.create_index('ix_media_entity_lookup', 'media_assets',
                    ['entity_type', 'entity_ref', 'category'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_media_entity_lookup', table_name='media_assets')
    op.drop_index('ix_media_entity_ref',    table_name='media_assets')
    op.drop_index('ix_media_lifecycle',     table_name='media_assets')
    op.drop_table('media_assets')

