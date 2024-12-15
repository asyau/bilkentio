import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';



class AuthService {
  static const String baseUrl = 'https://8562-139-179-40-158.ngrok-free.app';
  static const String tokenKey = 'jwt';
  
  Future<String> login(String username, String password) async {
    try {
      print('Attempting login for user: $username');
      
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json.encode({
          'username': username,
          'password': password,
        }),
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        final token = responseData['jwt'];
        if (token == null) {
          throw Exception('Token not found in response');
        }
        await SharedPreferences.getInstance()
          .then((prefs) => prefs.setString(tokenKey, token));
        return token;
      } else {
        throw Exception('Status ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('Login error: $e');
      throw Exception('Failed to login: $e');
    }
  }

  Future<void> logout() async {
    await SharedPreferences.getInstance()
      .then((prefs) => prefs.remove(tokenKey));
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(tokenKey);
    return token != null;
  }

  Future<String?> getStoredToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(tokenKey);
  }
}