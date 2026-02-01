# CLAUDE.md - AI Story Creation Tool

This document provides essential context for AI assistants working with this codebase.

## Project Overview

AI Story Creation Tool (AI 故事創作工具) is an AI-powered application that helps screenwriters and content creators develop stories through an 8-stage creative workflow. The application is written primarily in **Traditional Chinese (繁體中文)** for UI text and comments.

### Core Workflow (8 Stages)

1. **idea** (靈感發想) - Brainstorming and concept development
2. **story** (故事大綱) - Story outline with three-act structure
3. **script** (劇本初稿) - Initial screenplay draft
4. **character** (角色設計) - Character design and profiles
5. **scene** (場景設計) - Scene and set design
6. **storyboard** (分鏡腳本) - Storyboard creation
7. **image_prompt** (AI 圖像提示詞) - AI image generation prompts
8. **motion_prompt** (動態分鏡提示詞) - Motion/video generation prompts

Each stage depends on previous stages as defined in `backend/app/models/enums.py:STAGE_DEPENDENCIES`.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLAlchemy 2.0 with SQLite (dev) / PostgreSQL (prod)
- **Migrations**: Alembic
- **Validation**: Pydantic v2 with `pydantic-settings`
- **Linting**: ruff, black, isort
- **Testing**: pytest, pytest-asyncio

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS variables (shadcn/ui style)
- **State**: Zustand stores
- **HTTP Client**: Axios
- **Rich Text**: TipTap editor

## Project Structure

```
AI_story/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # API route handlers
│   │   │   ├── projects.py   # Project & Stage CRUD
│   │   │   ├── ai.py         # AI generation endpoints
│   │   │   ├── settings.py   # AI settings management
│   │   │   ├── export.py     # Export to PDF/Word/Excel
│   │   │   ├── prompts.py    # System prompt management
│   │   │   └── templates.py  # Story templates
│   │   ├── config/           # YAML configuration files
│   │   │   ├── default_prompts.yaml
│   │   │   └── story_templates.yaml
│   │   ├── core/             # App configuration
│   │   │   ├── config.py     # Settings from env vars
│   │   │   └── security.py   # API key encryption
│   │   ├── db/               # Database setup
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utilities (AI client)
│   ├── alembic/              # Database migrations
│   ├── tests/                # Backend tests
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   └── src/
│       ├── app/              # Next.js App Router pages
│       │   ├── page.tsx      # Home/project list
│       │   ├── project/[id]/ # Project editor page
│       │   └── settings/     # Settings page
│       ├── components/       # React components
│       │   ├── editor/       # Rich text & version UI
│       │   └── ui/           # UI primitives (Toast)
│       ├── hooks/            # Custom React hooks
│       ├── lib/api/          # API client & endpoints
│       ├── stores/           # Zustand state stores
│       └── types/            # TypeScript definitions
├── docs/                     # Documentation
├── .github/workflows/        # CI/CD workflows
├── docker-compose.yml
├── requirements.md           # Feature requirements
├── spec.md                   # Technical specification
└── todolist.md               # Development progress
```

## Development Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

### Docker (Optional)
```bash
docker-compose up -d
```

## Code Conventions

### Backend (Python)

- **Line length**: 88 characters (black default)
- **Formatting**: Use `black .` before committing
- **Linting**: Use `ruff check .` to check for issues
- **Type hints**: Required for function signatures (mypy enforced)
- **Docstrings**: Triple-quoted strings for modules, classes, functions

```python
# Example service method pattern
def get_project(self, project_id: int) -> Optional[Project]:
    """Get a project by ID."""
    stmt = select(Project).where(Project.id == project_id)
    result = self.db.execute(stmt)
    return result.scalar_one_or_none()
```

### Frontend (TypeScript)

- **Linting**: `npm run lint` (ESLint with Next.js config)
- **Components**: Functional components with TypeScript interfaces
- **Styling**: Tailwind utility classes, use CSS variables for theming
- **State**: Zustand stores in `src/stores/`
- **API calls**: Use `apiClient` from `src/lib/api/client.ts`

```typescript
// Example component pattern
interface Props {
    projectId: number
    onSave: () => void
}

export function MyComponent({ projectId, onSave }: Props) {
    // Component implementation
}
```

### Commit Messages

Follow conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting (no code change)
- `refactor:` Code restructuring
- `test:` Testing

## Key Patterns

### API Routes (Backend)

