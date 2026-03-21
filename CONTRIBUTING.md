# Contributing to CampusFix

Thanks for helping build CampusFix. This guide keeps collaboration smooth and reviews fast.

## How to Contribute
1. Fork the repo and create a feature branch.
2. Make your changes with clear, focused commits.
3. Open a Pull Request with a short summary and screenshots where relevant.

## Branch Naming
Use the format:
```
type/short-description
```
Examples:
```
feat/ticket-upvotes
fix/login-redirect
chore/update-readme
```

Recommended `type` values: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

## Local Setup
```
cd server
npm install

cd ../client
npm install
```

## Development
```
cd server
npm run dev

cd ../client
npm run dev
```

## Code Style
- Keep code readable and consistent with existing patterns.
- Avoid unrelated formatting changes in the same PR.
- Prefer small, focused PRs over large mixed changes.

## Testing
There are no automated tests yet. If you add tests, include steps to run them in your PR description.

## Pull Request Checklist
- [ ] Linked the related issue (if any)
- [ ] Added or updated docs when relevant
- [ ] Included screenshots for UI changes
- [ ] Confirmed app runs locally

## Reporting Issues
Use GitHub Issues for bugs and feature requests.  
For security vulnerabilities, please follow `SECURITY.md`.
