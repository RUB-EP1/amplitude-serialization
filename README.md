# Cascade amplitude models in json format

The zero version of the model tries to keep the structures as flatt as possible for readability purpose.

Any value in the dictionary can be replaced by string, that corresponds to a key translated later in the file.
It enables keeping consistent numerical values for masses, and lineshape parametrizations.

[Detailed description of the format!](description.md)

## Example 

A realistic decay description for Lc2pKpi amplitude is produced with [`ThreeBodyDecayIO.jl`](https://github.com/mmikhasenko/ThreeBodyDecaysIO.jl) using the default model of the Lc2ppiK decays, 
[`Lc2ppiKSemileptonicModelLHCb.jl`](https://github.com/mmikhasenko/Lc2ppiKSemileptonicModelLHCb.jl).

For a description of a three body decay amplitude, one must provide several mandatory section at the root of the object,
`"kinematics"`, `"chains"`, `"reference_topology"`, and `"validation"` sections.

### Kinematics Overview

The "kinematics" section specifies the initial state and final state particles involved in the decay processes:

```json
  "kinematics": {
    "spins": ["1/2", "0", "0", "1/2"],
    "indices": [1, 2, 3, 0],
    "names": ["p", "pi", "K", "Lc"],
    "masses": [0.938272046, 0.13957018, 0.493677, 2.28646]
  }
```

The `indices` array serves as the primary identifier for particles. The `names` field gives optional labels, these are not identifiers , do not have to be unique. The order in all arrays of the kinematic section matters: the index 1 corresponds to the symbol "p" (proton), mass of `0.938272046`, and spin "1/2". The index zero is reserved for the decay particle in the initial state.

Spins are presented in conventional notation (e.g., "1/2") for familiarity. Most of implementations use Integers to store twice the value of the spin.

### Decay chains

Each decay chain is described by a JSON object containing five mandatory fields:
- `"topology"`: defines nodes and edges of the decay graph, order of particles,
- `"propagators"`: for every decay node(!) describes parametrization of the decay particle
- `"vertices"`: for every node, describes parametrization of the coupling and form-factor
- `"weight"`: complex coefficient multiplying the chain
- `"name"`: name of the chain


### Topology

Tolopogy of a decay is a tree of intermediate decays given in a compact form using brackets.
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

The `appendix` gives definition to the text keys used elsewhere in the desciption. These definions are inserted recursively, while processing the json file.


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
The string values that are not expanded in the  `"appendix"` should be identifiers declared in the serialization document.

### Validation Block

The last block `validation` provides reference values of the amplitude for every chain at a single kinematic point.
This section acts as a model integrity check, providing reference amplitudes for comparison against calculated values.


<details>
  <summary>See the full example</summary>
  
```json
{
  "kinematics": {
    "spins": ["1/2", "0", "0", "1/2"],
    "indices": [1, 2, 3, 0],
    "names": ["p", "pi", "K", "Lc"],
    "masses": [0.938272046, 0.13957018, 0.493677, 2.28646]
  },
  "reference_topology": [[1, 2], 3],
  "chains": [
    {
      "propagators": [
        {
          "spin": "1/2",
          "node": [1, 2],
          "parametrization": "L(1405)_Flatte"
        }
      ],
      "weight": "7.38649400481717 + 1.971018433257411i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": ""
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": ""
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(1405)"
    },
    {
      "propagators": [
        {
          "spin": "1/2",
          "node": [1, 2],
          "parametrization": "L(1405)_Flatte"
        }
      ],
      "weight": "-3.2332358574805515 + 2.2557724553615772i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["-1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": ""
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": ""
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(1405)"
    },
    {
      "propagators": [
        {
          "spin": "3/2",
          "node": [1, 2],
          "parametrization": "L(1520)_BW"
        }
      ],
      "weight": "0.146999 + 0.022162i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["-1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "-",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(1520)"
    },
    {
      "propagators": [
        {
          "spin": "3/2",
          "node": [1, 2],
          "parametrization": "L(1520)_BW"
        }
      ],
      "weight": "-0.0803435 + 0.7494165i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "-",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(1520)"
    },
    {
      "propagators": [
        {
          "spin": "1/2",
          "node": [1, 2],
          "parametrization": "L(1600)_BW"
        }
      ],
      "weight": "4.929406127531439 - 0.5956915012088891i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "-",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(1600)"
    },
    {
      "propagators": [
        {
          "spin": "1/2",
          "node": [1, 2],
          "parametrization": "L(1600)_BW"
        }
      ],
      "weight": "-3.4228557332438796 - 2.179858885546952i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["-1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "-",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(1600)"
    },
    {
      "propagators": [
        {
          "spin": "1/2",
          "node": [1, 2],
          "parametrization": "L(1670)_BW"
        }
      ],
      "weight": "-0.24012285628923374 - 0.10230279488850731i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["-1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(1670)"
    },
    {
      "propagators": [
        {
          "spin": "1/2",
          "node": [1, 2],
          "parametrization": "L(1670)_BW"
        }
      ],
      "weight": "-0.40374241570833247 + 0.7154739757283278i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(1670)"
    },
    {
      "propagators": [
        {
          "spin": "3/2",
          "node": [1, 2],
          "parametrization": "L(1690)_BW"
        }
      ],
      "weight": "-0.192886 - 0.0551175i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["-1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "-",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(1690)"
    },
    {
      "propagators": [
        {
          "spin": "3/2",
          "node": [1, 2],
          "parametrization": "L(1690)_BW"
        }
      ],
      "weight": "-1.365296 - 0.1768065i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "-",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(1690)"
    },
    {
      "propagators": [
        {
          "spin": "1/2",
          "node": [1, 2],
          "parametrization": "L(2000)_BW"
        }
      ],
      "weight": "-3.0661953154540726 - 2.684313105886122i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(2000)"
    },
    {
      "propagators": [
        {
          "spin": "1/2",
          "node": [1, 2],
          "parametrization": "L(2000)_BW"
        }
      ],
      "weight": "-5.667359734940468 - 5.38391527459506i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["-1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "1/2"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "L(2000)"
    },
    {
      "propagators": [
        {
          "spin": "3/2",
          "node": [1, 2],
          "parametrization": "D(1232)_BW"
        }
      ],
      "weight": "-3.3890955 + 1.5259025i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["-1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["1/2", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "D(1232)"
    },
    {
      "propagators": [
        {
          "spin": "3/2",
          "node": [1, 2],
          "parametrization": "D(1232)_BW"
        }
      ],
      "weight": "-6.4935965 + 2.264168i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["1/2", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "D(1232)"
    },
    {
      "propagators": [
        {
          "spin": "3/2",
          "node": [1, 2],
          "parametrization": "D(1600)_BW"
        }
      ],
      "weight": "5.7007925 - 1.5627555i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["-1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["1/2", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "D(1600)"
    },
    {
      "propagators": [
        {
          "spin": "3/2",
          "node": [1, 2],
          "parametrization": "D(1600)_BW"
        }
      ],
      "weight": "3.3646055 - 0.5011915i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["1/2", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "D(1600)"
    },
    {
      "propagators": [
        {
          "spin": "3/2",
          "node": [1, 2],
          "parametrization": "D(1700)_BW"
        }
      ],
      "weight": "-5.18914 - 0.717436i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["-1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["1/2", "0"],
          "parity_factor": "-",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "D(1700)"
    },
    {
      "propagators": [
        {
          "spin": "3/2",
          "node": [1, 2],
          "parametrization": "D(1700)_BW"
        }
      ],
      "weight": "-6.437051 - 1.052785i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["1/2", "0"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["1/2", "0"],
          "parity_factor": "-",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "D(1700)"
    },
    {
      "propagators": [
        {
          "spin": "0",
          "node": [1, 2],
          "parametrization": "K(700)_BuggBW"
        }
      ],
      "weight": "0.068908 + 2.521444i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["0", "1/2"],
          "node": [[1, 2], 3],
          "formfactor": ""
        },
        {
          "type": "parity",
          "helicities": ["0", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": ""
        }
      ],
      "topology": [[1, 2], 3],
      "name": "K(700)"
    },
    {
      "propagators": [
        {
          "spin": "0",
          "node": [1, 2],
          "parametrization": "K(700)_BuggBW"
        }
      ],
      "weight": "-2.68563 + 0.03849i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["0", "-1/2"],
          "node": [[1, 2], 3],
          "formfactor": ""
        },
        {
          "type": "parity",
          "helicities": ["0", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": ""
        }
      ],
      "topology": [[1, 2], 3],
      "name": "K(700)"
    },
    {
      "propagators": [
        {
          "spin": "1",
          "node": [1, 2],
          "parametrization": "K(892)_BW"
        }
      ],
      "weight": "0.6885560139393164 - 0.5922539890384868i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["-1", "-1/2"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "K(892)"
    },
    {
      "propagators": [
        {
          "spin": "1",
          "node": [1, 2],
          "parametrization": "K(892)_BW"
        }
      ],
      "weight": "-0.4198173614898905 - 2.398905956940163i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["0", "1/2"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "K(892)"
    },
    {
      "propagators": [
        {
          "spin": "1",
          "node": [1, 2],
          "parametrization": "K(892)_BW"
        }
      ],
      "weight": "0.5773502691896258 + 0.0i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["0", "-1/2"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "K(892)"
    },
    {
      "propagators": [
        {
          "spin": "1",
          "node": [1, 2],
          "parametrization": "K(892)_BW"
        }
      ],
      "weight": "-1.8137146937446735 - 1.9014511500518056i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["1", "1/2"],
          "node": [[1, 2], 3],
          "formfactor": "BlattWeisskopf(resonance)"
        },
        {
          "type": "parity",
          "helicities": ["0", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": "BlattWeisskopf(b-decay)"
        }
      ],
      "topology": [[1, 2], 3],
      "name": "K(892)"
    },
    {
      "propagators": [
        {
          "spin": "0",
          "node": [1, 2],
          "parametrization": "K(1430)_BuggBW"
        }
      ],
      "weight": "-6.71516 + 10.479411i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["0", "1/2"],
          "node": [[1, 2], 3],
          "formfactor": ""
        },
        {
          "type": "parity",
          "helicities": ["0", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": ""
        }
      ],
      "topology": [[1, 2], 3],
      "name": "K(1430)"
    },
    {
      "propagators": [
        {
          "spin": "0",
          "node": [1, 2],
          "parametrization": "K(1430)_BuggBW"
        }
      ],
      "weight": "0.219754 + 8.741196i",
      "vertices": [
        {
          "type": "helicity",
          "helicities": ["0", "-1/2"],
          "node": [[1, 2], 3],
          "formfactor": ""
        },
        {
          "type": "parity",
          "helicities": ["0", "0"],
          "parity_factor": "+",
          "node": [1, 2],
          "formfactor": ""
        }
      ],
      "topology": [[1, 2], 3],
      "name": "K(1430)"
    }
  ],
  "appendix": {
    "BlattWeisskopf(resonance)": {
      "type": "BlattWeisskopf",
      "radius": 1.5
    },
    "BlattWeisskopf(b-decay)": {
      "type": "BlattWeisskopf",
      "radius": 5.0
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
    "D(1232)_BW": {
      "l": 1,
      "mb": 0.13957018,
      "type": "BreitWigner",
      "mass": 1.232,
      "ma": 0.938272046,
      "width": 0.117
    },
    "L(1520)_BW": {
      "l": 2,
      "mb": 0.938272046,
      "type": "BreitWigner",
      "mass": 1.518467,
      "ma": 0.493677,
      "width": 0.015195
    },
    "L(1600)_BW": {
      "l": 1,
      "mb": 0.938272046,
      "type": "BreitWigner",
      "mass": 1.63,
      "ma": 0.493677,
      "width": 0.25
    },
    "L(2000)_BW": {
      "l": 0,
      "mb": 0.938272046,
      "type": "BreitWigner",
      "mass": 1.98819,
      "ma": 0.493677,
      "width": 0.17926
    },
    "D(1600)_BW": {
      "l": 1,
      "mb": 0.13957018,
      "type": "BreitWigner",
      "mass": 1.64,
      "ma": 0.938272046,
      "width": 0.3
    },
    "D(1700)_BW": {
      "l": 2,
      "mb": 0.13957018,
      "type": "BreitWigner",
      "mass": 1.69,
      "ma": 0.938272046,
      "width": 0.38
    },
    "K(892)_BW": {
      "l": 1,
      "mb": 0.493677,
      "type": "BreitWigner",
      "mass": 0.8955,
      "ma": 0.13957018,
      "width": 0.047299999999999995
    },
    "K(700)_BuggBW": {
      "gamma": 0.94106,
      "type": "BuggBreitWignerMinL{@NamedTuple{m::Float64, Γ::Float64, γ::Float64}}",
      "mass": 0.824,
      "width": 0.478
    },
    "K(1430)_BuggBW": {
      "gamma": 0.020981,
      "type": "BuggBreitWignerMinL{@NamedTuple{m::Float64, Γ::Float64, γ::Float64}}",
      "mass": 1.375,
      "width": 0.19
    },
    "L(1670)_BW": {
      "l": 0,
      "mb": 0.938272046,
      "type": "BreitWigner",
      "mass": 1.67,
      "ma": 0.493677,
      "width": 0.03
    }
  },
  "validation": {
    "kinematic_point": {
      "masses_angles": {
        "kinematic_point": [
          {
            "theta": 0.0,
            "phi": 0.0,
            "mass": 2.28646,
            "node": [[1, 2], 3]
          },
          {
            "theta": 0.23678498926410071,
            "phi": 0.0,
            "mass": 1.7058127512193626,
            "node": [1, 2]
          }
        ]
      },
      "spin_projections": ["-1/2", "0", "0", "1/2"]
    },
    "chains_values": [
      "0.09389266961789793 - 0.04444705194077252i",
      "1.8571303475689018 - 0.8791311329744668i",
      "3.495920386153536 - 1.6621763488223895i",
      "1.777402925980676 - 0.8450870670837528i",
      "0.12310500032232206 + 0.45678965772531055i",
      "0.7791574963528171 + 2.891118030471891i",
      "-5.823582950121089 - 1.1382638760343922i",
      "-0.2944283101312339 - 0.05754826751411962i",
      "-1.268163307415927 - 0.18551935112595022i",
      "-0.6447621582430986 - 0.09432212438913892i",
      "-0.04778942695357844 - 0.007824626304773727i",
      "-0.9452409378665694 - 0.15476555335062303i",
      "-0.07018362000955466 + 0.056344615892922126i",
      "0.40521434793619865 - 0.3253130400748459i",
      "-0.055066194114012104 + 0.1403939638292559i",
      "0.31793190402831634 - 0.8105829893001436i",
      "0.03312110072401607 - 0.4254498634584363i",
      "-0.05865524970987039 + 0.7534431958684904i",
      "-0.0 + 0.0i",
      "1.9607019086003359 - 2.284190639309832i",
      "-0.0 + 0.0i",
      "-0.0 + 0.0i",
      "10.6954516256848 - 6.211539520339878i",
      "-0.0 + 0.0i",
      "0.0 + 0.0i",
      "-0.9942263897808797 - 0.10224685775008081i"
    ]
  }
}
```
</details>
