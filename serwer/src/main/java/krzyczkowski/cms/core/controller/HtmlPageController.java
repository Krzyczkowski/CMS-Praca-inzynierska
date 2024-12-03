package krzyczkowski.cms.core.controller;

import krzyczkowski.cms.core.models.Config;
import krzyczkowski.cms.core.models.Content.Content;
import krzyczkowski.cms.core.models.LoadTimeData;
import krzyczkowski.cms.core.models.UserEntity;
import krzyczkowski.cms.core.models.WebsiteEntity;
import krzyczkowski.cms.core.repository.UserRepository;
import krzyczkowski.cms.core.repository.WebsiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@RestController
public class HtmlPageController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private WebsiteRepository websiteRepository;
    @Autowired
    private Config config;
    private final ConcurrentHashMap<String, AtomicLong> visitCounters = new ConcurrentHashMap<>();
    private final Map<String, List<Long>> loadingTimes = new ConcurrentHashMap<>();


    @GetMapping("/{username}/{websiteName}/{pageName}.html")
    public ResponseEntity<Resource> servePage(@PathVariable String username,
                                              @PathVariable String websiteName,
                                              @PathVariable String pageName) {

        ResponseEntity<Resource> response;
        try {
            Path rootLocation = Paths.get("websites");
            Path file = rootLocation.resolve(Paths.get(username, websiteName,"pages", pageName + ".html"));
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                response =ResponseEntity.ok().body(resource);
            } else {
                response = ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response = ResponseEntity.badRequest().build();
        }
        visitCounters.computeIfAbsent(websiteName, k -> new AtomicLong(0)).incrementAndGet();

        return response;
    }

    @GetMapping("/public/content/{username}/{websiteName}")
    public ResponseEntity<?> serveContent(@PathVariable String username, @PathVariable String websiteName) {
        UserEntity user = userRepository.findByUsername(username);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        WebsiteEntity website = websiteRepository.findByOwnerAndName(user, websiteName);
        if (website == null) {
            return ResponseEntity.badRequest().body("Website not found");
        }

        String selectedContentType = website.getSelectedContentType();
        System.out.println(selectedContentType);
        if (selectedContentType == null || !config.getRepositories().containsKey(selectedContentType)) {
            return ResponseEntity.badRequest().body("Content type not set for website or unknown content type");
        }

        try {
            JpaRepository repo = config.getRepositories().get(selectedContentType);
            List<?> allContents = repo.findAll();

            Method getWebsiteMethod = Content.class.getMethod("getWebsite");
            List<Object> filteredContents = allContents.stream()
                    .filter(content -> {
                        try {
                            WebsiteEntity contentWebsite = (WebsiteEntity) getWebsiteMethod.invoke(content);
                            return contentWebsite.equals(website);
                        } catch (IllegalAccessException | InvocationTargetException e) {
                            e.printStackTrace();
                            return false;
                        }
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(filteredContents);
        } catch (NoSuchMethodException | SecurityException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("An error occurred while fetching contents");
        }
    }

    @Scheduled(fixedRate = 600000)
    public void persistVisitCounts() {
        visitCounters.forEach((websiteName, counter) -> {
            WebsiteEntity website = websiteRepository.findByName(websiteName);
            if (website != null) {
                if(website.getVisitedCount() ==null) website.setVisitedCount(0L);
                website.setVisitedCount(website.getVisitedCount() + counter.getAndSet(0));
                websiteRepository.save(website);
            }
        });
    }
    @Scheduled(fixedRate = 600000) // Co minute
    public void updateAverageLoadingTimes() {
        loadingTimes.forEach((websiteName, times) -> {
            if (!times.isEmpty()) {
                long sum = times.stream().mapToLong(Long::longValue).sum();
                long average = sum / times.size();

                WebsiteEntity website = websiteRepository.findByName(websiteName);
                if (website != null) {
                    website.setAverageLoadingTime(average);
                    websiteRepository.save(website);
                }
                times.clear();
            }
        });
    }
    @PostMapping("/public/report-loading-time")
    public ResponseEntity<?> reportLoadingTime(@RequestBody LoadTimeData loadTimeData) {
        System.out.println(loadTimeData);
        //sprawdzenie klucza (nazwy strony) (k) -> tworzenie nowego wpisu -> dodanie wartości do listy
        loadingTimes.computeIfAbsent(loadTimeData.getWebsiteName(), k -> new ArrayList<>()).add(loadTimeData.getLoadTime());
        System.out.println(loadTimeData.getLoadTime());
        return ResponseEntity.ok().build();
    }

}
