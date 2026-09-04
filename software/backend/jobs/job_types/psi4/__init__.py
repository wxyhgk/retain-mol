"""Result collectors for the built-in Psi4 JobTypes."""

from .common import Psi4CollectionContext, Psi4OperationOutput
from .frequency_collector import Psi4FrequencyCollector
from .irc_collector import Psi4IrcCollector
from .ts_collector import Psi4TransitionStateCollector
from .executor import (
    Psi4IrcExecutor,
    Psi4SingleOperationExecutor,
    resolve_psi4_executor,
)
from .request import (
    PreparedPsi4JobV1,
    Psi4FrequencyJobDataV1,
    Psi4IrcJobDataV1,
    Psi4JobAtomV1,
    Psi4StructureV1,
    Psi4TransitionStateJobDataV1,
    prepare_psi4_job_v1,
)


def resolve_psi4_collector(job_type: str):
    """Resolve the exact collector owned by one persisted Psi4 JobType."""
    collectors = {
        "psi4-frequency": Psi4FrequencyCollector,
        "psi4-irc": Psi4IrcCollector,
        "psi4-ts-refine": Psi4TransitionStateCollector,
    }
    try:
        return collectors[job_type]()
    except KeyError as exc:
        raise ValueError(f"Unsupported Psi4 JobType '{job_type}'") from exc


__all__ = [
    "Psi4CollectionContext",
    "Psi4FrequencyCollector",
    "Psi4IrcExecutor",
    "Psi4IrcCollector",
    "Psi4OperationOutput",
    "PreparedPsi4JobV1",
    "Psi4FrequencyJobDataV1",
    "Psi4IrcJobDataV1",
    "Psi4JobAtomV1",
    "Psi4StructureV1",
    "Psi4TransitionStateCollector",
    "Psi4TransitionStateJobDataV1",
    "Psi4SingleOperationExecutor",
    "resolve_psi4_collector",
    "resolve_psi4_executor",
    "prepare_psi4_job_v1",
]
