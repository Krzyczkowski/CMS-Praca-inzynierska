package krzyczkowski.cms.core.controller;

import krzyczkowski.cms.core.payload.request.AuthenticationRequest;
import krzyczkowski.cms.core.payload.request.RegistrationRequest;
import krzyczkowski.cms.core.payload.response.AuthenticationResponse;
import krzyczkowski.cms.core.repository.CommentRepository;
import krzyczkowski.cms.core.repository.UserRepository;
import krzyczkowski.cms.core.security.JwtUtil;
import krzyczkowski.cms.core.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CommentRepository commentRepository;


    @PostMapping("/register")
    public ResponseEntity<?> registerUser (@RequestBody RegistrationRequest request) throws Exception {
        try {
            userDetailsService.addUser(request.getUsername(), request.getPassword(), request.getEmail(), request.getWiek(), request.getWebsiteAuthor(),request.getWebsiteName());
            return ResponseEntity.ok("User created successfully!");
        }
        catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) throws Exception {

        authenticate(authenticationRequest.getUsername(),authenticationRequest.getPassword());
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());
        final String token = jwtUtil.generateToken(userDetails);
        return ResponseEntity.ok(new AuthenticationResponse(token));
    }

    private void authenticate(String username, String password) throws Exception {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (DisabledException e) {
            throw new Exception("USER_DISABLED", e);
        } catch (BadCredentialsException e) {
            throw new Exception("INVALID_CREDENTIALS", e);
        }
    }


    @PostMapping("/user/delete/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(userId);

        return ResponseEntity.ok("User and all associated comments deleted successfully!");
    }

}