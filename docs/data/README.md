# Data files

These JSON files are the single source of truth for everything the app looks
up. The app fetches them at start-up; nothing is compiled or bundled. To update
a list, replace or edit the file, run `npm run validate:data` and commit.

| File                        | Content                                                                 | Updated by                               |
| --------------------------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| `szw-cmr-list.json`         | CAS RNs on the SZW list of CMR substances (forbidden, category 0)       | Every new SZW publication (twice a year) |
| `tolerated-szw-casrns.json` | CAS RNs on the SZW list that are tolerated (category 2)                 | Laboratory policy                        |
| `tolerated-h-casrns.json`   | CAS RNs with a forbidden H code that are tolerated (category 2)         | Laboratory policy                        |
| `forbidden-h-codes.json`    | Single H codes that make a substance forbidden (category 0)             | Laboratory policy                        |
| `h-statements.json`         | Catalog of H statements: pictograms, hazard class and text per language | Changes of the CLP regulation            |
| `p-statements.json`         | Catalog of P statements: text per language                              | Changes of the CLP regulation            |

## Format

Every file has a `meta` object and one payload property. The exact format is
defined by the JSON Schemas in [`schemas/`](schemas), which editors pick up
through the `$schema` property of each file.

```jsonc
// szw-cmr-list.json, tolerated-szw-casrns.json, tolerated-h-casrns.json
{
  "$schema": "./schemas/casrn-list.schema.json",
  "meta": {
    "description": "What this list is",
    "source": "URL or name of the source",
    "publishedAt": "2025-01-02T09:00", // SZW list only: shown in every report
    "updatedAt": "2025-01-02"          // other lists
  },
  "casrns": ["50-00-0", "64-17-5"]
}

// forbidden-h-codes.json
{ "meta": { }, "codes": ["H200", "H350"] }

// h-statements.json
{
  "meta": { },
  "statements": {
    "H225": {
      "pictograms": ["GHS02"], // file names in ../assets/pictograms, [] for none
      "hazardClass": { "en": "Flammable liquids, Category 2.", "nl": "…" },
      "statement": { "en": "Highly flammable liquid and vapor.", "nl": "…" }
    }
  }
}

// p-statements.json
{ "meta": { }, "statements": { "P102": { "statement": { "en": "…", "nl": "…" } } } }
```

Texts are plain text, not HTML. Placeholders in statements are written between
angle brackets (`<state route of exposure …>`) and are shown in italics.

## Rules beyond the schemas

`npm run validate:data` (and the test suite, and CI) also checks that:

- every CAS RN has a correct check digit;
- every CAS RN in `tolerated-szw-casrns.json` is on the SZW list, and no CAS RN
  in `tolerated-h-casrns.json` is;
- every code in `forbidden-h-codes.json` exists in `h-statements.json`;
- every pictogram has an SVG file in `docs/assets/pictograms`;
- every text is present in all languages.

## Provisioning with a script

A provisioning tool (for example the planned Python CLI) only has to write
these files in the format above; the app needs no other change. Recommended
flow for the tool:

1. fetch and parse the source (e.g. the SZW publication);
2. write the JSON file with `meta.source` and `meta.publishedAt` filled in,
   sorted and with two-space indentation to keep diffs small;
3. validate against `schemas/*.schema.json` (any JSON Schema 2020-12 validator
   works, e.g. the `jsonschema` package in Python), or run
   `npm run validate:data`;
4. commit. Continuous integration validates the files again.

## Known gaps in the catalogs

The catalogs were taken over unchanged from version 2 of the app. Codes that
are not in a catalog are not recognized in an SDS or in manual input. Notably
missing are `P501` (only the variants `P501A`/`P501B` exist), the EUH
statements and suffixed codes such as `H360FD` (recognized as `H360`).
