package com.example.bilkentio_backend.authentication;

import com.example.bilkentio_backend.authentication.filter.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**", "/api/auth/**").permitAll()
                .requestMatchers("/api/users/update-username").authenticated()
                .requestMatchers("/api/users/*/change-password").authenticated()
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "COORDINATOR", "COORDİNATOR")
                .requestMatchers("/api/assistant/**").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/days/**").permitAll()
                .requestMatchers("/api/schools/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/fairs/**").hasAnyRole("ADMIN", "COORDINATOR", "COUNSELOR")
                .requestMatchers(HttpMethod.POST, "/api/fairs/**").hasAnyRole("ADMIN", "COORDINATOR", "COUNSELOR")
                .requestMatchers(HttpMethod.PUT, "/api/fairs/**").hasAnyRole("ADMIN", "COORDINATOR")
                .requestMatchers("/api/advisors/**").hasAnyRole("ADMIN", "COORDINATOR", "COORDİNATOR", "ADVISOR", "GUIDE", "GUİDE")
                .requestMatchers("/api/advisors/**").hasAnyRole("ADMIN", "COORDINATOR", "COORDİNATOR", "ADVISOR", "GUIDE", "GUİDE")
                .requestMatchers(HttpMethod.GET, "/api/forms/**").hasAnyRole("ADMIN", "COORDINATOR", "COORDİNATOR", "ADVISOR", "GUIDE", "COUNSELOR")
                .requestMatchers(HttpMethod.POST, "/api/forms/**").hasAnyRole("ADMIN", "COORDINATOR", "COORDİNATOR", "ADVISOR", "COUNSELOR")
                .requestMatchers(HttpMethod.PUT, "/api/forms/**").hasAnyRole("ADMIN", "COORDINATOR", "COORDİNATOR", "ADVISOR", "COUNSELOR")
                .requestMatchers("/api/tours/**").hasAnyRole("ADMIN", "COORDINATOR", "COORDİNATOR", "ADVISOR", "GUIDE", "GUİDE", "COUNSELOR")
                .requestMatchers("/api/guides/**").hasAnyRole("ADMIN", "COORDINATOR", "COORDİNATOR", "GUIDE")
                .requestMatchers("/api/coordinators/**").hasAnyRole("ADMIN", "COORDINATOR", "COORDİNATOR")
                .requestMatchers("/api/presidents/**").hasAnyRole("ADMIN", "COORDINATOR", "COORDİNATOR", "PRESIDENT")
                .requestMatchers("/api/schools/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "https://8562-139-179-40-158.ngrok-free.app",
            "http://8562-139-179-40-158.ngrok-free.app"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}