import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/tour.dart';
import '../widgets/tour_card.dart'; 

class MyToursPage extends StatefulWidget {
  const MyToursPage({super.key});

  @override
  State<MyToursPage> createState() => _MyToursPageState();
}

class _MyToursPageState extends State<MyToursPage> {
  late Future<List<Tour>> _myTours;
  final _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _loadTours();
  }

  void _loadTours() {
    setState(() {
      _myTours = _apiService.getMyTours();
    });
  }

  Future<void> _handleUpdateTourStatus(Tour tour) async {
    try {
      if (tour.tourType == 'individual') {
        await _apiService.completeIndividualTour(tour.id);
      } else {
        await _apiService.updateTourStatus(tour.id, "FINISHED");
      }

      setState(() {
        _myTours = _apiService.getMyTours();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Tour marked as finished successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to finish tour: ${e.toString()}')),
      );
    }

  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Tours'),
      ),
      body: FutureBuilder<List<Tour>>(
        future: _myTours,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return ListView.builder(
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                final tour = snapshot.data![index];
                return TourCard(
        tour: tour,
  onJoinTour: (_) {}, // Empty function since we don't need join functionality
  onFinishTour: _handleUpdateTourStatus,
  showFinishButton: true,
  showJoinButton: false,
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