# Contributing

Thank you for your interest in contributing to the JERT Network monorepo.

## General principles

- Keep all changes minimal and focused.
- Do not break existing CI pipelines — all checks must remain green.
- Prefer incremental improvements over large refactors.
- Security-sensitive changes should be clearly documented.

## Repository structure

This repository is organized as a monorepo with multiple independent packages
(e.g. smart-contracts, api-gateway, wallets, chain tooling).
Each package may have its own build and test process.

## Commits & Pull Requests

- Use clear, descriptive commit messages.
- Ensure that relevant tests pass before opening a pull request.
- If a change affects multiple packages, explain the rationale clearly.

## Notes

This project follows a conservative, stability-first approach.
Tooling orchestration and structural refactors are introduced only
after all existing components are stable and verified.

