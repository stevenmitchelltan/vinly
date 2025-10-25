# Contributing to Vinly

Thank you for your interest in contributing to Vinly! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/vinly/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, etc.)

### Suggesting Features

1. Check [Issues](https://github.com/yourusername/vinly/issues) for existing feature requests
2. Create a new issue with:
   - Clear description of the feature
   - Use case / problem it solves
   - Possible implementation approach
   - Any relevant examples

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/vinly.git
   cd vinly
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend
   pytest
   
   # Frontend tests
   cd frontend
   npm test
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Use conventional commits:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `style:` formatting changes
   - `refactor:` code refactoring
   - `test:` adding tests
   - `chore:` maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide clear description of changes
   - Link related issues

## Development Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local
npm run dev
```

## Code Style

### Python (Backend)

- Follow PEP 8
- Use type hints where possible
- Write docstrings for functions
- Keep functions focused and small
- Use async/await for I/O operations

Example:
```python
async def fetch_wines(
    supermarket: Optional[str] = None,
    wine_type: Optional[str] = None
) -> List[Wine]:
    """
    Fetch wines from database with optional filters.
    
    Args:
        supermarket: Filter by supermarket name
        wine_type: Filter by wine type
        
    Returns:
        List of Wine objects
    """
    # Implementation
```

### JavaScript/React (Frontend)

- Use functional components
- Use hooks for state management
- Keep components small and focused
- Use meaningful variable names
- Add PropTypes or TypeScript types

Example:
```javascript
function WineCard({ wine }) {
  // Component logic
  
  return (
    <div className="wine-card">
      {/* JSX */}
    </div>
  );
}
```

### CSS/TailwindCSS

- Use Tailwind utility classes
- Define custom classes in `index.css` for reusable patterns
- Keep responsive design in mind
- Test on mobile devices

## Project Structure

```
vinly/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── jobs/        # Background jobs
│   │   ├── scrapers/    # Scraping logic
│   │   ├── services/    # Business logic
│   │   └── ...
│   ├── scripts/         # Utility scripts
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API integration
│   │   └── ...
│   └── package.json
└── README.md
```

## Areas for Contribution

### High Priority
- [ ] Add comprehensive tests (unit, integration)
- [ ] Improve error handling and logging
- [ ] Add data validation
- [ ] Implement caching layer
- [ ] Improve scraper reliability

### Medium Priority
- [ ] Add more supermarket scrapers
- [ ] Support for beer/spirits
- [ ] User accounts and favorites
- [ ] Email notifications for new wines
- [ ] Advanced filtering options

### Low Priority
- [ ] Dark mode
- [ ] Multiple languages
- [ ] Mobile app
- [ ] Wine comparison feature
- [ ] Price tracking

## Testing

### Backend Tests

```bash
cd backend
pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual Testing

1. Test all API endpoints
2. Test all filter combinations
3. Test on different devices
4. Test with no data
5. Test error states

## Documentation

When adding features, update:
- README.md
- API documentation (docstrings)
- Code comments for complex logic
- DEPLOYMENT.md if deployment changes
- This CONTRIBUTING.md if process changes

## Questions?

- Open an issue for discussion
- Reach out to maintainers
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Vinly! 🍷

