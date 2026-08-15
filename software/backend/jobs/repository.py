"""Composed SQLite repository for RetainMol Job domain persistence."""

from __future__ import annotations

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

from .migrations import migrate
from .repository_dispatches import JobDispatchRepositoryMixin
from .repository_job_data import JobDataRepositoryMixin
from .repository_jobs import JobDefinitionRepositoryMixin
from .repository_molecules import MoleculeRepositoryMixin
from .repository_records import RepositoryRowMapperMixin
from .repository_runs import JobRunRepositoryMixin
from .repository_workflows import WorkflowRepositoryMixin


class JobRepository(
    JobDefinitionRepositoryMixin,
    JobRunRepositoryMixin,
    JobDispatchRepositoryMixin,
    JobDataRepositoryMixin,
    MoleculeRepositoryMixin,
    WorkflowRepositoryMixin,
    RepositoryRowMapperMixin,
):
    """Stable repository facade composed from domain-focused SQL capabilities."""

    def __init__(self, database_path: str | Path) -> None:
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    @contextmanager
    def _connection(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.database_path, timeout=5)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA busy_timeout = 5000")
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def _initialize(self) -> None:
        with self._connection() as connection:
            migrate(connection)
            connection.execute("PRAGMA journal_mode = WAL")
