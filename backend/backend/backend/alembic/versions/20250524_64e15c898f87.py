"""create mahasiswa table

Revision ID: 64e15c898f87
Revises: 
Create Date: 2025-05-24 10:13:48.293078

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '64e15c898f87'
down_revision = None
branch_labels = None
depends_on = None

hafalan_status_enum_type = postgresql.ENUM('belum', 'sedang', 'selesai', name='hafalanstatusenum', create_type=False)

def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    hafalan_status_enum_type.create(op.get_bind(), checkfirst=True)
    op.create_table('surah',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('number_of_ayahs', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=50), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('ayah',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('surah_id', sa.Integer(), nullable=False),
    sa.Column('number_in_surah', sa.Integer(), nullable=False),
    sa.Column('text', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['surah_id'], ['surah.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('reminder',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('reminder_time', sa.DateTime(), nullable=False),
    sa.Column('message', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('hafalan',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('ayah_id', sa.Integer(), nullable=False),
    # The status column will be altered below.
    # It might be initially created as VARCHAR by autogenerate if it couldn't find the ENUM type,
    # or if this is modifying an existing schema.
    # For a clean setup, ensure it's created correctly or altered robustly.
    sa.Column('status', sa.VARCHAR(length=50), nullable=False, server_default='belum'), # Placeholder, will be altered
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['ayah_id'], ['ayah.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # Alter the 'status' column in 'hafalan' table
    op.alter_column('hafalan', 'status',
               existing_type=sa.VARCHAR(length=50), # This was likely detected by autogenerate
               type_=hafalan_status_enum_type,
               nullable=False, # Target state from model
               server_default="'belum'", # Correctly quoted default for ENUM
               postgresql_using='status::text::hafalanstatusenum' # Robust casting
               )
    # ### end Alembic commands ###

def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('hafalan')
    op.drop_table('reminder')
    op.drop_table('ayah')
    op.drop_table('users')
    op.drop_table('surah')
    hafalan_status_enum_type.drop(op.get_bind(), checkfirst=True)
    # ### end Alembic commands ###
