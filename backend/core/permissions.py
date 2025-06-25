from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsSuperUserOrOwner(BasePermission):
    """
    Superuser has full access.
    Others can only view or modify their own objects.
    """
    def has_object_permission(self, request, view, obj):
        # Superusers have full access
        if request.user and request.user.is_superuser:
            return True

        # SAFE_METHODS = GET, HEAD, OPTIONS
        if request.method in SAFE_METHODS:
            return obj.creator == request.user

        # For update/delete
        return obj.creator == request.user
