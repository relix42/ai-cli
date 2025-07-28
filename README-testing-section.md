# Testing Requirements Section for README.md

Add this section to the Local Development section:

```bash
# Run tests (REQUIRED before submitting changes)
./test-quick.sh    # Fast feedback (10 seconds)
./test-suite.sh    # Full validation (60 seconds)
npm test           # Unit tests

# Set up pre-commit hooks (recommended)
./setup-git-hooks.sh
```

And update the Contributing section to emphasize testing:

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. **Add tests for your changes** (REQUIRED)
5. Run tests: `./test-suite.sh`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Testing Requirements

**🚨 ALL CHANGES MUST INCLUDE TESTS**

- **New Features**: Unit tests + Integration tests
- **Bug Fixes**: Regression tests that would have caught the bug
- **API Changes**: Update all affected tests
- **CLI Changes**: Add tests to `test-suite.sh`

See [TESTING.md](./TESTING.md) for detailed testing guidelines.