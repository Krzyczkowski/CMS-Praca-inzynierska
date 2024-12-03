package krzyczkowski.cms.core.controller;
import jakarta.transaction.Transactional;
import krzyczkowski.cms.core.models.Config;
import krzyczkowski.cms.core.models.Content.Content;
import krzyczkowski.cms.core.models.Page;
import krzyczkowski.cms.core.models.UserEntity;
import krzyczkowski.cms.core.models.WebsiteEntity;
import krzyczkowski.cms.core.payload.response.UserDTO;
import krzyczkowski.cms.core.repository.CommentRepository;
import krzyczkowski.cms.core.repository.PageRepository;
import krzyczkowski.cms.core.repository.UserRepository;
import krzyczkowski.cms.core.repository.WebsiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/websites")
public class WebsiteController {

    @Autowired
    private WebsiteRepository websiteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private Config config;


    @PostMapping("/create")
    public ResponseEntity<?> createWebsite(@RequestBody Map<String, String> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        // Sprawdzednie czy strona o podanej nazwie już istnieje dla użytkownika
        String newWebsiteName = payload.get("name");
        List<WebsiteEntity> existingWebsites = websiteRepository.findAllByOwnerAndName(user, newWebsiteName);

        if (!existingWebsites.isEmpty()) {
            return ResponseEntity.badRequest().body("Website with this name already exists for this user");
        }

        // Jeżeli strona o tej nazwie nie istnieje, utwórz nową
        WebsiteEntity newWebsite = new WebsiteEntity();
        newWebsite.setName(newWebsiteName);
        newWebsite.setOwner(user);
        newWebsite.setVisitedCount(0L);
        newWebsite.setAverageLoadingTime(0L);

        websiteRepository.save(newWebsite);

        return ResponseEntity.ok("Website created successfully!");
    }

    @GetMapping("/fetchAllWebsites")
    public ResponseEntity<?> fetchAllWebsites() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        try {
            List<WebsiteEntity> websites = user.getWebsiteList();
            return ResponseEntity.ok(websites);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }

    @GetMapping("/fetchWebsite/{websiteName}")
    public ResponseEntity<?> fetchWebsite(@PathVariable String websiteName) {
        System.out.println("fetchWebsite");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        try {
            List<WebsiteEntity> websites = user.getWebsiteList();

            Optional<WebsiteEntity> foundWebsite = websites.stream()
                    .filter(website -> website.getName().equals(websiteName))
                    .findFirst();

            if (foundWebsite.isPresent()) {
                return ResponseEntity.ok(foundWebsite.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Website not found");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }

    @PostMapping("/setContent")
    public ResponseEntity<?> setContent(@RequestBody Map<String, String> payload) {
        String selectedWebsiteName = payload.get("website");
        String selectedContentType = payload.get("content");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        UserEntity user = userRepository.findByUsername(currentPrincipalName);
        WebsiteEntity website = websiteRepository.findByOwnerAndName(user, selectedWebsiteName);
        Content content = config.getContentTypes().stream()
                .filter(e -> e.getType().equals(selectedContentType))
                .findFirst()
                .orElse(null);
        if(content== null){
            return ResponseEntity.badRequest().body("Content Type not found");
        }

        if (website == null) {
            return ResponseEntity.badRequest().body("Website not found");
        }
        website.setSelectedContentType(selectedContentType);
        websiteRepository.save(website);
        return ResponseEntity.ok("Content type updated successfully!");
    }



    @GetMapping("/fetchPages/{websiteName}")
    public ResponseEntity<?> fetchFullWebsite(@PathVariable String websiteName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        WebsiteEntity website = websiteRepository.findByOwnerAndName(user, websiteName);

        List<Page> pages = website.getPages();
        pages.forEach(e->{
            System.out.println(e);
        });
        if(pages.isEmpty()) System.out.println("empty");
        return ResponseEntity.ok(pages);
    }

    @GetMapping("/fetchContentType/{websiteName}")
    public ResponseEntity<?> fetchContentType(@PathVariable String websiteName){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        UserEntity user = userRepository.findByUsername(currentPrincipalName);
        WebsiteEntity website = websiteRepository.findByOwnerAndName(user, websiteName);

        if (website == null) {
            return ResponseEntity.badRequest().body("Website not found");
        }

        return ResponseEntity.ok(website.getSelectedContentType());
    }

    @GetMapping("/fetchWebsiteUsers")
    public ResponseEntity<?> fetchWebsiteUsers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        List<UserEntity> users = userRepository.findByWebsiteAuthor(user.getUsername());
        List<UserDTO> userDTOs = users.stream().map(userEntity -> new UserDTO(
                userEntity.getId(),
                userEntity.getUsername(),
                userEntity.getEmail(),
                userEntity.getWebsiteAuthor(),
                userEntity.getWebsiteName()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }
    @Transactional
    @PostMapping("/deleteWebsite")
    public ResponseEntity<?> deleteWebsite(@RequestBody Map<String, String> payload) {
        String selectedWebsiteName = payload.get("website");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        UserEntity user = userRepository.findByUsername(currentPrincipalName);
        WebsiteEntity website = websiteRepository.findByOwnerAndName(user, selectedWebsiteName);
        if (website == null) {
            return ResponseEntity.badRequest().body("Website not found");
        }

        //usuwanie komentarzy
        commentRepository.deleteAllByWebsiteAuthorNameAndWebsiteName(website.getOwner().getUsername(),website.getName());

        //usuwanie uuzytkownikow
        userRepository.deleteAllByWebsiteName(website.getName());

        //usuwanie contentu
        try {

            String selectedContentType = website.getSelectedContentType();
            if (selectedContentType != null && config.getRepositories().containsKey(selectedContentType)) {
                JpaRepository repo = config.getRepositories().get(selectedContentType);
                Method getWebsiteMethod = Content.class.getMethod("getWebsite");
                repo.findAll().forEach(content -> {
                    try {
                        WebsiteEntity contentWebsite = (WebsiteEntity) getWebsiteMethod.invoke(content);
                        if (contentWebsite.equals(website)) {
                            repo.delete(content);
                        }
                    } catch (IllegalAccessException | InvocationTargetException e) {
                        e.printStackTrace();
                    }
                });
            }

            websiteRepository.delete(website);
            return ResponseEntity.ok("Website deleted successfully!");

        } catch (NoSuchMethodException | SecurityException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("An error occurred while deleting contents");
        }
    }

}









