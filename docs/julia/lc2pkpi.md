---
file_format: mystnb
kernelspec:
  language: julia
  name: julia-amplitude-serialization-1.10
---

# Julia

## Install packages

```{code-cell} julia
:tags: [hide-input, hide-output, scroll-output]
import Pkg
Pkg.activate(@__DIR__)
Pkg.instantiate()
```

```{code-cell} julia
using ThreeBodyDecaysIO
using ThreeBodyDecaysIO.ThreeBodyDecays
using HadronicLineshapes
using JSON
using Parameters
using DataFrames
using Plots
using Test
```

## Function definitions

```{code-cell} julia
@with_kw struct BreitWignerWidthExpLikeBugg <: HadronicLineshapes.AbstractFlexFunc
    m::Float64
    Γ::Float64
    γ::Float64
end
function (BW::BreitWignerWidthExpLikeBugg)(σ)
    mK = 0.493677
    mπ = 0.13957018
    σA = mK^2 - mπ^2 / 2
    @unpack m, Γ, γ = BW
    Γt = (σ - σA) / (m^2 - σA) * Γ * exp(-γ * σ)
    1 / (m^2 - σ - 1im * m * Γt)
end
function ThreeBodyDecaysIO.dict2instance(::Type{BreitWignerWidthExpLikeBugg}, dict)
    @unpack mass, width, slope = dict
    return BreitWignerWidthExpLikeBugg(mass, width, slope)
end
```

## Implementation

Get the JSON content

```{code-cell} julia
input = open(joinpath(@__DIR__, "..", "..", "Lc2ppiK.json")) do io
    JSON.parse(io)
end
```

Built functions will be stored in workspace:

```{code-cell} julia
workspace = Dict{String,Any}()
```

Build functions from JSON array:

```{code-cell} julia
@unpack functions = input
for fn in functions
    @unpack name, type = fn
    instance_type = eval(Symbol(type))
    workspace[name] = dict2instance(instance_type, fn)
end
```

Build distributions from JSON array:

```{code-cell} julia
@unpack distributions = input
for dist in distributions
    @unpack name, type = dist
    instance_type = eval(Symbol(type))
    workspace[name] = dict2instance(instance_type, distributions[1]; workspace)
end
```

Perform validation:

```{code-cell} julia
@unpack misc, parameter_points = input
@unpack amplitude_model_checksums = misc

# map(amplitude_model_checksums) do check_point_info
let check_point_info = amplitude_model_checksums[1]
    @unpack name, value, distribution = check_point_info
    #
    # pull distribution
    dist = workspace[distribution]

    # pull correct parameter point
    parameter_points_dict = array2dict(parameter_points; key="name")
    # find the point in the list of points
    parameter_point = parameter_points_dict[name]
    # compute, compare
    _parameters = array2dict(parameter_point["parameters"];
        key="name", apply=v -> v["value"])
    @assert value ≈ dist(_parameters) "Check-point validation failed with $distribution 🥕"
    return "🟢"
end
```

Plot the model:

```{code-cell} julia
let
    model = workspace["my_model_for_reaction_intensity"].model
    plot(masses(model), Base.Fix1(unpolarized_intensity, model))
end
```
