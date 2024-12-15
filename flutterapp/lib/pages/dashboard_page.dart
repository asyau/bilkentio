import 'package:flutter/material.dart';
import '../models/tour.dart';
import '../services/api_service.dart';
import '../widgets/tour_card.dart'; 
import 'package:jwt_decoder/jwt_decoder.dart';

class DashboardPage extends StatefulWidget {
  final Function(int) onPageChange;
  const DashboardPage({super.key, required this.onPageChange});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  late Future<List<Tour>> _availableTours;
  final _apiService = ApiService();
  
  @override
  void initState() {
    super.initState();
    _loadTours();
  }

  void _loadTours() {
    _availableTours = _apiService.getAvailableTours();
  }

  Future<void> _handleJoinTour(Tour tour) async {
    try {
      final token = await _apiService.getToken();
      if (token == null) return;

      final decodedToken = JwtDecoder.decode(token);
      final userId = decodedToken['userId'];

      if (tour.tourType == 'individual') {
        await _apiService.joinIndividualTour(tour.id, userId);
      } else {
        await _apiService.joinTour(tour.id, userId);
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Successfully joined ${tour.tourType == 'individual' ? 'individual tour' : 'group tour'}!'),
          backgroundColor: Colors.green,
        ),
      );

      widget.onPageChange(1);

    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to join tour: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Available Tours'),
      ),
      body: FutureBuilder<List<Tour>>(
        future: _availableTours,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return ListView.builder(
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                final tour = snapshot.data![index];
                return TourCard(
                  tour: tour,
                  onJoinTour: _handleJoinTour,
                  showJoinButton: true,
                );
              },
            );
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          return const Center(child: CircularProgressIndicator());
        },
      ),
    );
  }
}


