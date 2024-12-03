package krzyczkowski.cms.core.controller;

import krzyczkowski.cms.core.models.*;
import krzyczkowski.cms.core.repository.PageRepository;
import krzyczkowski.cms.core.repository.UserRepository;
import krzyczkowski.cms.core.repository.WebsiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pages")
public class PageController {
    @Autowired
    private ResourceLoader resourceLoader;

    private final Path rootLocation = Paths.get("websites");

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebsiteRepository websiteRepository;

    @GetMapping
    public List<Page> getAllPages() {
        return pageRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Page> getPageById(@PathVariable Long id) {
        return pageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Page> createPage(@RequestBody Page page, @RequestParam Long websiteId) {
        Optional<WebsiteEntity> websiteOptional = websiteRepository.findById(websiteId);
        if (!websiteOptional.isPresent()) {
            return ResponseEntity.badRequest().body(null);
        }

        page.setWebsite(websiteOptional.get());
        return ResponseEntity.ok(pageRepository.save(page));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Page> updatePage(@PathVariable Long id, @RequestBody Page updatedPage) {
        if (!pageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        updatedPage.setId(id);
        return ResponseEntity.ok(pageRepository.save(updatedPage));
    }

    @PostMapping("/delete/{websiteName}/{pageName}")
    public ResponseEntity<?> deletePage(@PathVariable String websiteName, @PathVariable String pageName) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            List<WebsiteEntity> existingWebsites = websiteRepository.findAllByOwnerAndName(user, websiteName);
            if (existingWebsites.isEmpty()) {
                return ResponseEntity.badRequest().body("Website with this name doesn't exist for this user!");
            }

            WebsiteEntity website = existingWebsites.get(0);
            Optional<Page> pageToDelete = website.getPages().stream()
                    .filter(page -> page.getName().equals(pageName))
                    .findFirst();

            if (pageToDelete.isPresent()) {
                Page page = pageToDelete.get();

                // Usunięcie pliku ze strony
                Path pageFile = rootLocation.resolve(
                                Paths.get(username, websiteName, "pages", pageName + ".html"))
                        .normalize().toAbsolutePath();
                if (pageFile.toFile().exists()) {
                    Files.delete(pageFile);
                }
                Page managedPage = pageRepository.findById(page.getId()).orElse(null);
                if (managedPage != null) {
                    pageRepository.deletePageByName(managedPage.getName());
                    return ResponseEntity.ok("Page deleted successfully");
                }

            }
            return ResponseEntity.badRequest().body("Page with the specified name does not exist");

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Could not delete the page");
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPage(@RequestBody Map<String, String> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        // Sprawdzednie czy strona o podanej nazwie istnieje dla użytkownika
        String websiteName = payload.get("website");
        String pageName = payload.get("name");
        String pageTitle = payload.get("title");
        List<WebsiteEntity> existingWebsites = websiteRepository.findAllByOwnerAndName(user, websiteName);

        if (existingWebsites.isEmpty()) {
            return ResponseEntity.badRequest().body("Website with this name doesn't exist for this user!");
        }
        Page newPage = new Page();
        Optional<WebsiteEntity> firstMatchingWebsite = existingWebsites.stream().filter(website-> websiteName.equals(website.getName())).findFirst();
        firstMatchingWebsite.ifPresent(newPage::setWebsite);
        newPage.setTitle(pageTitle);
        newPage.setName(pageName);
        pageRepository.save(newPage);
        return ResponseEntity.ok().build();

    }
    @PostMapping("/updatePage")
    public ResponseEntity<?> updatePage(@RequestBody Map<String, String> payload) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            String websiteName = payload.get("websiteName");
            String oldPageName = payload.get("oldPageName");
            String newPageName = payload.get("newPageName");
            String pageTitle = payload.get("pageTitle");

            System.out.println(websiteName + " " + username);
            List<WebsiteEntity> existingWebsites = websiteRepository.findAllByOwnerAndName(user, websiteName);

            if (existingWebsites.isEmpty()) {
                return ResponseEntity.badRequest().body("Website with this name doesn't exist for this user!");
            }
            // Zmiana nazwy pliku na dysku
            Path oldFile = rootLocation.resolve(
                            Paths.get(username, websiteName, "pages", oldPageName + ".html"))
                    .normalize().toAbsolutePath();
            if (!oldFile.toFile().exists()) {
                return ResponseEntity.badRequest().body("Old file does not exist");
            }
            Path newFile = rootLocation.resolve(
                            Paths.get(username, websiteName, "pages", newPageName + ".html"))
                    .normalize().toAbsolutePath();
            Files.move(oldFile, newFile, StandardCopyOption.REPLACE_EXISTING);

            List<Page> pages = existingWebsites.get(0).getPages();
            Optional<Page> pageToUpdate = pages.stream()
                    .filter(page -> page.getName().equals(oldPageName))
                    .findFirst();

            if (pageToUpdate.isPresent()) {
                Page updatedPage = pageToUpdate.get();
                updatedPage.setName(newPageName);  // Aktualizacja nazwy strony
                updatedPage.setTitle(pageTitle);    // Aktualizacja tytułu strony, jeśli potrzebne

                pageRepository.save(updatedPage);  // Zapisanie zmian w bazie danych
                return ResponseEntity.ok("Page updated successfully");
            } else {
                return ResponseEntity.badRequest().body("Page with the specified name does not exist");
            }

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Could not update the page");
        }
    }


    @PostMapping("/upload")
    public ResponseEntity<?> uploadPage(@RequestParam("file") MultipartFile file,
                                        @RequestParam("websiteName") String websiteName,
                                        @RequestParam("pageName") String pageName) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            // zapis pliku w odpowiednim katalogu
            Path destinationFile = rootLocation.resolve(
                            Paths.get(username, websiteName, "pages", pageName + ".html"))
                    .normalize().toAbsolutePath();

            if (!destinationFile.getParent().toFile().exists()) {
                destinationFile.getParent().toFile().mkdirs(); //jeśli nie istnieje tworzy katalog
            }

            file.transferTo(destinationFile);
            System.out.println("ok");
            return ResponseEntity.ok("File uploaded successfully!");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Could not upload the file");
        }
    }

