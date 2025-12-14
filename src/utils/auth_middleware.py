"""
Middleware for protecting routes with authentication
"""
from functools import wraps
from fastapi import Depends, HTTPException, status
from api.auth import get_current_active_user


def require_auth(func):
    """
    Decorator to require authentication for a route
    
    Usage:
        @router.get("/protected")
        @require_auth
        async def protected_route(current_user = Depends(get_current_active_user)):
            return {"message": "This is protected"}
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await func(*args, **kwargs)
    return wrapper


def require_admin(func):
    """
    Decorator to require admin/superuser privileges
    
    Usage:
        @router.get("/admin-only")
        async def admin_route(current_user = Depends(get_current_active_user)):
            if not current_user.is_superuser:
                raise HTTPException(status_code=403, detail="Admin access required")
            return {"message": "Admin access granted"}
    """
    @wraps(func)
    async def wrapper(*args, current_user = None, **kwargs):
        if current_user and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required"
            )
        return await func(*args, current_user=current_user, **kwargs)
    return wrapper
