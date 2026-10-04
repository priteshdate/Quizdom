package com.quizdom;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

record loginreq(String username, String password) {}

record signupreq(String username, String name, String email, String password) {}

record QuizSubmission(
    String username,
    String mode,
    int timeTakenSeconds,
    List<Integer> questionIds,
    List<Integer> answers
) {}

record QuizQuestion(int id, String text, List<String> options, String subject) {}

record QuizResult(
    int attemptId,
    int correct,
    int wrong,
    int skipped,
    int score,
    int maxScore,
    double accuracy,
    Map<Integer, Integer> correctAnswers
) {}

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

   @PostMapping("/api/auth/login")
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


    @PostMapping("/api/auth/signup")
public Map<String, Object> signup(@RequestBody signupreq signup_data) {

    Map<String, Object> signupResult = jdbcClient
            .sql("CALL CheckSignup(:username, :name, :email, :password)")
            .param("username", signup_data.username())
            .param("name", signup_data.name())
            .param("email", signup_data.email())
            .param("password", signup_data.password())
            .query()
            .singleRow();

    String result = (String) signupResult.get("result");

    if ("Username already exists".equals(result)) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Username or email already exists"
        );
    }

    if (!"Registration Completed".equals(result)) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Registration failed"
        );
    }

    return Map.of(
            "status", "success",
            "message", "Registration Completed",
            "username", signup_data.username(),
            "email", signup_data.email()
    );
}

    @GetMapping("/api/questions")
    public List<QuizQuestion> getQuestions(@RequestParam List<String> subjects) {
        if (subjects == null || subjects.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select at least one subject.");
        }

        List<QuizQuestion> questions = new java.util.ArrayList<>();
        for (String subject : subjects) {
            questions.addAll(jdbcClient.sql("""
                    SELECT Question_ID, Description, Option_A, Option_B, Option_C, Option_D, Subject
                    FROM Questions
                    WHERE Subject = :subject
                    ORDER BY RAND()
                    LIMIT 10
                    """)
                    .param("subject", subject)
                    .query((rs, rowNum) -> new QuizQuestion(
                            rs.getInt("Question_ID"),
                            rs.getString("Description"),
                            List.of(
                                    rs.getString("Option_A"),
                                    rs.getString("Option_B"),
                                    rs.getString("Option_C"),
                                    rs.getString("Option_D")),
                            rs.getString("Subject")))
                    .list());
        }

        if (questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No questions found for the selected subject(s).");
        }
        return questions;
    }

    @PostMapping("/api/submit")
    public Map<String, Object> submitQuiz(@RequestBody QuizSubmission submission) {

        if (submission.username() == null || submission.username().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please log in again before submitting.");
        }

        int total = submission.questionIds().size();
        int correct = 0;
        int wrong = 0;
        int skipped = 0;
        Map<Integer, Integer> correctAnswers = new HashMap<>();

        for (int i = 0; i < total; i++) {
            int qId = submission.questionIds().get(i);

            Map<String, Object> question = jdbcClient.sql("SELECT CorrectOption FROM Questions WHERE Question_ID = :id")
                    .param("id", qId)
                    .query()
                    .singleRow();

            int correctIdx = question.get("CorrectOption").toString().toUpperCase().charAt(0) - 'A';
            correctAnswers.put(qId, correctIdx);

            Integer selected = i < submission.answers().size() ? submission.answers().get(i) : null;

            if (selected == null) {
                skipped++;
            } else if (selected == correctIdx) {
                correct++;
            } else {
                wrong++;
            }
        }

        int score = (correct * 4) - wrong;
        int maxScore = total * 4;
        int attempted = correct + wrong;
        int accuracy = attempted > 0 ? (int) Math.round(correct * 100.0 / attempted) : 0;

        jdbcClient.sql("""
                INSERT INTO quiz_attempts (username, mode, total_questions, total_score)
                VALUES (:user, :mode, :total, :score)
                """)
                .param("user", submission.username())
                .param("mode", submission.mode())
                .param("total", total)
                .param("score", score)
                .update();

        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("correct", correct);
        result.put("wrong", wrong);
        result.put("skipped", skipped);
        result.put("score", score);
        result.put("finalScore", score);
        result.put("maxScore", maxScore);
        result.put("accuracy", accuracy);
        result.put("correctAnswers", correctAnswers);
        return result;
    }

    @GetMapping("/api/stats")
    public Map<String, Object> getStats(@RequestParam String username) {

        Map<String, Object> row = jdbcClient.sql("""
                SELECT COUNT(*) AS played,
                       COALESCE(SUM(total_score), 0) AS total,
                       COALESCE(MAX(total_score), 0) AS best,
                       COALESCE(ROUND(AVG(total_score)), 0) AS average
                FROM quiz_attempts
                WHERE username = :u
                """)
                .param("u", username)
                .query()
                .singleRow();

        int played = ((Number) row.get("played")).intValue();

        // rank = 1 + number of players whose total score is higher than this user's
        Integer rank = null;
        if (played > 0) {
            Long ahead = jdbcClient.sql("""
                    SELECT COUNT(*) FROM (
                        SELECT username FROM quiz_attempts
                        GROUP BY username
                        HAVING SUM(total_score) > (
                            SELECT COALESCE(SUM(total_score), 0) FROM quiz_attempts WHERE username = :u
                        )
                    ) ahead
                    """)
                    .param("u", username)
                    .query(Long.class)
                    .single();
            rank = ahead.intValue() + 1;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("quizzesPlayed", played);
        result.put("totalScore", ((Number) row.get("total")).intValue());
        result.put("bestScore", ((Number) row.get("best")).intValue());
        result.put("averageScore", ((Number) row.get("average")).intValue());
        result.put("rank", rank);
        return result;
    }

    @GetMapping("/api/data")
    public Map<String, Object> getTableData() {
        List<Map<String, Object>> attempts = new java.util.ArrayList<>();
        List<Map<String, Object>> users = new java.util.ArrayList<>();

        try {
            attempts = jdbcClient.sql("SELECT attempt_id, username, mode, total_questions, time_taken_seconds, correct_count, wrong_count, skipped_count, total_score, max_score, accuracy_percentage, submitted_at FROM quiz_attempts ORDER BY attempt_id DESC").query().listOfRows();
        } catch (Exception e) {
            System.err.println("Error reading quiz_attempts: " + e.getMessage());
        }

        try {
            users = jdbcClient.sql("SELECT username, name, email, created_at FROM userlogin").query().listOfRows();
        } catch (Exception e) {
            System.err.println("Error reading userlogin: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("attempts", attempts);
        result.put("users", users);
        return result;
    }
}
