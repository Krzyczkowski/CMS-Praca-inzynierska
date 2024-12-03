package krzyczkowski.cms.core.services;

import krzyczkowski.cms.core.models.Role;
import krzyczkowski.cms.core.models.UserEntity;
import krzyczkowski.cms.core.repository.UserRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Getter
@Setter
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserDetailsServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), new ArrayList<>());
    }


    public void addUser(String username, String password, String email, Integer wiek, String websiteNameUser, String websiteName) {
        if (userRepository.findByUsername(username) != null) {
            throw new RuntimeException("Użytkownik o podanej nazwie użytkownika już istnieje");
        }
        UserEntity userEntity = new UserEntity(username, passwordEncoder.encode(password), email, wiek, websiteNameUser, websiteName);
        userRepository.save(userEntity);
    }

}