# Contributing to PromptShield

We welcome contributions to make LLM security more robust!

## Getting Started

```bash
git clone https://github.com/Crynge/PromptShield.git
cd PromptShield

# TypeScript
npm install

# Python
pip install -e .

# Rust (optional)
cd rust-analyzer && cargo build
```

## Development

- Run tests: `npm test` or `pytest tests/`
- Lint: `npm run lint` or `ruff check src/`
- Build: `npm run build`

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## Adding Attack Patterns

Add new patterns in `src/core/patterns.ts` following the existing format.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).
