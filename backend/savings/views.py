from django.db.models import Sum
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from notifications.services import create_notification
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
        goal = serializer.save(user=self.request.user)
        create_notification(
            user=self.request.user,
            title="Savings Goal Created",
            message=f'Your savings goal "{goal.goal_name}" with a target of {goal.target_amount} has been created.',
            notification_type="savings",
            priority="info"
        )
        if goal.is_completed:
            create_notification(
                user=self.request.user,
                title="Savings Goal Completed",
                message=f'Congratulations! You have achieved your savings goal "{goal.goal_name}".',
                notification_type="savings",
                priority="success"
            )

class SavingsListView(generics.ListCreateAPIView):
    """
    GET /api/savings/ - List all savings goals for the authenticated user.
    POST /api/savings/ - Create a new savings goal for the authenticated user.
    """
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = SavingsGoal.objects.filter(user=self.request.user)
        is_completed = self.request.query_params.get('is_completed', None)
        if is_completed is not None and is_completed.strip():
            val = is_completed.strip().lower()
            if val in ['true', '1']:
                queryset = queryset.filter(is_completed=True)
            elif val in ['false', '0']:
                queryset = queryset.filter(is_completed=False)
        return queryset

    def perform_create(self, serializer):
        goal = serializer.save(user=self.request.user)
        create_notification(
            user=self.request.user,
            title="Savings Goal Created",
            message=f'Your savings goal "{goal.goal_name}" with a target of {goal.target_amount} has been created.',
            notification_type="savings",
            priority="info"
        )
        if goal.is_completed:
            create_notification(
                user=self.request.user,
                title="Savings Goal Completed",
                message=f'Congratulations! You have achieved your savings goal "{goal.goal_name}".',
                notification_type="savings",
                priority="success"
            )

class SavingsRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/savings/<uuid:pk>/ - Detail, Update, and Delete view.
    """
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        was_completed = serializer.instance.is_completed
        goal = serializer.save()
        create_notification(
            user=self.request.user,
            title="Savings Goal Updated",
            message=f'Your savings goal "{goal.goal_name}" has been updated.',
            notification_type="savings",
            priority="info"
        )
        if not was_completed and goal.is_completed:
            create_notification(
                user=self.request.user,
                title="Savings Goal Completed",
                message=f'Congratulations! You have achieved your savings goal "{goal.goal_name}".',
                notification_type="savings",
                priority="success"
            )

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

    def perform_update(self, serializer):
        was_completed = serializer.instance.is_completed
        goal = serializer.save()
        create_notification(
            user=self.request.user,
            title="Savings Goal Updated",
            message=f'Your savings goal "{goal.goal_name}" has been updated.',
            notification_type="savings",
            priority="info"
        )
        if not was_completed and goal.is_completed:
            create_notification(
                user=self.request.user,
                title="Savings Goal Completed",
                message=f'Congratulations! You have achieved your savings goal "{goal.goal_name}".',
                notification_type="savings",
                priority="success"
            )

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
        if remaining_savings < 0:
            remaining_savings = 0.0

        if total_goal > 0:
            goal_completion_percentage = round((total_saved / total_goal) * 100, 2)
            if goal_completion_percentage > 100.0:
                goal_completion_percentage = 100.0
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

