import 'package:flutter/material.dart';
import '../models/tour.dart';

class TourCard extends StatelessWidget {
  final Tour tour;
  final Function(Tour) onJoinTour;
  final Function(Tour)? onFinishTour;
  final bool showJoinButton;
  final bool showFinishButton;

  const TourCard({
    super.key, 
    required this.tour,
    required this.onJoinTour,
    this.onFinishTour, 
    this.showJoinButton = false,
    this.showFinishButton = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(8.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    tour.schoolName,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                if (tour.tourType != null)
                  Chip(
                    label: Text(tour.tourType == 'individual' ? 'Individual' : 'Group'),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Date: ${tour.date.toString().split(' ')[0]}'),
            Text('Time: ${tour.time}'),
            Text('Group Size: ${tour.groupSize}'),
            Text('Status: ${tour.status}'),
            if (tour.groupLeaderRole != null) ...[
              const SizedBox(height: 16),
              Text('Group Leader Role: ${tour.groupLeaderRole}'),
              Text('Phone: ${tour.groupLeaderPhone}'),
              Text('Email: ${tour.groupLeaderEmail}'),
            ],
            if (showJoinButton) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => onJoinTour(tour),
                  child: Text(tour.tourType == 'individual' ? 'Accept Request' : 'Join Tour'),
                ),
              ),
            ],
            if (showFinishButton && tour.status == 'WAITING_TO_FINISH') ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onFinishTour != null ? () => onFinishTour!(tour) : null,
                  child: Text(tour.tourType == 'individual' ? 'Complete Tour' : 'Mark as Finished'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}