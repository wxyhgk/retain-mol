"""引擎契约边界校验回归：multiplicity 与 symbol 不再放行非法值。

原缺陷：engines/xtb/contracts.py 的公共契约缺少 Job 路径已有的边界校验，
multiplicity 可为 0/负数（变成 --uhf -1），symbol 任意字符串可写坏 XYZ 文件。
"""

import pytest
from pydantic import ValidationError

from software.backend.engines.xtb.contracts import XtbAtom, XtbOptimizationRequest


def _atom(**overrides):
    payload = {"id": "a1", "symbol": "C", "x": 0.0, "y": 0.0, "z": 0.0}
    payload.update(overrides)
    return payload


def test_multiplicity_zero_rejected():
    with pytest.raises(ValidationError):
        XtbOptimizationRequest(atoms=[_atom()], multiplicity=0)


def test_multiplicity_negative_rejected():
    with pytest.raises(ValidationError):
        XtbOptimizationRequest(atoms=[_atom()], multiplicity=-1)


def test_multiplicity_default_and_valid_pass():
    assert XtbOptimizationRequest(atoms=[_atom()]).multiplicity == 1
    assert XtbOptimizationRequest(atoms=[_atom()], multiplicity=3).multiplicity == 3


@pytest.mark.parametrize("bad_symbol", ["", "C 1", "C\n2", "Uue", "C;rm"])
def test_malformed_symbol_rejected(bad_symbol):
    with pytest.raises(ValidationError):
        XtbAtom(**_atom(symbol=bad_symbol))


@pytest.mark.parametrize("good_symbol", ["C", "H", "Cl", "br", "SI"])
def test_element_symbols_pass(good_symbol):
    assert XtbAtom(**_atom(symbol=good_symbol)).symbol == good_symbol
