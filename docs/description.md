# Format description

## Introduction

The Amplitude Model Serialization Format is a structured, JSON-based specification for hadronic amplitude models. It is designed to support reproducibility and validation of computational and theoretical frameworks in the hadron-physics community. It provides a standardized, minimal way to describe particle kinematics, lineshapes, and cascade decay chains.

This document is intended for framework developers and experts in high-energy physics, computational physics, and related fields. The format is extensible, so that new features can be added as the field evolves. Feedback can be provided via [our issues page](https://github.com/RUB-EP1/amplitude-serialization/issues) or the [discussions page](https://github.com/RUB-EP1/amplitude-serialization/discussions).

### Objectives

- **Reproducibility and open science**<br>
  By standardizing model descriptions, the format makes computational experiments and theoretical analyses easier to reproduce. It supports open science by making it easier for researchers to share, validate, and build upon each other's work.
- **Interpretation of amplitude-analysis results**<br>
  The format is designed to help the theory community interpret amplitude-analysis results. A complete model description helps connect experimental measurements to theoretical interpretation.

- **Correctness checks for new frameworks**<br>
  As new computational frameworks and models are developed, this format provides a benchmark for checking their correctness. It encourages new tools to follow a common standard while remaining scientifically rigorous.

- **Integration with Monte Carlo (MC) generators**<br>
  The format is intended to be compatible with MC generators, so that the same model can be used in simulation workflows. This is important for testing theoretical models against experimental data and for producing high-fidelity simulations.

- **Benchmark for new computational hardware**<br>
  A structured model description is a useful benchmark for new processors (GPUs, CPUs, and related accelerators) and for accelerated computation. A shared model makes it easier to compare the performance of new hardware and software.

This document specifies the model description format: its structure, components, and intended applications. It is a reference for developers and theorists working at the intersection of computational and theoretical physics, with the aim that the tools and models they develop are accurate and interoperable.

## Amplitude model and observables

An amplitude model predicts a probability density function (PDF) over the kinematic variables of a decay. The PDF is a real-valued, normalizable function of kinematics and model parameters. It is constructed from transition amplitudes and is the quantity compared with experimental distributions.

The elementary object is the **external-helicity amplitude** $A_{\lambda_{\mathrm{ext}}}(\tau\mid\mathrm{pars})$: a complex array with one index per external particle (the final-state helicities, and the helicity of the decaying particle). Observables are obtained from this array.

### Observables

This format defines two primary observables.

#### Unpolarized intensity

The unpolarized intensity retains no polarization information. It is the squared modulus of the external-helicity amplitude, summed over all external helicities:

$$
I_\text{unpolarized}(\tau | \text{pars}) = \sum_{\lambda_{\mathrm{ext}}} \bigl|A_{\lambda_{\mathrm{ext}}}(\tau | \text{pars})\bigr|^2.
$$

Here $\tau$ is a point of the phase-space domain: the final-state four-vectors. $\text{pars}$ denotes the model parameters. This observable is used when particle polarizations are not measured.

```json
{
    "distributions": [
        {
            "name": "my-amazing-model",
            "type": "HadronicUnpolarizedIntensity",
            "decay_description": {
                "kinematics": {},
                "reference_topology": [[1, 2], 3],
                "chains": [
                    {},
                    {}
                ]
            }
        }
    ]
}
```

#### Polarized intensity

The polarized intensity includes the polarization of the initial state. It is obtained by contracting the amplitude and its complex conjugate with the initial-state density matrix $\rho$, and summing over final-state helicities:

$$
I_\text{polarized}(\tau | \text{pars}) = \sum_{\lambda_0,\lambda_0'} \sum_{\lambda_{\mathrm{final}}} A^*_{\lambda_0,\,\lambda_{\mathrm{final}}}(\tau | \text{pars})\, \rho_{\lambda_0\lambda_0'}\, A_{\lambda_0',\,\lambda_{\mathrm{final}}}(\tau | \text{pars})\,.
$$

Here $A_{\lambda_0,\,\lambda_{\mathrm{final}}}$ is the amplitude for initial helicity $\lambda_0$ and a given set of final helicities, $A^*$ is its complex conjugate, and $\rho_{\lambda_0\lambda_0'}$ is the initial-state polarization density matrix. The corresponding distribution type is `HadronicPolarizedIntensity`.

## Model structure overview

The decay description collects the ingredients of a cascade amplitude: the external particles, a reference topology, and a list of decay chains. Each chain is an ordered binary cascade: nested two-body decays, with a recoupling at every vertex and a lineshape on every internal line. Chains are summed coherently.

### Mandatory components of a decay description

A `decay_description` is organized around several mandatory components:

- **[`kinematics`](#kinematics-section):** Lists the external particles, including their spins, indices, names, and masses. This section defines the initial and final states.

- **[`reference_topology`](#topology-and-reference-topology):** A nested array of particle indices that defines the reference cascade. It parametrizes the kinematics and fixes the quantization axes of the external helicities. A chain written in this topology needs no alignment rotations. Chains with a different topology must be rotated into this reference.

- **[`chains`](#chains-section):** Lists the cascade sequences that contribute to the amplitude. Each chain has its own topology, one vertex per two-body decay, and one propagator per internal line. Chains are summed coherently, each multiplied by a complex weight.

## Kinematics section

### Purpose of the `kinematics` object

The `kinematics` object lists the external particles of the decay and their properties (spin, mass, name, and index). These are the lines that appear as leaves and as the root of every topology. Event-dependent invariants and helicity angles are not stored here: they are computed from a phase-space point, which is a set of final-state four-vectors.

### Detailed field descriptions

- **`initial_state` and `final_state`:** These fields identify the decaying particle and the particles in the final state. Each entry includes:
  - **`index`:** A unique identifier for the particle. Index `0` is reserved for the initial-state particle. Final-state indices start at `1` and are the integers that appear as leaves in topology brackets.
  - **`name`:** A label for the particle. It is for readability and is not a standardized identifier.
  - **`spin`:** The spin quantum number of the particle, written as a string (for example `"0"`, `"1/2"`, `"1"`).
  - **`mass`:** The mass of the particle, in GeV.

### Examples of the `kinematics` section

- **Three-body decay example ($\Lambda_b \to J/\psi\, K\, \pi$):**

  ```json
  "kinematics": {
    "initial_state" : {
      "index" : 0, "name" : "Lb",    "spin" : "1/2", "mass" : 5.62
    },
    "final_state" : [
      {"index" : 1, "name" : "Jpsi", "spin" : "1", "mass" : 3.097},
      {"index" : 2, "name" : "K",    "spin" : "0", "mass" : 0.493},
      {"index" : 3, "name" : "pi",   "spin" : "0", "mass" : 0.140}
    ]
  }
  ```

- **Four-body decay example ($B \to \psi\, K\, \pi\, \pi$):**
  ```json
  "kinematics": {
    "initial_state" : {
      "index" : 0, "name" : "B",    "spin" : "0", "mass" : 5.279
    },
    "final_state" : [
      {"index" : 1, "name" : "psi", "spin" : "1", "mass" : 3.686},
      {"index" : 2, "name" : "K",   "spin" : "0", "mass" : 0.493},
      {"index" : 3, "name" : "pi",  "spin" : "0", "mass" : 0.140},
      {"index" : 4, "name" : "pi",  "spin" : "0", "mass" : 0.140}
    ]
  }
  ```

## Phase-space domain

The kinematic domain of a decay is the $n$-body phase space. It is fixed by the initial-state mass $m_0=\sqrt{s}$ and the final-state masses $m_1,m_2,\ldots$. A point in this domain is a set of on-shell four-vectors $p_1,p_2,\ldots$ for the final-state particles. In the rest frame of the decaying system they satisfy $\sum_i p_i=(m_0,\mathbf{0})$.

These four-vectors are the input to the amplitude. The invariant masses and helicity angles that appear in the cascade factorization are computed from them, using the chain topology and the reference topology.

```json
"domains": [
    {
        "name": "default",
        "type": "phase_space",
        "m0": 2.28646,
        "final_state_masses": [0.938272046, 0.13957018, 0.493677]
    }
]
```

## Topology and reference topology

A topology is a **nested binary tree** of final-state indices, written in JSON as nested two-element arrays. Each pair is an ordered two-body decay $0\to 1+2$: the left entry is child 1, the right entry is child 2. For $n$ final-state particles there are $n-1$ vertices and $n-2$ internal lines (plus the root line).

Child order is part of the physics. The arrays `[3, 1]` and `[1, 3]` are different topologies: they assign child 1 and child 2 differently, and therefore change the helicity difference $\lambda_1-\lambda_2$, the Jacob–Wick particle-2 phase, the local angles, and the Wigner-rotation path. Bracket pairs must not be treated as unordered sets.

The same nested array is used as an **address** in two related ways:

- as a **vertex**: the two-body decay of that subsystem;
- as an **internal line**: the resonance (the parent particle of that decay).

The `reference_topology` serves two purposes. First, it defines how a set of final-state four-vectors is turned into the invariant masses and helicity angles of the cascade. Second, it fixes the quantization axes of the **external** helicities. Helicity is the projection of a particle's spin along its momentum, so its value depends on the frame in which it is evaluated.

Because the `reference_topology` specifies a unique path from the initial state to the final-state particles, it defines the frame for each external helicity. The helicity indices on Wigner $D$-functions and on couplings refer to those frames. A chain whose `topology` coincides with the reference is already written in these frames. A chain with a different topology is evaluated in its own local frames and then aligned to the reference by Wigner rotations on the external lines ([Habermann and Mikhasenko, *Wigner rotations for cascade reactions*](https://inspirehep.net/literature/2827198)).

### Amplitude of a cascade chain

For one chain, the external-helicity amplitude has the factorization

$$
A_{\lambda_{\mathrm{ext}}}(\tau) =
\sqrt{\prod_R (2J_R+1)}\;
\prod_R P_R(\sigma_R)\;
\sum_{\lambda_{\mathrm{int}}}
\prod_v
D^{J_0*}_{\lambda_0,\,\lambda_1-\lambda_2}(\phi_v,\theta_v,0)\,
H^v_{\lambda_1\lambda_2}(\tau).
$$

- $R$ runs over **internal lines** (propagating resonances). $P_R(\sigma_R)$ is the lineshape evaluated at the invariant mass squared of that line. The root and the final-state lines have no propagator. The factor $\sqrt{2J_R+1}$ is a spin normalization for each internal line.
- $v$ runs over **binary vertices**. At vertex $v$, line $0$ is the parent and lines $1,2$ are the ordered children. $(\phi_v,\theta_v)$ are the polar angles of child 1 in the parent rest frame. The third Euler angle is zero.
- The sum is over helicities on the internal lines. The free indices $\lambda_{\mathrm{ext}}$ are the helicities of the final-state particles and of the root.

The helicity coupling $H$ used in this product is not identical to the recoupling $h$ stored in the vertex (see [Vertices](#vertices)). Following the Jacob–Wick particle-2 convention,

$$
H_{\lambda_1\lambda_2} =
h_{\lambda_1\lambda_2}\,
(-1)^{j_2-\lambda_2}\,
F_v(m_0^2,m_1^2,m_2^2),
$$

where $j_2$ is the spin of child 2 (the right-hand entry in the bracket) and $F_v$ is an optional vertex form factor. Parity and $LS$ relations apply to $h$, before this phase.

### An example of a four-body decay

As an example, consider the four-body topology `[[[3,1],4],2]`.
The nested arrays give both the decay sequence and the rest frames in which the helicities are defined:

```text
        0
       / \
  [[3,1],4]  2
     / \
  [3,1]  4
   / \
  3   1
```

The three vertices, in root-first order, are `[[[3,1],4],2]`, `[[3,1],4]`, and `[3,1]`. The two internal lines are `[[3,1],4]` and `[3,1]`. Expanding the product above,

$$
\begin{aligned}
A_{m_0\lambda_1\lambda_2\lambda_3\lambda_4}
&= n_{j_{[[3,1],4]}}\, n_{j_{[3,1]}}\,
   P_{[[3,1],4]}\, P_{[3,1]} \\
&\quad\times \sum_{\tau,\nu}
D^{j_0*}_{m_0,\,\tau-\lambda_2}(\phi,\theta,0)\,
H_{\tau\lambda_2}
\\
&\quad\times
D^{j_{[[3,1],4]}*}_{\tau,\,\nu-\lambda_4}(\phi,\theta,0)\,
H_{\nu\lambda_4}
\\
&\quad\times
D^{j_{[3,1]}*}_{\nu,\,\lambda_3-\lambda_1}(\phi,\theta,0)\,
H_{\lambda_3\lambda_1},
\end{aligned}
$$

with $n_j=\sqrt{2j+1}$. The three $D^*$ factors are the local rotations at `[[[3,1],4],2]`, `[[3,1],4]`, and `[3,1]`, respectively.

- At the root, particle 0 decays to the subsystem `[[3,1],4]` (helicity $\tau$) and particle `2` (helicity $\lambda_2$). The decay is evaluated in the overall rest frame. This is the first occurrence of $\lambda_2$, so the helicity of particle `2` is defined in this frame. The index $m_0$ is the spin projection of the decaying particle; it is a canonical (rest-frame) projection, because particle 0 is at rest.
- At `[[3,1],4]`, that subsystem decays to `[3,1]` (helicity $\nu$) and particle `4` (helicity $\lambda_4$). The helicity of particle `4` is defined in the rest frame of `[[3,1],4]`, reached from the overall rest frame by a rotation and a boost along the decay sequence.
- At `[3,1]`, the remaining subsystem decays to particles `3` and `1`. Their helicities $\lambda_3$ and $\lambda_1$ are defined in the `[3,1]` rest frame, reached by the successive transformations from the overall center-of-momentum frame through `[[3,1],4]` to `[3,1]`.

## Chains section

The `chains` array lists the cascade sequences that contribute to the amplitude. The total amplitude is the coherent sum of the chain amplitudes, after each chain has been aligned to the `reference_topology`. Each element of `chains` is an object with:

- `topology` — the ordered binary cascade of that chain;
- `vertices` — one recoupling (and optional form factor) per two-body decay;
- `propagators` — one lineshape per internal line;
- `weight` — a complex coefficient multiplying the chain;
- `name` — a label.

### Topology

The `topology` of a chain is the nested grouping of final-state indices that defines its decay sequence. It may coincide with the `reference_topology` or differ from it. If it differs, the external helicity axes of that chain must be aligned to the reference by Wigner rotations.

### Vertices

Vertices are the nodes of the decay graph, at which one particle decays into two ordered children. Vertices with more than two decay products are not yet standardized. Each vertex is characterized by:

- **`node`:** The bracket address of the vertex: the nested array that names the two-body decay $0\to 1+2$.

- **`formfactor`:** Optional name of a function $F_v(m_0^2,m_1^2,m_2^2)$, defined in the `functions` section, evaluated at the event-dependent masses of the parent and the two children. An empty string means $F_v=1$.

- **`type`:** Specifies how the recoupling amplitude $h_{\lambda_1\lambda_2}$ is computed.
  Three types are defined: `ls`, `parity`, and `helicity`.
  They relate helicity combinations to a real-valued recoupling coefficient. The helicity coupling in the chain amplitude is then $H_{\lambda_1\lambda_2}=h_{\lambda_1\lambda_2}\,(-1)^{j_2-\lambda_2}\,F_v$.
  - `helicity` means no recoupling: the factor is $1$ for one selected helicity pair $(\lambda_1^0,\lambda_2^0)$ and zero otherwise.
    $$
    h^\text{helicity}(\lambda_1,\lambda_2|\lambda_1^0,\lambda_2^0) = \delta_{\lambda_1,\lambda_1^0}\delta_{\lambda_2,\lambda_2^0}
    $$
  - `parity` is non-zero for two helicity combinations: the selected pair $(\lambda_1^0,\lambda_2^0)$ and the opposite pair $(-\lambda_1^0,-\lambda_2^0)$. The coefficient is $1$ for the selected pair and equal to the `parity_factor` for the opposite pair.
    $$
    h^\text{parity}(\lambda_1,\lambda_2|\lambda_1^0,\lambda_2^0, f) =
      \delta_{\lambda_1,\lambda_1^0}\delta_{\lambda_2,\lambda_2^0} + f \delta_{\lambda_1,-\lambda_1^0}\delta_{\lambda_2,-\lambda_2^0}
    $$
  - `ls` computes the recoupling from Clebsch–Gordan coefficients of the orbital angular momentum $\ell$ and the coupled spin $s$:
    $$
    \begin{aligned}
    h^\text{ls}(\lambda_1,\lambda_2|\ell,s,j_1,j_2,j_0)
    &=
      \sqrt{\frac{2\ell+1}{2j_0+1}}
      \left\langle j_1,\lambda_1; j_2,-\lambda_2|s,\lambda_1-\lambda_2\right\rangle \\
    &\quad\times
      \left\langle \ell,0; s,\lambda_1-\lambda_2|j_0,\lambda_1-\lambda_2\right\rangle
    \end{aligned}
    $$

### Propagators

A propagator is attached to an **internal line**, not to the root or to a final-state particle. There is one propagator per internal line of the chain topology.

- **`node`:** The bracket address of the internal line: the nested array that names the propagating subsystem.

- **`parametrization`:** Names the lineshape $P_R(\sigma_R)$. The name refers to a function defined in the `functions` section (for example a Breit–Wigner or Flatté resonance). The function is evaluated at the invariant mass squared of that line.

- **`spin`:** Spin $J_R$ of the propagating particle. It enters the Wigner $D$-function at the decay of this line, the spin factor $\sqrt{2J_R+1}$, and the selection rules of the attached vertices.

### Weight

The `weight` of a chain is the complex coefficient that multiplies that chain's matrix element. The total amplitude is the sum of the weighted, aligned chains, so the weights set both the strength of each chain and the interference between chains.

## Validation

Checksums in `misc.amplitude_model_checksums` are reference values used to check an implementation. An **amplitude** checksum is evaluated at a phase-space point given as final-state four-vectors:

```json
{
    "name": "validation_point",
    "domain": "default",
    "four_vectors": [
        {"index": 1, "E": 1.161, "px": -0.598, "py": 0.0, "pz": 0.332},
        {"index": 2, "E": 0.350, "px": 0.0, "py": 0.0, "pz": -0.321},
        {"index": 3, "E": 0.776, "px": 0.598, "py": 0.0, "pz": -0.012}
    ]
}
```

A **lineshape** checksum may still use a scalar parameter point, for example an invariant mass squared $m_{ij}^2$, because a propagator is a function of one line invariant.
