import 'package:flutter/material.dart';
import 'services/auth_service.dart';
import 'pages/login_page.dart';
import 'pages/dashboard_page.dart';
import 'pages/my_tours_page.dart';
import 'pages/tour_history_page.dart';
import 'pages/profile_page.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() {
  runApp(const GuideApp());
}

class GuideApp extends StatelessWidget {
  const GuideApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Guide Portal',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
        fontFamily: 'Roboto',  // Add this for better Turkish character support
        textTheme: const TextTheme(
          bodyLarge: TextStyle(locale: Locale('tr', 'TR')),
          bodyMedium: TextStyle(locale: Locale('tr', 'TR')),
          titleLarge: TextStyle(locale: Locale('tr', 'TR')),
        ),
      ),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('tr', 'TR'),
        Locale('en', 'US'),
      ],
      locale: const Locale('tr', 'TR'),
      initialRoute: '/',
      routes: {
        '/': (context) => const AuthWrapper(),
        '/login': (context) => const LoginPage(),
        '/home': (context) => const GuideHomePage(),
        '/my-tours': (context) => const MyToursPage(),
        '/tour-history': (context) => const TourHistoryPage(),
        '/profile': (context) => const ProfilePage(),
      },
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: AuthService().isLoggedIn(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        
        final isLoggedIn = snapshot.data ?? false;
        if (isLoggedIn) {
          return const GuideHomePage();
        }
        return const LoginPage();
      },
    );
  }
}

class GuideHomePage extends StatefulWidget {
  const GuideHomePage({super.key});

  @override
  State<GuideHomePage> createState() => _GuideHomePageState();
}

class _GuideHomePageState extends State<GuideHomePage> {
  int _selectedIndex = 0;
  
  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      DashboardPage(onPageChange: _onItemTapped),
      const MyToursPage(),
      const ProfilePage(),
    ];

    return Scaffold(
      body: pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Available Tours',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.list),
            label: 'My Tours',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}

