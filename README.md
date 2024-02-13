# Cascade amplitude models in json format

The zero version of the model tries to keep the structures as flatt as possible for readability purpose.

Any value in the dictionary can be replaced by string, that corresponds to a key translated later in the file.
It enables keeping consistent numerical values for masses, and lineshape parametrizations.

```jsonc
{
  //   general information about the decay
  "kinematics": {
    "names": ["p", "K", "π", "Lc"],
    "spins": ["1/2", "0", "0", "1/2"],
    "indices": [1, 2, 3, 0],
    "masses": ["mp", "mK-", "mpi+", "mLc"]
  },


  //   decay chains are given as a list
  //   that specifies
  "chains": [
    {
      "weight": "1.1+1.3im",
      "topology": "Lambda_decay_topology",
      "vertices": [
        {
          "S": "1/2",
          "node": [[2, 3], 1],
          "L": "1",
          "type": "LS"
        },
        {
          "helicities": ["1/2", "0"],
          "prodparity": "+",
          "node": [2, 3],
          "type": "parity"
        }
      ],
      "propagators": [
        {
          "node": [2, 3],
          "lineshape": "BW_L1520",
          "spin": "3/2"
        }
      ]
    },
    {
      "weight": "1.1+1.3im",
      "topology": "Lambda_decay_topology",
      "vertices": [
        {
          "S": "1/2",
          "node": [[2, 3], 1],
          "L": "1",
          "type": "LS"
        },
        {
          "helicities": ["1/2", "0"],
          "prodparity": "+",
          "node": [2, 3],
          "type": "parity"
        }
      ],
      "propagators": [
        {
          "node": [2, 3],
          "lineshape": "BW_L1520",
          "spin": "3/2"
        }
      ]
    }
  ],

  //   lineshapes are translated to structures with parameters
  "BW_L1520": {
    "type": "BW",
    "mass": 1.52,
    "decays": [
      {
        "gsq": 1.3,
        "l": "1",
        "m1": 0.94,
        "m2": 0.49,
        "r": 1.5
      }
    ]
  },
  "BW_L1405": {
    "type": "BW",
    "mass": 1.4,
    "decays": [
      {
        "gsq": 0.4,
        "l": "0",
        "m1": "mp",
        "m2": "mK-",
        "r": 1.5
      },
      {
        "gsq": 0.3,
        "l": "1",
        "m1": "mSigma",
        "m2": "mpi+",
        "r": 1.5
      }
    ]
  },

  //   masses used in the construction
  "mp": 0.94,
  "mpi+": 0.14,
  "mK-": 0.49,
  "mLc": 2.3,
  "mSigma": 1.23,

  //   decay topologies
  "Lambda_decay_topology": [[2, 3], 1],

}
```