Routes are organized in `backend/app/api/v1/`:

```python
# Route pattern in projects.py
@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a project by ID."""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_to_response(project)
```

### API Endpoints (Frontend)

Endpoints are defined in `src/lib/api/endpoints.ts`:

```typescript
export const API_ENDPOINTS = {
    PROJECTS: {
        LIST: '/projects',
        DETAIL: (id: string) => `/projects/${id}`,
    },
    STAGES: {
        GET: (projectId: string, type: string) => `/projects/${projectId}/stages/${type}`,
    },
    // ...
}
```

### State Management (Frontend)

Zustand stores follow this pattern:

```typescript
// src/stores/projectStore.ts
interface ProjectState {
    projects: Project[]
    isLoading: boolean
    error: string | null
    fetchProjects: () => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,
    fetchProjects: async () => {
        set({ isLoading: true })
        try {
            const res = await apiClient.get<...>(...)
            set({ projects: res.items })
        } catch (err) {
            set({ error: err.message })
        } finally {
            set({ isLoading: false })
        }
    },
}))
```

### AI Generation

AI prompts are configured in YAML files at `backend/app/config/`:
- `default_prompts.yaml` - System prompts for each stage
- `story_templates.yaml` - Pre-built story templates

The AI service supports multiple providers via OpenAI-compatible API:

```python
# backend/app/services/ai_service.py
class AIService:
    async def generate_content(self, stage, context, settings, ...):
        prompt = self.prompt_service.build_prompt(stage.stage_type, context, ...)
        client = create_ai_client(settings)
        content = await client.generate(prompt, **kwargs)
        self._save_version(stage, content, settings)
        return content
```

## Database Models

Key models in `backend/app/models/`:

- **Project**: Story project with name, description, tags
- **Stage**: Content for each of the 8 workflow stages
- **StageVersion**: Version history for stage content
- **AISettings**: AI provider configuration (encrypted API keys)
- **SystemPrompt**: Custom system prompts per stage

## Environment Variables

Backend (`.env`):
```
DATABASE_URL=sqlite:///./ai_story.db
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-api-key (optional)
OPENAI_BASE_URL=https://api.openai.com/v1
CORS_ORIGINS=["http://localhost:3000"]
```

Frontend:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing

### Backend
```bash
cd backend
pip install pytest pytest-asyncio
pytest tests/ -v
```

### Frontend
```bash
cd frontend
npm run lint
npm run build  # Type checking
```

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **ci.yml**: Runs on push/PR to main
  - Backend: ruff lint + pytest
  - Frontend: ESLint + build

- **deploy.yml**: Deployment placeholders for Railway/Render/Vercel

## Common Tasks

### Adding a New API Endpoint

1. Create/update route in `backend/app/api/v1/`
2. Add schema in `backend/app/schemas/`
3. Implement service logic in `backend/app/services/`
4. Update endpoint constants in `frontend/src/lib/api/endpoints.ts`
5. Add frontend API call using `apiClient`

### Adding a New Stage Type

1. Add to `StageType` enum in `backend/app/models/enums.py`
2. Update `STAGE_ORDER` and `STAGE_DEPENDENCIES`
3. Add prompt template in `backend/app/config/default_prompts.yaml`
4. Update `StageType` and `STAGE_INFO` in `frontend/src/types/index.ts`

### Modifying AI Prompts

Edit `backend/app/config/default_prompts.yaml` - prompts use placeholders like `{project_name}`, `{idea}`, `{story}`, etc. that are filled with context from previous stages.

## Keyboard Shortcuts

The app supports these shortcuts:
- `Ctrl/Cmd + S`: Save content
- `Ctrl/Cmd + G`: Trigger AI generation
- `Ctrl/Cmd + H`: Toggle version history
- `Ctrl/Cmd + Shift + ←/→`: Switch stages
- `ESC`: Close modals

## Important Notes

1. **Language**: UI and comments are in Traditional Chinese. Code identifiers are in English.

2. **API Key Security**: API keys are encrypted before storage using `backend/app/core/security.py`.

3. **Version Control**: All content changes (manual and AI-generated) are automatically versioned.

4. **Soft Delete**: Projects use soft delete (`is_deleted` flag) rather than hard delete.

5. **Stage Dependencies**: AI generation for later stages requires content from dependent stages.

6. **Export Formats**: Supports PDF, Word, Fountain (screenplay), Excel exports with Chinese font support (Noto Sans TC).
