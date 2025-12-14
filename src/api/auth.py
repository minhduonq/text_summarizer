"""
Authentication API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from models.database import get_db
from models.schemas import UserCreate, UserResponse, Token, UserLogin
from services.auth_service import AuthService
from config.settings import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Dependency to get current authenticated user from JWT token
    """
    token_data = AuthService.decode_access_token(token)
    user = AuthService.get_user_by_username(db, username=token_data.username)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(current_user = Depends(get_current_user)):
    """
    Dependency to get current active user
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_create: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user
    
    - **email**: Valid email address (must be unique)
    - **username**: Username (3-50 characters, alphanumeric with _ and -, must be unique)
    - **password**: Password (minimum 6 characters)
    - **password_confirm**: Password confirmation (must match password)
    - **full_name**: Optional full name
    """
    try:
        user = AuthService.create_user(db, user_create)
        logger.info(f"User registered successfully: {user.username}")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


@router.post("/auth/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with username/email and password
    
    Returns JWT access token for authentication
    
    - **username**: Username or email
    - **password**: User password
    """
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        logger.warning(f"Failed login attempt for: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in successfully: {user.username}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/auth/login-json", response_model=Token)
async def login_json(
    user_login: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login with JSON payload (alternative to form data)
    
    Returns JWT access token for authentication
    
    - **username**: Username or email
    - **password**: User password
    """
    user = AuthService.authenticate_user(db, user_login.username, user_login.password)
    
    if not user:
        logger.warning(f"Failed login attempt for: {user_login.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in successfully: {user.username}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_active_user)
):
    """
    Get current authenticated user information
    
    Requires authentication token in Authorization header
    """
    return current_user


@router.get("/auth/verify")
async def verify_token(
    current_user = Depends(get_current_active_user)
):
    """
    Verify if the current token is valid
    
    Returns user information if token is valid
    """
    return {
        "valid": True,
        "user_id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }
