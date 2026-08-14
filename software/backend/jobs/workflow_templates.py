"""Concrete workflow templates built from generic Job and Workflow services."""

from __future__ import annotations

from collections.abc import Callable

from .errors import InvalidJobInputError
from .models import Job, Workflow
from .workflow_definitions import WorkflowDefinitionManager

CreateCalculationDraft = Callable[..., Job]
DeleteJob = Callable[[str], None]


class WorkflowTemplateManager:
    """Creates opinionated workflow shapes without bloating JobService."""

    def __init__(
        self,
        definitions: WorkflowDefinitionManager,
        create_calculation_draft: CreateCalculationDraft,
        delete_job: DeleteJob,
    ) -> None:
        self.definitions = definitions
        self.create_calculation_draft = create_calculation_draft
        self.delete_job = delete_job

    def create_ts_preparation(
        self,
        name: str,
        reactant_job_id: str,
        reactant_artifact_id: str,
        product_job_id: str,
        product_artifact_id: str,
    ) -> tuple[Workflow, Job]:
        """Create two endpoint edges and one TS-initial-guess draft Job."""
        normalized_name = _required_text(name, "name")
        if reactant_job_id == product_job_id:
            raise InvalidJobInputError(
                "Reactant and product must come from different jobs"
            )

        reactant_artifact = self.definitions.require_structure_artifact(
            reactant_job_id,
            reactant_artifact_id,
            "reactant",
        )
        product_artifact = self.definitions.require_structure_artifact(
            product_job_id,
            product_artifact_id,
            "product",
        )
        target = self.create_calculation_draft(
            "ts-initial-guess",
            "retainmol",
            {"strategy": "double-ended", "schemaVersion": 1},
            metadata={
                "name": f"{normalized_name} · TS initial guess",
                "description": "Created from explicit reactant and product artifacts",
                "workflowRole": "ts-initial-guess",
            },
        )

        input_links = [
            _artifact_link(
                reactant_job_id,
                reactant_artifact.artifact_id,
                reactant_artifact.name,
                target.job_id,
                "reactant",
            ),
            _artifact_link(
                product_job_id,
                product_artifact.artifact_id,
                product_artifact.name,
                target.job_id,
                "product",
            ),
        ]
        try:
            workflow = self.definitions.create(
                normalized_name,
                [reactant_job_id, product_job_id, target.job_id],
                input_links,
            )
        except Exception:
            self.delete_job(target.job_id)
            raise
        return workflow, target


def _artifact_link(
    source_job_id: str,
    source_artifact_id: str,
    source_name: str,
    target_job_id: str,
    target_input_name: str,
) -> dict[str, str]:
    return {
        "sourceJobId": source_job_id,
        "sourceArtifactId": source_artifact_id,
        "sourceKind": "artifact",
        "sourceName": source_name,
        "targetJobId": target_job_id,
        "targetInputName": target_input_name,
    }


def _required_text(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value.strip()
