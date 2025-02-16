package com.hexa.muinus.openvidu;

import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
public class OpenViduController {

    @Value("${OPENVIDU_URL}")
    private String OPENVIDU_URL;

    @Value("${OPENVIDU_SECRET}")
    private String OPENVIDU_SECRET;

    private OpenVidu openvidu;

    @PostConstruct
    public void init() {
        this.openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    @GetMapping("/api/sessions/check")
    public ResponseEntity<Void> checkSession(@RequestParam("storeNo") String storeNo) {
        List<Session> activeSessions = openvidu.getActiveSessions();

        for (Session session : activeSessions) {
            if (session.getSessionId().equals(storeNo)) {
                log.info("Session already exists for storeNo: {}", storeNo);
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
            }
        }

        log.info("No session found for storeNo: {}", storeNo);
        return ResponseEntity.ok().build(); // 200 OK
    }

    @PostMapping("/api/sessions")
    public ResponseEntity<String> initializeSession(@RequestParam("storeNo") String storeNo)
            throws OpenViduJavaClientException, OpenViduHttpException {

        log.info("Initializing OpenVidu session:{}", storeNo);
        Session session = openvidu.createSession(new SessionProperties.Builder()
                .customSessionId(storeNo)
                .build());

        log.info("Created session with id {}", session);
        return new ResponseEntity<>(session.getSessionId(), HttpStatus.OK);
    }

    @PostMapping("/api/sessions/{sessionId}/connections")
    public ResponseEntity<String> createConnection(@PathVariable("sessionId") String sessionId,
                                                   @RequestBody(required = false) Map<String, Object> params)
            throws OpenViduJavaClientException, OpenViduHttpException {
        Session session = openvidu.getActiveSession(sessionId);
        if (session == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        ConnectionProperties properties = ConnectionProperties.fromJson(params).build();
        Connection connection = session.createConnection(properties);
        return new ResponseEntity<>(connection.getToken(), HttpStatus.OK);
    }

}

