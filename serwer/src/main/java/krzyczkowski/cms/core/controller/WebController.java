package krzyczkowski.cms.core.controller;

import krzyczkowski.cms.core.models.UserEntity;
import krzyczkowski.cms.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class WebController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/userDetails")
    public ResponseEntity<?> fetchUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not authenticated.");
        }

        String currentPrincipalName = authentication.getName();
        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        return ResponseEntity.ok(user);
    }

}
