# Security Audit — Day 3

## 1. CORS Policy
- **Status**: OPEN (`allow_origins=["*"]`)
- **Recommendation**: Restrict to `https://apex-f1.vercel.app` in production.
- **Action**: Update `main.py` middleware during final freeze.

## 2. SQL Injection Safety
- **Status**: SECURE.
- **Analysis**: All routes use SQLAlchemy's expression language (`select`, `insert`) which automatically parameterizes queries. No string concatenation used for user input in SQL.

## 3. Environment Variable Leakage
- **Status**: PROTECTED.
- **Analysis**: `.env` files are in `.gitignore`. `config.py` uses Pydantic Settings to validate and contain vars. No internal variables are exposed via API endpoints.

## 4. Rate Limiting
- **Status**: NOT IMPLEMENTED.
- **Requirement**: Add `slowapi` or similar if public API access is planned. For now, rely on Upstash/Railway firewall.

## 5. Request Validation
- **Status**: SECURE.
- **Analysis**: Pydantic models in `schemas.py` enforce strict typing and bounds (e.g., `ge=1` for page numbers).
