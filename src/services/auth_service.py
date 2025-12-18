"""
Authentication service for user management
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.user import User
from models.schemas import UserCreate, TokenData
from config.settings import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class AuthService:
    """Service class for authentication operations"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password"""
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Generate password hash using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create JWT access token
        
        Args:
            data: Dictionary containing token payload
            expires_delta: Token expiration time delta
            
        Returns:
            Encoded JWT token string
        """
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def decode_access_token(token: str) -> TokenData:
        """
        Decode and verify JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            TokenData object with user information
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM]
            )
            username: str = payload.get("sub")
            user_id: int = payload.get("user_id")
            
            if username is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            token_data = TokenData(username=username, user_id=user_id)
            return token_data
            
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """
        Authenticate user with username and password
        
        Args:
            db: Database session
            username: Username or email
            password: Plain text password
            
        Returns:
            User object if authentication successful, None otherwise
        """
        # Try to find user by username or email
        user = db.query(User).filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user:
            logger.warning(f"Authentication failed: User '{username}' not found")
            return None
        
        if not AuthService.verify_password(password, user.hashed_password):
            logger.warning(f"Authentication failed: Invalid password for user '{username}'")
            return None
        
        if not user.is_active:
            logger.warning(f"Authentication failed: User '{username}' is inactive")
            return None
        
        logger.info(f"User '{username}' authenticated successfully")
        return user
    
    @staticmethod
    def create_user(db: Session, user_create: UserCreate) -> User:
        """
        Create a new user
        
        Args:
            db: Database session
            user_create: User creation schema
            
        Returns:
            Created User object
            
        Raises:
            HTTPException: If username or email already exists
        """
        # Check if username already exists
        existing_user = db.query(User).filter(User.username == user_create.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        existing_email = db.query(User).filter(User.email == user_create.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = AuthService.get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            username=user_create.username,
            hashed_password=hashed_password,
            full_name=user_create.full_name,
            is_active=True,
            is_superuser=False
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"New user created: {db_user.username} ({db_user.email})")
        return db_user
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
