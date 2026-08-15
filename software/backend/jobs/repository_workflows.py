"""Workflow definition and execution persistence operations."""

from __future__ import annotations

import sqlite3
from datetime import datetime

from .models import Workflow, WorkflowExecution, WorkflowInputLink
from .repository_records import _optional_timestamp, _timestamp


class WorkflowRepositoryMixin:
    """Persist workflow graphs and their single durable execution state."""

    def create_workflow(self, workflow: Workflow) -> None:
        with self._connection() as connection:
            connection.execute(
                "INSERT INTO workflows VALUES (?, ?, ?, ?)",
                (
                    workflow.workflow_id,
                    workflow.name,
                    _timestamp(workflow.created_at),
                    _timestamp(workflow.updated_at),
                ),
            )
            self._write_workflow_relations(connection, workflow)

    def update_workflow(self, workflow: Workflow) -> bool:
        with self._connection() as connection:
            cursor = connection.execute(
                "UPDATE workflows SET name = ?, updated_at = ? WHERE workflow_id = ?",
                (workflow.name, _timestamp(workflow.updated_at), workflow.workflow_id),
            )
            if cursor.rowcount != 1:
                return False
            connection.execute(
                "DELETE FROM workflow_jobs WHERE workflow_id = ?",
                (workflow.workflow_id,),
            )
            connection.execute(
                "DELETE FROM job_input_references WHERE workflow_id = ?",
                (workflow.workflow_id,),
            )
            self._write_workflow_relations(connection, workflow)
        return True

    def list_workflows(self) -> list[Workflow]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT * FROM workflows ORDER BY updated_at DESC, workflow_id DESC"
            ).fetchall()
        return [self._workflow_from_row(row) for row in rows]

    def get_workflow(self, workflow_id: str) -> Workflow | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM workflows WHERE workflow_id = ?", (workflow_id,)
            ).fetchone()
        return self._workflow_from_row(row) if row is not None else None

    def create_workflow_execution(
        self, execution: WorkflowExecution
    ) -> WorkflowExecution:
        """Activate one workflow once, returning the existing activation on races."""
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            connection.execute(
                """
                INSERT OR IGNORE INTO workflow_executions
                    (execution_id, workflow_id, status, error_code, error_message,
                     started_at, updated_at, finished_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    execution.execution_id,
                    execution.workflow_id,
                    execution.status,
                    execution.error_code,
                    execution.error_message,
                    _timestamp(execution.started_at),
                    _timestamp(execution.updated_at),
                    _optional_timestamp(execution.finished_at),
                ),
            )
            row = connection.execute(
                "SELECT * FROM workflow_executions WHERE workflow_id = ?",
                (execution.workflow_id,),
            ).fetchone()
        if row is None:
            raise sqlite3.IntegrityError("workflow execution was not persisted")
        return self._workflow_execution_from_row(row)

    def get_workflow_execution(
        self, workflow_id: str
    ) -> WorkflowExecution | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM workflow_executions WHERE workflow_id = ?",
                (workflow_id,),
            ).fetchone()
        return self._workflow_execution_from_row(row) if row is not None else None

    def list_active_workflow_executions(self) -> list[WorkflowExecution]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM workflow_executions
                WHERE status = 'active'
                ORDER BY started_at, execution_id
                """
            ).fetchall()
        return [self._workflow_execution_from_row(row) for row in rows]

    def transition_workflow_execution(
        self,
        workflow_id: str,
        *,
        expected_status: str,
        next_status: str,
        updated_at: datetime,
        error_code: str | None = None,
        error_message: str | None = None,
    ) -> bool:
        finished_at = updated_at if next_status != "active" else None
        with self._connection() as connection:
            cursor = connection.execute(
                """
                UPDATE workflow_executions
                SET status = ?, error_code = ?, error_message = ?, updated_at = ?,
                    finished_at = ?
                WHERE workflow_id = ? AND status = ?
                """,
                (
                    next_status,
                    error_code,
                    error_message,
                    _timestamp(updated_at),
                    _optional_timestamp(finished_at),
                    workflow_id,
                    expected_status,
                ),
            )
        return cursor.rowcount == 1

    def get_workflow_job_ids(self, workflow_id: str) -> list[str]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT job_id FROM workflow_jobs
                WHERE workflow_id = ?
                ORDER BY position, job_id
                """,
                (workflow_id,),
            ).fetchall()
        return [str(row["job_id"]) for row in rows]

    def get_workflow_input_links(self, workflow_id: str) -> list[WorkflowInputLink]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM job_input_references
                WHERE workflow_id = ?
                ORDER BY created_at, reference_id
                """,
                (workflow_id,),
            ).fetchall()
        return [self._workflow_input_link_from_row(row) for row in rows]

    @staticmethod
    def _write_workflow_relations(
        connection: sqlite3.Connection, workflow: Workflow
    ) -> None:
        connection.executemany(
            "INSERT INTO workflow_jobs (workflow_id, job_id, position) VALUES (?, ?, ?)",
            [
                (workflow.workflow_id, job_id, position)
                for position, job_id in enumerate(workflow.job_ids)
            ],
        )
        connection.executemany(
            """
            INSERT INTO job_input_references
            (reference_id, workflow_id, target_job_id, target_input_name, source_job_id,
             source_artifact_id, source_kind, source_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    link.link_id,
                    link.workflow_id,
                    link.target_job_id,
                    link.target_input_name,
                    link.source_job_id,
                    link.source_artifact_id,
                    link.source_kind,
                    link.source_name,
                    _timestamp(link.created_at),
                )
                for link in workflow.input_links
            ],
        )
