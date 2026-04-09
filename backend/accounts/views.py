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

    # create_user(username, email=None, password=...) — USERNAME_FIELD=email mais le champ
    # username reste obligatoire et unique (AbstractUser).
    local = email.split("@", 1)[0].replace(".", "_") or "user"
    base = local[:100]
    username = base
    n = 0
    while User.objects.filter(username=username).exists():
        n += 1
        username = f"{base}{n}"[:150]

    role_norm = (role or "student").lower()
    is_supervisor = role_norm in ("supervisor", "superviseur")

    if is_supervisor:
        user = User.objects.create_user(username, email, password, is_staff=True)
    else:
        user = User.objects.create_user(username, email, password)

    return Response(
        {"message": "Compte créé avec succès.", "email": user.email, "role": user.role},
        status=201,
    )
