from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Uuid
from sqlalchemy.orm import mapped_column


def uuid_pk():
    return mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)


def uuid_fk(
    target: str,
    *,
    nullable: bool = False,
    index: bool = True,
    ondelete: str | None = None,
    unique: bool = False,
):
    kwargs: dict = {"nullable": nullable, "index": index, "unique": unique}
    return mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(target, ondelete=ondelete) if ondelete else ForeignKey(target),
        **kwargs,
    )
