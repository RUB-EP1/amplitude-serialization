# Compatibility with HS3

In parallel to development of the model description format, compatibility with HEP Statistics Serialization Standard (HS3) is investigated.

- [HS3 repository](https://github.com/hep-statistics-serialization-standard/hep-statistics-serialization-standard)
- Serialization of hadronic models, [discussion #34](https://github.com/hep-statistics-serialization-standard/hep-statistics-serialization-standard/discussions/34)
- Cascade models in HS3, [discussion #36](https://github.com/hep-statistics-serialization-standard/hep-statistics-serialization-standard/discussions/36)

## Support in ROOT, what is missing

- Class: `RooAmplitudeModelPDF`
    * Implementation of math
    * Exporter: `RooAmplitudeModelPDF::Streamer`
    * Importer: `RooAmplitudeModelPDF::Factory`
- All lineshapes: `BreitWigner`, `BlattWeisskopf`

## Example of HS3 file

- [HS3_base.json](HS3_base.json) give description of basic interfaces of the model variables and parameters consistently with HS3. It sets default value of variable, and describes a validation point in HS3 consistent way.
- [HS3_extended.json](HS3_extended.json) prototypes
    * adding jacobian (prior) for phase space generation,
    * replacing phase space variables