    @GetMapping("/download/{websiteName}/{pageName}")
    public ResponseEntity<?> downloadPage(
                                                 @PathVariable String websiteName,
                                                 @PathVariable String pageName) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentPrincipalName = authentication.getName();

            UserEntity user = userRepository.findByUsername(currentPrincipalName);

            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            Path file = rootLocation.resolve(Paths.get( currentPrincipalName , websiteName, "pages", pageName + ".html"));
            Resource resource = resourceLoader.getResource(file.toUri().toString());
            if(!resource.exists()) System.out.println("nie istnieje taki plik");
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }


    @PostMapping("/clone/{websiteName}/{pageName}")
    public ResponseEntity<?> clonePage(@PathVariable String websiteName, @PathVariable String pageName) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            List<WebsiteEntity> existingWebsites = websiteRepository.findAllByOwnerAndName(user, websiteName);
            if (existingWebsites.isEmpty()) {
                return ResponseEntity.badRequest().body("Website with this name doesn't exist for this user!");
            }

            WebsiteEntity website = existingWebsites.get(0);
            Optional<Page> originalPage = website.getPages().stream()
                    .filter(page -> page.getName().equals(pageName))
                    .findFirst();

            if (!originalPage.isPresent()) {
                return ResponseEntity.badRequest().body("Original page not found");
            }

            String cloneName = generateUniqueCloneName(pageName);
            Page clonePage = new Page();
            clonePage.setWebsite(originalPage.get().getWebsite()); ;
            clonePage.setName(generateUniqueCloneName(originalPage.get().getName()));
            clonePage.setTitle(originalPage.get().getTitle());

            pageRepository.save(clonePage);
            Path sourceFile = rootLocation.resolve(Paths.get(username, websiteName, "pages", pageName + ".html"))
                    .normalize().toAbsolutePath();
            Path targetFile = rootLocation.resolve(Paths.get(username, websiteName, "pages", cloneName + ".html"))
                    .normalize().toAbsolutePath();

            Files.copy(sourceFile, targetFile, StandardCopyOption.REPLACE_EXISTING);


            return ResponseEntity.ok("Page cloned successfully as: " + cloneName);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Could not clone the page");
        }
    }
    // do klonowania strony:  tworzy kopię strony o nazwie takiej samej z dodatkowym sufiksem jako liczba
    private String generateUniqueCloneName(String baseName) {
        int suffix = 1;
        String cloneName;
        while (true) {
            cloneName = baseName + suffix;
            if (!pageRepository.existsByName(cloneName)) {
                break;
            }
            suffix++;
        }
        return cloneName;
    }

}
