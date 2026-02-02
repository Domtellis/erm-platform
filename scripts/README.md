# Value Stream Generator

This script generates `context.yaml` and `conceptual.mmd` for each value stream based on the markdown files in `docs/value-architecture/value-streams`.

Usage:

```
python scripts/generate_value_streams.py
```

The script will back up existing `context.yaml` and `conceptual.mmd` files (adds `.bak-<timestamp>` suffix) before writing new versions.
