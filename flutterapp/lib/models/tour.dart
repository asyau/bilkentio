import 'dart:convert';

class Tour {
  final int id;
  final String schoolName;
  final DateTime date;
  final String time;
  final int groupSize;
  final String status;
  final String? tourType;
  final String? groupLeaderRole;
  final String? groupLeaderPhone;
  final String? groupLeaderEmail;
  final int? rating;
  final String? feedback;

  Tour({
    required this.id,
    required this.schoolName,
    required this.date,
    required this.time,
    required this.groupSize,
    required this.status,
    this.tourType,
    this.groupLeaderRole,
    this.groupLeaderPhone,
    this.groupLeaderEmail,
    this.rating,
    this.feedback,
  });

  factory Tour.fromJson(Map<String, dynamic> json) {
    String processText(String? text) {
      if (text == null) return '';
      try {
        return utf8.decode(text.runes.toList());
      } catch (e) {
        return text;
      }
    }
    return Tour(
      id: json['id'],
      schoolName: processText(json['schoolName'] ?? 'Individual Tour'),
      date: DateTime.parse(json['date']),
      time: json['time'],
      groupSize: json['groupSize'] ?? 1,
      status: json['status'],
      tourType: json['tourType'],
      groupLeaderRole: json['groupLeaderRole'],
      groupLeaderPhone: json['groupLeaderPhone'],
      groupLeaderEmail: processText(json['groupLeaderEmail']),
      rating: json['rating'],
      feedback: json['feedback'],
    );
  }
}