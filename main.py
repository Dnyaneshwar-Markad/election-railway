from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
from datetime import datetime, timedelta, date
from typing import Optional, List, Any, Dict
from psycopg_pool import ConnectionPool

# ==================== CONFIG ====================
SECRET_KEY = "your-secret-key-change-this-12345"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080

DATABASE_URL = (
    "postgresql://neondb_owner:npg_rs1bVogh7EtU@"
    "ep-weathered-math-a1pj9ocn-pooler.ap-southeast-1.aws.neon.tech/"
    "neondb?sslmode=require"
)

# ==================== APP ====================
app = FastAPI(title="Login API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# ==================== DB POOL ====================
pool = ConnectionPool(
    DATABASE_URL,
    min_size=1,
    max_size=5,
    timeout=30
)

VISITED_COLUMN_CACHE = set()

@app.on_event("startup")
def startup_cache():
    """Cache column names once to avoid slow information_schema queries."""
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'VoterList'
            """)
            for row in cur.fetchall():
                VISITED_COLUMN_CACHE.add(row[0])

# ==================== MODELS ====================
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    role: str
    main_admin_id: int
    section_no: Optional[int]

class UserResponse(BaseModel):
    user_id: int
    username: str
    role: str
    main_admin_id: int
    section_no: Optional[int]

# ==================== AUTH ====================
def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {**data, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== ROOT ====================
@app.get("/")
def root():
    return {"status": "API running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"ok": True}

# ==================== LOGIN ====================
@app.post("/login", response_model=LoginResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT "UserID","Username","Role","ParentID","SectionNo"
                FROM "User"
                WHERE "Username"=%s AND "Password"=%s
            """, (form_data.username, form_data.password))
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    user_id, username, role, parent_id, section_no = row
    main_admin_id = user_id if parent_id in (None, 0) else parent_id

    token = create_access_token({
        "user_id": user_id,
        "username": username,
        "role": role,
        "main_admin_id": main_admin_id,
        "section_no": section_no
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user_id,
        "username": username,
        "role": role,
        "main_admin_id": main_admin_id,
        "section_no": section_no
    }

# ==================== ME ====================
@app.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    return current_user

# ==================== VOTERS ====================
@app.get("/voters")
def get_voters(
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user=Depends(get_current_user)
):
    section_no = current_user.get("section_no")
    admin_id = current_user.get("main_admin_id")
    visited_col = f"Visited_{admin_id}"

    visited_expr = (
        f'"{visited_col}"'
        if visited_col in VISITED_COLUMN_CACHE
        else '"Visited"'
    )

    where = ['"SectionNo"=%s']
    params: List[Any] = [section_no]

    if search:
        where.append('("EName" ILIKE %s OR "VEName" ILIKE %s)')
        params += [f"%{search}%", f"%{search}%"]

    where_sql = " AND ".join(where)

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT "VoterID","EName","VEName","Sex","Age",{visited_expr} AS "Visited"
                FROM "VoterList"
                WHERE {where_sql}
                ORDER BY "VoterID"
                LIMIT %s OFFSET %s
            """, params + [limit, offset])

            rows = cur.fetchall()
            cols = [d[0] for d in cur.description]
            data = [dict(zip(cols, r)) for r in rows]

            cur.execute(f'SELECT COUNT(*) FROM "VoterList" WHERE {where_sql}', params)
            total = cur.fetchone()[0]

    return {"total": total, "rows": data}

# ==================== SUMMARY ====================
@app.get("/voters/summary")
def voters_summary(current_user=Depends(get_current_user)):
    section_no = current_user.get("section_no")
    admin_id = current_user.get("main_admin_id")
    visited_col = f"Visited_{admin_id}"

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT COUNT(*) FROM "VoterList" WHERE "SectionNo"=%s',
                (section_no,)
            )
            total = cur.fetchone()[0]

            if visited_col in VISITED_COLUMN_CACHE:
                cur.execute(
                    f'SELECT COUNT(*) FROM "VoterList" WHERE "{visited_col}"=TRUE AND "SectionNo"=%s',
                    (section_no,)
                )
                visited = cur.fetchone()[0]
            else:
                visited = 0

            cur.execute(
                'SELECT "Sex", COUNT(*) FROM "VoterList" WHERE "SectionNo"=%s GROUP BY "Sex"',
                (section_no,)
            )
            sex = dict(cur.fetchall())

    return {
        "total": total,
        "visited": visited,
        "not_visited": total - visited,
        "sex_breakdown": sex
    }

# ==================== RUN ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
