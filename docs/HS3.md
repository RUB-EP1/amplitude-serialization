# Compatibility with HS3

In parallel to development of the model description format, compatibility with HEP Statistics Serialization Standard (HS3) is investigated.

- [HS3 repository](https://github.com/hep-statistics-serialization-standard/hep-statistics-serialization-standard)
- Serialization of hadronic models, [discussion #34](https://github.com/hep-statistics-serialization-standard/hep-statistics-serialization-standard/discussions/34)
- Cascade models in HS3, [discussion #36](https://github.com/hep-statistics-serialization-standard/hep-statistics-serialization-standard/discussions/36)

## Support in ROOT, what is missing

- Class: `RooAmplitudeModelPDF`
  - Implementation of math
  - Exporter: `RooAmplitudeModelPDF::Streamer`
  - Importer: `RooAmplitudeModelPDF::Factory`
- All lineshapes: `BreitWigner`, `BlattWeisskopf`

## Example of HS3 file

- [HS3_base.json](../models/HS3_base.json) give description of basic interfaces of the model variables and parameters consistently with HS3. It sets default value of variable, and describes a validation point in HS3 consistent way.
- [HS3_extended.json](../models/HS3_extended.json) prototypes
  - adding jacobian (prior) for phase space generation,
  - replacing phase space variables

## Parameters of the model

The model parameters have to be listed in the parameter block of distributions.

```jsonc
"distributions": [
  {
    "name": "my_model_for_reaction_intensity",
    "type": "hadronic_cross_section_unpolarized_dist",
    "model_description": {
    },
    "variables": [
    ],
    "parameters": ["L_1520_mass"]
  }
]
```

The default values of the parameters are not mandatory, however, they can be listed as one of the element of the `parameter_points` array.

```jsonc
"parameter_points": [
  {
    "name": "default_values_of_my_model",
    "parameters": [
      {
        "name": "L_1520_mass",
        "value": 1.52
      }
    ]
  }
]
```

The validation block has to include

```jsonc
"parameter_points": [
  {
    "name": "validation_point",
    "parameters": [
      {
        "name": "L_1520_mass",
        "value": 4.6
      },
      {
        "name": "L_1520_mass",
        "value": 4.6
      },
      {}
    ]
  },
  {}
]
```

## Sampling from the model

To sample from the model using the kinematic variables defined in `variable` section, a few sections has to be added.

```jsonc
"likelihoods": [
  {
    "name": "my_nll",
    "pdfs": ["my_model_for_reaction_intensity"],
    "datasets": []
  }
]
```

**Likelihood** section clarifies how the log likelihood is computed from the `pdfs` .

```jsonc
"analyses": [
  {
    "name": "my_ana",
    "parameter_domain": "default",
    "prior": "my_prior_dist"
  }
]
```

**Analyses** specifies how kinematic variables are distributed within the phase space, using priors (here, `"prior": "my_prior_dist"`) to influence their sampling distributions.

The priors are given in the list of distributions.

```jsonc
"distributions": [
  {},
  {
    "name": "my_prior_dist",
    "type": "product_dist",
    "elements": ["m12_prior"]
  },
  {
    "name": "m12_prior",
    "type": "phase_space_density_1d",
    "variable": "m_12"
  }
]
```

Here we define `my_prior_dist` as a product distribution, supposedly incorporating all non-trivial dimensions of the phase-space density (the mass dimensions).
