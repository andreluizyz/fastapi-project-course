"""Items

Revision ID: 60228d0befd6
Revises: c917de4abc2c
Create Date: 2026-05-15 17:24:07.324772

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '60228d0befd6'
down_revision: Union[str, Sequence[str], None] = 'c917de4abc2c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column(
            "number",
            existing_type=sa.FLOAT(),
            type_=sa.String(),
            existing_nullable=False
        )


def downgrade() -> None:
    """Downgrade schema."""

    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column(
            "number",
            existing_type=sa.String(),
            type_=sa.FLOAT(),
            existing_nullable=False
        )