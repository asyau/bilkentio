import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/tour.dart';
import '../widgets/tour_card.dart'; 

class TourHistoryPage extends StatefulWidget {
  const TourHistoryPage({super.key});

  @override
  State<TourHistoryPage> createState() => _TourHistoryPageState();
}

class _TourHistoryPageState extends State<TourHistoryPage> {
  late Future<List<Tour>> _tourHistory;
  final _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _tourHistory = _apiService.getTourHistory();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tour History'),
      ),
      body: FutureBuilder<List<Tour>>(
        future: _tourHistory,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return ListView.builder(
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                final tour = snapshot.data![index];
                return TourCard(
                  tour: tour,
                  onJoinTour: (_) {}, // No-op function since this is history view
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