# Format description

## Introduction

The Amplitude Model Serialization Format defines a structured, JSON-based specification that is designed to facilitate reproducibility and validation of theoretical frameworks within the hadron physics community. It provides a standardized, minimal approach to describing particle kinematics, lineshapes, and interaction chains.

This document targets framework developers and experts engaged in high-energy physics, computational physics, and related fields. The format is designed to be extensible, allowing for the incorporation of new features and enhancements as the field evolves. Feedback can be provided via [our issues page](https://github.com/RUB-EP1/amplitude-serialization/issues) or the [discussions page](https://github.com/RUB-EP1/amplitude-serialization/discussions).

### Objectives

- **Reproducibility and Open Science**<br>
  By standardizing model descriptions, this format aims to enhance the reproducibility of computational experiments and theoretical analyses. It supports open science initiatives by making it easier for researchers to share, validate, and build upon each other's work.
- **Inference from amplitude analysis results**<br>
  The format is designed to facilitate the interpretation of amplitude analysis results by the theory community. By providing a clear and comprehensive model description, it helps bridge the gap between experimental data and theoretical insights.

- **Correctness/Validity check for new Frameworks**<br>
  As new computational frameworks and models are developed, this format serves as a benchmark check for validating their correctness. It ensures that new tools and approaches adhere to established standards, fostering innovation while maintaining scientific rigor.

- **Integration with Monte Carlo (MC) generators**<br>
  The format is compatible with MC generators, enabling seamless integration and simulation workflows. This compatibility is critical for testing theoretical models against experimental data and for conducting high-fidelity simulations.

- **Benchmark for new computational devices**<br>
  The structured nature of the model description format makes it an ideal benchmark for new processing units (GPU, CPU, ...) or accelerated computation techniques. By providing a common material for benchmarking, it aids in evaluating the performance enhancements offered by new hardware and software technologies.

This document presents the specifications of the model description format in detail, outlining its structure, components, and applications. It is intended as a comprehensive guide for developers and theorists working at the intersection of computational and theoretical physics, ensuring that the tools and models they develop are both accurate and interoperable.

## Amplitude model and observables

In modeling, the Probability Density Function (PDF) serves as a fundamental concept for predicting and analyzing the outcomes of particle interactions. PDFs are real-valued, normalizable functions that depends on kinematic variables and parameters, providing a quantitative framework to describe the likelihood of observing a particular configuration or outcome in a particle decay or collision event.

### Observables

Observables are measurable quantities derived from the model that offer insight into the underlying physics governing particle interactions. In the context of amplitude models, observables are calculated from transition amplitudes, which represent the probability amplitudes of the system to transition from an initial to a final state. Two primary observables are defined in this framework:

#### Unpolarized Intensity

The unpolarized intensity is an observable that represents the overall likelihood of a transition without considering the polarization states of the particles involved. It is computed as the squared magnitude of the transition amplitude, summed over all spin projections. Mathematically, the unpolarized is given by

$$
I_\text{unpolarized}(\tau | \text{pars}) = \sum_{\text{helicities}} |A_{\text{helicities}}(\tau | \text{pars})|^2,
$$

where $A_{\text{helicities}}(\tau | \text{pars})$ denotes the transition amplitude for a given set of helicities, $\tau$ represents the kinematic variables, and $\text{pars}$ symbolizes the model parameters. This observable is crucial for experiments where the polarization of the particles is not measured or considered.

```json
{
    "distributions" : []
    {
        "type": "unpolarized_intensity",
        "model": "my-amazing-model"
    },
    {
        "name": "my-amazing-model",
        "kinematics": {},
        "reference_topology": {},
        "chains": [
            {},  // chain 1
            {},  // chain 2
        ]
    }
}
```

#### Polarized Intensity

In contrast, the polarized intensity accounts for the polarization states of the particles involved in the interaction. It is computed by contracting the transition amplitude and its complex conjugate with the polarization matrix ($\rho$). This process involves summing over the final helicities while keeping the initial helicity states ($\lambda_0, \lambda_0'$) explicit in the calculation:

$$
I_\text{polarized}(\tau | \text{pars}) = \sum_{\text{final\_helicities}} A^*_{\lambda_0, \text{final\_helicities}}(\tau | \text{pars}) \times \rho_{\lambda_0,\lambda_0'} \times A_{\lambda_0', \text{final\_helicities}}(\tau | \text{pars})\,.
$$

Here, $A^*_{\lambda_0', \text{final\_helicities}}$ represents the complex conjugate of the amplitude for initial helicity $\lambda_0'$ and a sum over final helicities. The polarization matrix $\rho_{\lambda_0,\lambda_0'}$ encapsulates the initial polarization states of the system, allowing for a detailed analysis of how polarization affects the transition probabilities.

## Model Structure Overview

The model description is designed to encapsulate all elements of transition models, including the characteristics of particles involved, the shapes of their interaction lines, and the overarching topology of particle interactions. The format's hierarchical nature allows for detailed specification of models while maintaining readability and ease of manipulation by software tools.

### Mandatory Top-Level Components

The model description is organized around several mandatory root-level components, each serving a distinct purpose in defining the physical model:

- **[`kinematics`](#kinematics-section):** This section contains information about the particles involved in the model, including their spins, indices for identification, names, and masses. It establishes the foundational elements of the model by specifying the properties of each particle.

- **[`reference_topology`](#topology-and-reference-topology):** This array defines the basic interaction structure or topology of the model which is used to define the reference quantization axes. It outlines the decay chain for which the amplitude is written without a need for the alignment rotations. All other chains that have different decay topology must be aligned to the reference one.

- **[`chains`](#chains-section):** The chains section lists specific interactions within the model, detailing the propagators, vertices with parametrization scheme and a complex coupling. Each chain is a cascade of decays that follows the chain topology. For every node one specifies the vertex propertied,
  and a parametrization (the lineshape) of an intermediate resonance that ends on the node.

## Kinematics Section

### Purpose of the `Kinematics` Object

The `kinematics` object within the model description characterizes particles involved in a model.
It species the main properties such as spin, and masses of all particles.

### Detailed Field Descriptions

- **`initial_state` and `final_state`:** These fields categorize particles as either initiating or resulting from the decay. Each entry includes:
  - **`index`:** A unique identifier for each particle, with zero reserved for the initial state particle.
  - **`name`:** A label for each particle, used for clarity and not as a standardized identifier.
  - **`spin`:** The quantum spin number of the particle, represented in string format.
  - **`mass`:** The mass of the particle, noted in GeV/c².

### Examples of the `kinematics` Sections

- **Three-body decay example (Lambda baryon to J/psi, kaon, and pion):**

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

- **Four-body decay example (B meson to psi meson, kaon, and two pions):**
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

## Topology and Reference Topology

The `reference_topology` array serves a pivotal role in defining how helicity amplitudes are computed. The reference topology can be used to fix the quantization axes for particle helicities. Since helicity is the projection of a particle's spin along its direction of motion, its precise definition depends upon the frame of reference in which it is evaluated. This can be problematic in decays that consist of multiple decay topologies. Accurate determination of helicity states is therefore crucial for computing the correct amplitude values, even if the choice does not always affect the value of the `unpolarized_intensity`.

In the context of the conventional helicity formalism, the `reference_topology` array implicitly prescribes a method for defining helicities, as it can be used to define a default quantization frame for each stage (decay node) in the decay process.
When considering the helicity of a particle in any other frame, it must be treated as a superposition of the states with regard to the default quantization.
The helicity values employed in the indices of Wigner rotations `D_{λ1, λ2}` and couplings `H_{λ1, λ2}` are thus indicative of this frame.

### An example of four-body decay

Understanding the relation between the decay frames and the helicity definitions is crucial for accurately computing decay amplitudes within the conventional helicity formalism.
As an example, let's investigate a four-body decay topology, specifically `[[[3,1],4],2]`.
This topology outlines the decay sequence and the respective frames that define the helicities of the involved particles.

In the given topology, the decay amplitude calculation involves a series of Wigner&nbsp;$D$-functions, each corresponding to rotations and boosts that define the helicity frames of the particles:

$$
\begin{align}
A &= n_{j_0} D_{\tau, \lambda_2}^{j_0}(\text{angles}_{[[3,1],4]}) \\
&\quad \cdot n_{j_{[[3,1],4]}} D_{\nu, \lambda_4}^{j_{[[3,1],4]}}(\text{angles}_{[3,1]}) \\
&\quad \cdot n_{j_{[3,1]}} D_{\lambda_3, \lambda_1}^{j_{[3,1]}}(\text{angles}_3)
\end{align}
$$

- $D_{\tau, \lambda_2}^{j_0}(\text{angles}_{[[3,1],4]})$ describes the transformation for the helicity of particle&nbsp;`2`, $\lambda_2$, in the overall rest frame of the system (comprising particles `3`, `1`, `4`, and `2`).
  Here, $\lambda_2$ is defined relative to the frame where all other particles are considered, emphasizing its position in the decay sequence.

- $D_{\nu, \lambda_4}^{j_{[[3,1],4]}}(\text{angles}_{[3,1]})$: For particle `4`, its helicity, $\lambda_4$, is defined within the rest frame of the `[3,1,4]` system.
  This frame is obtained from the overall rest frame by applying a rotation and boost, signifying the progression of the decay sequence and the specific frame where particle `4`'s helicity is defined.

- $D_{\lambda_3, \lambda_1}^{j_{[3,1]}}(\text{angles}_3)$: The helicities of particles `3` and `1`, $\lambda_3$ and $\lambda_1$, are defined within the `[3,1]` rest frame.
  This frame is reached through successive transformations: first to the `[3,1,4]` system and then to the `[3,1]` subsystem.
  This sequence of boosts and rotations precisely defines the helicity states of particles `3` and `1` in relation to their specific interaction frame.

## Chains Section

The `chains` section is a main component of the model description format, outlining the specific interaction sequences and their properties within the model. Chains are components of the model, which are added linearly to each other. The `chains` fields contains a list, `[{}, {}, ...]`, with every element being a chain. The chain contains the field `topology` that describe the cascade decay, the field `propagators` that is a list of the lineshape descriptors, and the field `vertices` that specifies parametrization of every node in the decay-topology graph.

### Topology

The `topology` field in each chain delineates the structural framework of the interactions, derived from and related to the `reference_topology`. It illustrates the hierarchical sequence of interactions and propagations, providing a visual and logical map of how particles transform and interact within the model. The topology ensures that each chain aligns with the overall model structure, maintaining consistency and coherence in the description of particle dynamics.

### Vertices

Vertices define the nodes in the decay graphs, where one particle transits into two. The model format should handle decay nodes with more than two decay products, but a standard has not yet been developed. Each vertex is characterized by:

- **`node`:** Defines a node in the topology graph by specifying the particles involved in the interaction.

- **`type`:** Specifies how the helicity recoupling factor `H_{l1,l2}` is computed.
  Three types are defined: `ls`, `parity`, and `helicity`.
  These reflect different ways of relating combinations of the helicity indices to a real-valued "recoupling coefficient".

  - `helicity` indicates no recoupling: the factor is $1$ for a pair of selected helicities ($\lambda_a^0$ and $\lambda_b^0$) and zero for other combinations.
    $$
    H^\text{helicity}(\lambda_a,\lambda_b|\lambda_a^0,\lambda_b^0) = \delta_{\lambda_a,\lambda_a^0}\delta_{\lambda_b,\lambda_b^0}
    $$
  - `parity` is controlled by the controlled by the `parity factor`, $f$, and gives a non-zero value for two combination of the helicity pair.
    $$
    H^\text{parity}(\lambda_a,\lambda_b|\lambda_a^0,\lambda_b^0, f) =
      \delta_{\lambda_a,\lambda_a^0}\delta_{\lambda_b,\lambda_b^0} + f \delta_{\lambda_a,-\lambda_a^0}\delta_{\lambda_b,-\lambda_b^0}
    $$
  - `ls` computes the value of the recoupling functions from Clebsch–Gordan coefficients.
    $$
    \begin{multline}
    H^\text{ls}(\lambda_a,\lambda_b|l,s,j_a,j_b,j) = \\
      \sqrt{\frac{2l+1}{2j+1}}
      \left\langle j_a,\lambda_a; j_b,-\lambda_b|s,\lambda_a-\lambda_b\right\rangle
      \left\langle l,0; s,\lambda_a-\lambda_b|j,\lambda_a-\lambda_b\right\rangle
    \end{multline}
    $$
    For spin-half particles, this recoupling is equivalent to the `parity` recoupling, with $f = (-1)^l$.

### Propagators

- **`type`:** The `type` field within each propagator specifies the mathematical or physical model used to describe the propagation of a particle between interactions. This type is directly linked to the `lineshapes` section, where the detailed characteristics of each propagator type (e.g., resonance models like Breit-Wigner or Flatté) are defined. The `type` essentially dictates how the propagator influences the chain's overall amplitude, based on its lineshape parameters.

- **`spin`:** The `spin` value of a propagator indicates the spin of the particle as it propagates. This is crucial for determining the angular momentum conservation and spin-related effects in the interaction, influencing the selection rules and possible transitions within the chain.

- **`node`:** Nodes represent the points of interaction within a chain, defining how particles are grouped and interact. The `node` structure specifies the arrangement of particles before and after an interaction, guiding the construction of the chain's topology and determining the sequence of propagations and interactions.

### Weight

The `weight` field in each chain represents the complex amplitude associated with the chain's specific sequence of interactions and propagations. This weight factors into the overall amplitude of the process being modeled, influencing the probability of the chain's occurrence. Weights are crucial for calculating cross sections, decay rates, and other observable quantities, directly impacting the model's predictive accuracy.
