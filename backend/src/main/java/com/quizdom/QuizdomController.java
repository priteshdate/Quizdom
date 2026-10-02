package com.quizdom;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

record loginreq(String username, String password) {}

record signupreq(String username, String name, String email, String password) {}

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "*"})
public class QuizdomController {

    private final JdbcClient jdbcClient;

    public QuizdomController(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Bean
    CommandLineRunner test(JdbcClient jdbcClient) {
        return args -> {
            try {
                jdbcClient.sql("SELECT 1").query().singleRow();
                System.out.println("Connected Succesfully");
            } catch (Exception e) {
                System.out.println("Database not connected");
                System.out.println(e.getMessage());
            }
        };
    }

    @PostMapping({"/login", "/api/auth/login"})
public Map<String, Object> login(@RequestBody loginreq login_data) {

    Map<String, Object> userData = jdbcClient.sql("CALL CheckLogin(:username, :password)")
            .param("username", login_data.username())
            .param("password", login_data.password())
            .query()
            .singleRow(); 

    String result = (String) userData.get("result");

    if (!"Verified".equals(result)) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    // Return the successful login response including details from your database row
    return Map.of(
        "status", "success",
        "message", "Login successful",
        "username", userData.get("username"),
        "email", userData.get("email"),
        "created_at", userData.get("created_at").toString()
    );
}


    @PostMapping("/signup")
    public Map<String, String> signup(@RequestBody signupreq signup_data) {
        String result = jdbcClient.sql("CALL CheckLogin(:username,:name, :password)")
                .param("username", signup_data.username())
                .param("name", signup_data.password())
                .param("password", signup_data.password())
                .query(String.class)
                .optional()
                .orElse(null);

        if (!"Username already exists".equals(result)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username already exists");
        }

        return Map.of("message", "Registration Completed");
    }

    @PostMapping("/api/submit")
    public Map<String, String> submitQuiz(@RequestBody QuizSubmission submission) {
        String sql = """
            INSERT INTO quiz_attempts 
            (user_id, mode, total_questions, time_taken_seconds, correct_count, wrong_count, skipped_count, total_score, max_score, accuracy_percentage)
            VALUES (:userId, :mode, :totalQuestions, :timeTakenSeconds, :correctCount, :wrongCount, :skippedCount, :totalScore, :maxScore, :accuracyPercentage)
            """;
            
        int rows = jdbcClient.sql(sql)
            .param("userId", submission.userId())
            .param("mode", submission.mode())
            .param("totalQuestions", submission.totalQuestions())
            .param("timeTakenSeconds", submission.timeTakenSeconds())
            .param("correctCount", submission.correctCount())
            .param("wrongCount", submission.wrongCount())
            .param("skippedCount", submission.skippedCount())
            .param("totalScore", submission.totalScore())
            .param("maxScore", submission.maxScore())
            .param("accuracyPercentage", submission.accuracyPercentage())
            .update();
            
        if (rows != 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to record quiz attempt.");
        }
        
        return Map.of("message", "Quiz attempt recorded successfully.");
    }

    @GetMapping("/api/data")
    public List<Map<String, Object>> getTableData() {
        try {
            List<Map<String, Object>> attempts = jdbcClient.sql("SELECT attempt_id, user_id, mode, total_questions, time_taken_seconds, correct_count, wrong_count, skipped_count, total_score, max_score, accuracy_percentage, submitted_at FROM quiz_attempts ORDER BY attempt_id DESC").query().listOfRows();
            if (!attempts.isEmpty()) {
                return attempts;
            }
        } catch (Exception e) {
            System.err.println("Error reading quiz_attempts: " + e.getMessage());
        }

        try {
            return jdbcClient.sql("SELECT user_id, username, name, email, created_at FROM users").query().listOfRows();
        } catch (Exception e) {
            System.err.println("Error reading users: " + e.getMessage());
        }

        return List.of(
            Map.of("status", "No records found in database tables")
        );
    }
}

record QuizSubmission(
    int userId,
    String mode,
    int totalQuestions,
    int timeTakenSeconds,
    int correctCount,
    int wrongCount,
    int skippedCount,
    int totalScore,
    int maxScore,
    double accuracyPercentage
) {}
