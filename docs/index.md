# Cascade amplitude models in json format

The zero version of the model tries to keep the structures as flatt as possible for readability purpose.

Any value in the dictionary can be replaced by string, that corresponds to a key translated later in the file.
It enables keeping consistent numerical values for masses, and lineshape parametrizations.

- [Detailed description of the format!](description.md)
- Notes on [HS3](HS3.md)

## Example

A realistic decay description for Lc2pKpi amplitude is produced with [`ThreeBodyDecayIO.jl`](https://github.com/mmikhasenko/ThreeBodyDecaysIO.jl) using the default model of the Lc2ppiK decays,
[`Lc2ppiKSemileptonicModelLHCb.jl`](https://github.com/mmikhasenko/Lc2ppiKSemileptonicModelLHCb.jl).

For a description of a three body decay amplitude, one must provide several mandatory section at the root of the object,
`"kinematics"`, `"chains"`, `"reference_topology"`, and `"validation"` sections.

### Kinematics Overview

The `kinematics` section details the particle states involved in decay processes:

- `initial_state`: Specifies the decaying particle at the start of the process. Contains keys for `index` (unique identifier), `name` (label), `spin` (quantum spin number), and `mass` (in GeV/c²).
- `final_state`: An array detailing each resulting particle from the decay. Each entry includes the same keys as `initial_state`, defining the properties of these particles.

For example, the kinematics of the decay Lc2pKpi would look like,

```json
"kinematics": {
    "initial_state" : {
        "index" : 0,
        "name" : "Lc",
        "spin" : "1/2",
        "mass" : 2.28646
    },
    "final_state" : [
    {
        "index" : 1,
        "name" : "p",
        "spin" : "1/2",
        "mass" : 0.938272046
    },
    {
        "index" : 2,
        "name" : "pi",
        "spin" : "0",
        "mass" : 0.13957018
    },
    {
        "index" : 3,
        "name" : "K",
        "spin" : "0",
        "mass" : 0.493677
    }]
}
```

The `index` field serves as the primary identifier for particles.
The `name` field gives an label, which is not identifiers, it does not have to be unique.
The index zero is reserved for the decay particle in the initial state.
Spins are presented in conventional notation (e.g., "1/2") for familiarity. Most of implementations use Integers to store twice the value of the spin.

### Decay chains

Each decay chain is described by a JSON object containing five mandatory fields:

- `"topology"`: defines nodes and edges of the decay graph, order of particles,
- `"propagators"`: for every decay node(!) describes parametrization of the decay particle
- `"vertices"`: for every node, describes parametrization of the coupling and form-factor
- `"weight"`: complex coefficient multiplying the chain
- `"name"`: name of the chain

### Topology

Topology of a decay is a tree of intermediate decays given in a compact form using brackets.
In this notation, each pair of brackets indicate the node and it's children.
The name of the node is simply given by its decay in the same bracket notations.

```json
  "topology": [[1, 2], 3],
```

Here the 3-body decay process described by the notation `[[1,2],3]`,

```
      0
      |
  [[1,2],3]
     /  \
    /    3
  [1,2]
  /  \
 /    2
1
```

- The innermost pair `[1,2]` represents the decay of a parent particle into particles 1 and 2.
- The next level `[[1,2],3]` indicates that the products of the first decay, along with particle 3 are combined into a new node.
- The starting node is also associated with the initial state decay particle.

Nodes of this example topology are `[1,2]` and `[[1,2],3]`.
They are referenced when describing the decay vertices and propagators.
The order matters, i.e. `[[1,2],3] != [[2,1],3] != [3,[2,1]]`.

Spins of the final state particles are quantized in the frames defined by the `"reference_topology"`,
i.e. there are no Wigner rotations for particles in the reference topology, while for the chains with different topology,
quantization axes must be adjusted by using appropriate wigner rotations.

### Appendix

The `appendix` gives definition to the text keys used elsewhere in the description. These definitions are inserted recursively, while processing the json file.

### Complex numbers

The use of strings for complex numbers follows physics conventions for ease of reading.

```json
  "appendix": {
    "BlattWeisskopf(resonance)": {
      "type": "BlattWeisskopf",
      "radius": 1.5
    },
    "L(1405)_Flatte": {
      "type": "Flatte1405{@NamedTuple{m::Float64, Γ::Float64}}",
      "mass": 1.4051,
      "width": 0.0505
    },
    "L(1690)_BW": {
      "l": 2,
      "mb": 0.938272046,
      "type": "BreitWigner",
      "mass": 1.69,
      "ma": 0.493677,
      "width": 0.07
    },
  }
```

The string values that are not expanded in the `"appendix"` should be identifiers declared in the serialization document.

### Validation Block

The last block `validation` provides reference values of the amplitude for every chain at a single kinematic point.
This section acts as a model integrity check, providing reference amplitudes for comparison against calculated values.

<details>
  <summary>See the full example</summary>

```json
{{< include ../models/Lc2ppiK.json >}}
```

</details>
