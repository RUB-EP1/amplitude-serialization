"""Helpers for amplitude checksums on four-vectors."""

from __future__ import annotations

# cspell:ignore nonnegative

import math
from collections.abc import Mapping
from typing import Any

import sympy as sp


def four_vectors_to_sigmas(four_vectors: list[Mapping[str, Any]]) -> dict[int, float]:
    """Return σ_k = (p_i + p_j)² from final-state four-vectors."""
    momenta = {int(item["index"]): item for item in four_vectors}

    def add(i: int, j: int) -> float:
        a, b = momenta[i], momenta[j]
        energy = a["E"] + b["E"]
        px = a["px"] + b["px"]
        py = a["py"] + b["py"]
        pz = a["pz"] + b["pz"]
        return energy**2 - px**2 - py**2 - pz**2

    return {1: add(2, 3), 2: add(3, 1), 3: add(1, 2)}


def identity_kinematic_map(*_args, **_kwargs):
    return {
        sp.Symbol(f"sigma{i}", nonnegative=True): sp.Symbol(
            f"sigma{i}", nonnegative=True
        )
        for i in (1, 2, 3)
    }


def install_four_vector_kinematics() -> None:
    """Allow compiling distributions that no longer store (m, φ, θ) triples."""
    from ampform_dpd.io.serialization import compiler, kinematics

    original = kinematics.formulate_kinematic_map

    def formulate_kinematic_map(workspace, distribution=None):
        try:
            return original(workspace, distribution)
        except (TypeError, ValueError):
            return identity_kinematic_map(workspace, distribution)

    kinematics.formulate_kinematic_map = formulate_kinematic_map
    compiler.formulate_kinematic_map = formulate_kinematic_map


def evaluate_checksum(compiled, checksum: Mapping[str, Any], points: Mapping[str, Any]):
    from ampform_dpd.io.serialization.validation import _to_number, _transform_point

    point = points[checksum["point"]]
    target = checksum["distribution"]
    function = compiled.functions[target]
    if "four_vectors" in point:
        sigmas = four_vectors_to_sigmas(point["four_vectors"])
        coordinates = compiled.coordinates.get(target)
        if coordinates is None:
            inputs = {f"sigma{k}": value for k, value in sigmas.items()}
        else:
            inputs = {
                name: sigmas[int(name.removeprefix("sigma"))] for name in coordinates
            }
        return function(inputs)
    parameters = {
        item["name"]: _to_number(item["value"]) for item in point["parameters"]
    }
    return function(_transform_point(target, parameters, compiled))


def label_diff(difference: float) -> str:
    magnitude = abs(complex(difference))
    if magnitude < 1e-10 or math.isclose(magnitude, 0.0, abs_tol=0.0):
        return "🟢"
    if magnitude < 1e-2:
        return "🟡"
    return "🔴"
