"""Checksum evaluation for serialized models.

Amplitude points are final-state four-vectors in a `phase_space` domain.
Lineshape points remain named scalars (for example an invariant mass squared).
"""

function four_momentum(fv)
    return (fv["px"], fv["py"], fv["pz"], fv["E"])
end

function mass_squared(a, b)
    E = a[4] + b[4]
    px, py, pz = a[1] + b[1], a[2] + b[2], a[3] + b[3]
    return E^2 - px^2 - py^2 - pz^2
end

function mandelstam_from_four_vectors(four_vectors)
    ps = sort(four_vectors; by=v -> v["index"])
    p1, p2, p3 = four_momentum.(ps)
    σ1 = mass_squared(p2, p3)
    σ2 = mass_squared(p3, p1)
    σ3 = mass_squared(p1, p2)
    return MandelstamTuple{Float64}((σ1, σ2, σ3))
end

function decay_model(target)
    return target isa HadronicUnpolarizedIntensity ? target.model : target
end

function evaluate_checksum_target(target, parameter_point)
    if haskey(parameter_point, "four_vectors")
        σs = mandelstam_from_four_vectors(parameter_point["four_vectors"])
        return unpolarized_intensity(decay_model(target), σs)
    end
    parameters = array2dict(
        parameter_point["parameters"];
        key="name",
        apply=v -> v["value"],
    )
    return target(parameters)
end
