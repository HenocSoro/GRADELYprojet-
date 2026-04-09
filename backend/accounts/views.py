from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

User = get_user_model()


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")
    role = request.data.get("role", "student")

    if not email or not password:
        return Response({"error": "Email et mot de passe requis."}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Un compte avec cet email existe déjà."}, status=400)

    user = User.objects.create_user(email=email, password=password)
    if role == "supervisor":
        user.is_staff = True
        user.save()

    return Response({"message": "Compte créé avec succès."}, status=201)
