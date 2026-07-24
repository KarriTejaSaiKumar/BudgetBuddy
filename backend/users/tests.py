from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Profile

class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.logout_url = reverse('auth_logout')
        self.protected_url = reverse('auth_protected')

        self.user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "testpassword123",
            "phone": "+1234567890",
            "currency": "USD",
            "bio": "Test bio text"
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
        
        # Verify Profile was created
        user = User.objects.get(username='testuser')
        self.assertEqual(user.profile.phone, '+1234567890')
        self.assertEqual(user.profile.currency, 'USD')
        self.assertEqual(user.profile.bio, 'Test bio text')

    def test_user_login(self):
        # Register first
        self.client.post(self.register_url, self.user_data, format='json')

        # Login
        login_data = {
            "username": "testuser",
            "password": "testpassword123"
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_protected_route_access(self):
        # Register and login to get access token
        self.client.post(self.register_url, self.user_data, format='json')
        login_data = {
            "username": "testuser",
            "password": "testpassword123"
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        access_token = login_response.data['access']

        # Try accessing protected route without token
        response = self.client.get(self.protected_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Try accessing with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.protected_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "You have accessed a protected route successfully!")

    def test_user_logout(self):
        # Register and login to get tokens
        self.client.post(self.register_url, self.user_data, format='json')
        login_data = {
            "username": "testuser",
            "password": "testpassword123"
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        access_token = login_response.data['access']
        refresh_token = login_response.data['refresh']

        # Logout by blacklisting refresh token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.post(self.logout_url, {"refresh": refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
