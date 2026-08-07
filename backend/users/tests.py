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


class UserPreferencesAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='pref_user1', email='pref1@example.com', password='password123')
        self.user2 = User.objects.create_user(username='pref_user2', email='pref2@example.com', password='password123')

    def test_get_user_preferences_default(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/profile/preferences/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['preferred_currency'], 'INR')
        self.assertEqual(res.data['theme_preference'], 'system')
        self.assertEqual(res.data['language'], 'English')
        self.assertEqual(res.data['timezone'], 'Asia/Kolkata')
        self.assertTrue(res.data['email_notifications'])

    def test_update_user_preferences_success(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "preferred_currency": "USD",
            "theme_preference": "dark",
            "email_notifications": False,
            "language": "French",
            "timezone": "Europe/Paris"
        }
        res = self.client.patch('/api/profile/preferences/', data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['preferred_currency'], 'USD')
        self.assertEqual(res.data['theme_preference'], 'dark')
        self.assertFalse(res.data['email_notifications'])
        self.assertEqual(res.data['language'], 'French')
        self.assertEqual(res.data['timezone'], 'Europe/Paris')

    def test_invalid_currency_validation(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.patch('/api/profile/preferences/', {"preferred_currency": "XYZ"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('preferred_currency', res.data)

    def test_invalid_theme_validation(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.patch('/api/profile/preferences/', {"theme_preference": "neon"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('theme_preference', res.data)

    def test_user_preferences_isolation(self):
        self.client.force_authenticate(user=self.user1)
        self.client.patch('/api/profile/preferences/', {"theme_preference": "dark"})

        self.client.force_authenticate(user=self.user2)
        res = self.client.get('/api/profile/preferences/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['theme_preference'], 'system')

