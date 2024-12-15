import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/tour.dart';
import 'auth_service.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class ApiService {
  static const String baseUrl = 'https://8562-139-179-40-158.ngrok-free.app';
  final _authService = AuthService();

  Future<String?> _getToken() async {
    return await _authService.getStoredToken();
  }

  String _decodeUtf8(dynamic data) {
    if (data == null) return '';
    if (data is String) {
      return utf8.decode(data.codeUnits);
    }
    return data.toString();
  }

  Map<String, dynamic> _processResponse(http.Response response) {
    final decodedBody = utf8.decode(response.bodyBytes);
    return json.decode(decodedBody);
  }

  Future<List<Tour>> getAvailableTours() async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final groupResponse = await http.get(
        Uri.parse('$baseUrl/api/tours?status=GUIDES_PENDING'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () => throw Exception('Connection timeout'),
      );

      final individualResponse = await http.get(
        Uri.parse('$baseUrl/api/individual-tours/available'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () => throw Exception('Connection timeout'),
      );

      if (groupResponse.statusCode == 200 && individualResponse.statusCode == 200) {
        final groupData = json.decode(groupResponse.body) as List<dynamic>;
        final individualData = json.decode(individualResponse.body) as List<dynamic>;

        final groupTours = groupData.map((json) => Tour.fromJson({
          ...json,
          'tourType': 'group',
          'schoolName': json['schoolName'] ?? 'Unknown School',
          'time': json['time'] ?? '00:00',
          'groupSize': json['groupSize'] ?? 1,
          'status': json['status'] ?? 'PENDING',
        })).toList();

        final individualTours = individualData.map((json) => Tour.fromJson({
          ...json,
          'tourType': 'individual',
          'schoolName': 'Individual Tour',
          'time': json['time'] ?? '00:00',
          'groupSize': 1,
          'status': json['status'] ?? 'PENDING',
        })).toList();

        return [...groupTours, ...individualTours];
      } else {
        print('Group tours response: ${groupResponse.statusCode}');
        print('Individual tours response: ${individualResponse.statusCode}');
        throw Exception('Failed to fetch tours');
      }
    } catch (e) {
      print('Error in getAvailableTours: $e');
      throw Exception('Failed to load available tours: $e');
    }
  }

  Future<void> joinTour(int tourId, int guideId) async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/tours/$tourId/guides/$guideId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () => throw Exception('Connection timeout'),
      );

      print('Join tour response status: ${response.statusCode}');
      print('Join tour response body: ${response.body}');

      if (response.statusCode != 200) {
        final String errorMessage = response.body.isNotEmpty 
          ? json.decode(response.body)['message'] ?? 'Failed to join tour'
          : 'Failed to join tour: Server returned ${response.statusCode}';
        throw Exception(errorMessage);
      }
    } catch (e) {
      print('Error in joinTour: $e');
      if (e is FormatException) {
        throw Exception('Failed to join tour: Server returned invalid response');
      }
      throw Exception('Failed to join tour: ${e.toString()}');
    }
  }

  Future<List<Tour>> getMyTours() async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    final decodedToken = JwtDecoder.decode(token);
    final userId = decodedToken['userId'];

    final groupResponse = await http.get(
      Uri.parse('$baseUrl/api/tours/guide/$userId'),
      headers: {'Authorization': 'Bearer $token'},
    );

    final individualResponse = await http.get(
      Uri.parse('$baseUrl/api/individual-tours/guide/$userId'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (groupResponse.statusCode == 200 && individualResponse.statusCode == 200) {
      List<dynamic> groupTours = json.decode(groupResponse.body);
      List<dynamic> individualTours = json.decode(individualResponse.body);
      
      return [
        ...groupTours.map((json) => Tour.fromJson({...json, 'tourType': 'group'})),
        ...individualTours.map((json) => Tour.fromJson({...json, 'tourType': 'individual'}))
      ];
    } else {
      throw Exception('Failed to load my tours');
    }
  }

  Future<List<Tour>> getTourHistory() async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    final decodedToken = JwtDecoder.decode(token);
    final userId = decodedToken['userId'];

    final response = await http.get(
      Uri.parse('$baseUrl/api/guides/$userId/tours'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      List<Tour> allTours = [
        ...data['completedGroupTours'].map((json) => Tour.fromJson({...json, 'tourType': 'group'})),
        ...data['completedIndividualTours'].map((json) => Tour.fromJson({...json, 'tourType': 'individual'}))
      ];
      return allTours;
    } else {
      throw Exception('Failed to load tour history');
    }
  }

  Future<Map<String, dynamic>> getGuideProfile() async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');

    final decodedToken = JwtDecoder.decode(token);
    final userId = decodedToken['userId'];

    final response = await http.get(
      Uri.parse('$baseUrl/api/guides/$userId/profile'),
      headers: {
        'Authorization': 'Bearer $token',
        'Accept-Charset': 'utf-8',
      },
    );

    if (response.statusCode == 200) {
      final data = _processResponse(response);
      return {
        ...data,
        'name': _decodeUtf8(data['name']),
        'schoolName': _decodeUtf8(data['schoolName']),
        'city': _decodeUtf8(data['city']),
      };
    } else {
      throw Exception('Failed to load profile');
    }
  }

  Future<void> joinIndividualTour(int tourId, int guideId) async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/individual-tours/$tourId/join/$guideId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        final String errorMessage = response.body.isNotEmpty 
          ? json.decode(response.body)['message'] ?? 'Failed to join individual tour'
          : 'Failed to join individual tour';
        throw Exception(errorMessage);
      }
    } catch (e) {
      if (e is FormatException) {
        throw Exception('Failed to join individual tour: Server error');
      }
      throw Exception('Failed to join individual tour: ${e.toString()}');
    }
  }

  Future<String?> getToken() async {
    return await _getToken();
  }

  Future<void> updateTourStatus(int tourId, String newStatus) async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.put(
      Uri.parse('$baseUrl/api/tours/$tourId/status'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({'status': newStatus}),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update tour status');
    }
  }

  Future<void> completeIndividualTour(int tourId) async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.post(
      Uri.parse('$baseUrl/api/individual-tours/$tourId/complete'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to complete individual tour');
    }
  }



  // Add more API methods as needed
} 