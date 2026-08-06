from django.db.models import Sum
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SavingsGoal
from .serializers import SavingsGoalSerializer

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a savings goal to view or edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class SavingsCreateView(generics.CreateAPIView):
    """
    POST /api/savings/create/ - Create a new savings goal for the authenticated user.
    """
    queryset = SavingsGoal.objects.all()
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SavingsListView(generics.ListAPIView):
    """
    GET /api/savings/ - List all savings goals for the authenticated user.
    """
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

class SavingsRetrieveView(generics.RetrieveAPIView):
    """
    GET /api/savings/<uuid:pk>/ - Retrieve details of a specific savings goal.
    """
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

class SavingsUpdateView(generics.UpdateAPIView):
    """
    PUT/PATCH /api/savings/<uuid:pk>/update/ - Update a specific savings goal.
    """
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

class SavingsDestroyView(generics.DestroyAPIView):
    """
    DELETE /api/savings/<uuid:pk>/delete/ - Delete a specific savings goal.
    """
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

class ProtectedSavingsSummaryView(APIView):
    """
    GET /api/savings/summary/
    Returns the savings summary (total goal, total saved, remaining, percentage) for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        aggregates = SavingsGoal.objects.filter(user=request.user).aggregate(
            total_goal=Sum('target_amount'),
            total_saved=Sum('current_amount')
        )

        total_goal = float(aggregates['total_goal']) if aggregates['total_goal'] is not None else 0.0
        total_saved = float(aggregates['total_saved']) if aggregates['total_saved'] is not None else 0.0
        remaining_savings = total_goal - total_saved

        if total_goal > 0:
            goal_completion_percentage = (total_saved / total_goal) * 100
        else:
            goal_completion_percentage = 0.0

        return Response(
            {
                "total_savings_goal": total_goal,
                "total_saved": total_saved,
                "remaining_savings": remaining_savings,
                "goal_completion_percentage": goal_completion_percentage,
            },
            status=status.HTTP_200_OK,
        )
