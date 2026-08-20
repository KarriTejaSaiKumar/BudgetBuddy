from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from rest_framework import status

from .services.orchestrator import ChatOrchestrator


class ChatRateThrottle(UserRateThrottle):
    rate = '60/minute'


class ChatAssistantView(APIView):
    """
    API endpoint for BudgetBuddy AI Assistant.
    Processes user financial queries using the dedicated ChatOrchestrator service layer.
    Enforces authentication, payload limits, and rate limiting against abuse.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ChatRateThrottle]

    def post(self, request):
        raw_message = request.data.get('message')
        if not raw_message or not isinstance(raw_message, str) or not raw_message.strip():
            return Response(
                {'response': 'Please say or type something so I can help you.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        message = raw_message.strip()

        # Abuse protection: reject oversized messages
        if len(message) > 1000:
            return Response(
                {'response': 'Message is too long. Please keep your question under 1000 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session_context = request.data.get('session_context')
        if session_context is not None and not isinstance(session_context, dict):
            session_context = {}

        # Delegate processing to ChatOrchestrator with authenticated request.user
        orchestrator = ChatOrchestrator(user=request.user)
        result = orchestrator.process(message=message, session_context=session_context)

        return Response(result, status=status.HTTP_200_OK)
