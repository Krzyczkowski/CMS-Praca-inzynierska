package krzyczkowski.cms.core.controller;

import krzyczkowski.cms.core.models.Content.Content;
import krzyczkowski.cms.core.models.Config;
import krzyczkowski.cms.core.models.UserEntity;
import krzyczkowski.cms.core.models.WebsiteEntity;
import krzyczkowski.cms.core.repository.UserRepository;
import krzyczkowski.cms.core.repository.WebsiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/content")
public class ContentController {

    @Autowired
    private Config config;
    private final List<Content> contentTypes;
    private final ApplicationContext applicationContext;
    private final Map<String, JpaRepository> repositories = new HashMap<>();
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private WebsiteRepository websiteRepository;

    @Autowired
    public ContentController(List<Content> contentTypes, ApplicationContext applicationContext) {
        this.contentTypes = contentTypes;
        this.applicationContext = applicationContext;

        for (Content contentType : contentTypes) {
            String repoBeanName = contentType.getType().toLowerCase() + "Repository"; // must be tolowerCase bc, Spring conventions
            JpaRepository repo = applicationContext.getBean(repoBeanName, JpaRepository.class);
            repositories.put(contentType.getType(), repo);
        }
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getAvailableContentTypes() {
        return ResponseEntity.ok(contentTypes.stream().map(Content::getType).collect(Collectors.toList()));
    }

    @GetMapping("/schema/{type}")
    public ResponseEntity<Map<String, String>> getContentSchema(@PathVariable String type) {
        Optional<Content> optionalContent = contentTypes.stream()
                .filter(content -> content.getType().equalsIgnoreCase(type))
                .findFirst();

        return optionalContent.map(Content::getSchema)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PostMapping("/update")
    public ResponseEntity<?> updateContent(@RequestParam Map<String, String> params, @RequestParam String websiteName) throws Exception {
        System.out.println("update");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        WebsiteEntity website = websiteRepository.findByOwnerAndName(user, websiteName);
        if (website == null) {
            return ResponseEntity.badRequest().body("Website not found");
        }
        String contentType = website.getSelectedContentType();
        JpaRepository repo = repositories.get(contentType);
        Class<?> clazz = Class.forName("krzyczkowski.cms.core.models.Content." + contentType);

        // Pobranie ID z params i konwersja na Long
        String idStr = params.get("id");
        if (idStr == null) {
            return ResponseEntity.badRequest().body("Missing content ID");
        }
        Long id = Long.parseLong(idStr);

        // Wyszukanie istniejącej treści
        Optional<?> existingContentOptional = repo.findById(id);
        if (!existingContentOptional.isPresent()) {
            return ResponseEntity.badRequest().body("Content not found");
        }
        Content existingContent = (Content) existingContentOptional.get();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            System.out.println("Key: " + entry.getKey() + ", Value: " + entry.getValue());
        }
        // Zaktualizowanie treści
        Map<String, String> schema = existingContent.getSchema();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            if (key.equals("id")) continue; // Pomijamy ID

            String value = entry.getValue();
            String methodName = "set" + key.substring(0, 1).toUpperCase() + key.substring(1);
            String expectedType = schema.get(key);
            if (expectedType == null) {
                continue;
            }

            Method method = clazz.getMethod(methodName, determineFieldType(expectedType));
            Object typedValue = convertValueToFieldType(value, expectedType);
            method.invoke(existingContent, typedValue);
        }
        System.out.println(existingContent);
        repo.save(existingContent);
        return ResponseEntity.ok(existingContent);
    }


    @PostMapping("/create")
    public ResponseEntity<?> createContent(
            @RequestParam String websiteName,
            @RequestParam String type,
            @RequestParam Map<String, String> params
    ) throws Exception {
        Optional<Content> optionalContent = contentTypes.stream()
                .filter(content -> content.getType().equalsIgnoreCase(type))
                .findFirst();
        System.out.println("create");
        if (optionalContent.isEmpty() || !repositories.containsKey(type)) {
            return ResponseEntity.badRequest().body("Unknown content type or missing repository");
        }

        JpaRepository repo = repositories.get(type);
        Class<?> clazz = Class.forName("krzyczkowski.cms.core.models.Content." + type);
        Content newContent = (Content) clazz.getConstructor().newInstance();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        WebsiteEntity website = websiteRepository.findByOwnerAndName(user, websiteName);
        if (website == null) {
            return ResponseEntity.badRequest().body("Website not found");
        }

        newContent.setWebsite(website);
        Map<String, String> schema = newContent.getSchema();

        // Mapowanie parametrow do nowo tworzonego obiektu
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            String methodName = "set" + key.substring(0, 1).toUpperCase() + key.substring(1);
            String expectedType = schema.get(key);
            if (expectedType == null) {
                continue;
            }

            try {
                Method method = clazz.getMethod(methodName, determineFieldType(expectedType));
                Object typedValue = convertValueToFieldType(value, expectedType);
                method.invoke(newContent, typedValue);
            } catch (Exception e) {
                System.err.println(e);
            }
        }

        repo.save(newContent);
        return ResponseEntity.ok(newContent);
    }

    private Class<?> determineFieldType(String fieldType) {
        switch (fieldType) {
            case "String":
                return String.class;
            case "Integer":
                return Integer.class;
            case "Long":
                return Long.class;
            case "Double":
                return Double.class;
            case "Boolean":
                return Boolean.class;
            case "byte[]":
                return byte[].class;
            default:
                return Object.class;
        }
    }

    private Object convertValueToFieldType(String value, String fieldType) {
        switch (fieldType) {
            case "String":
                return value;
            case "Integer":
                return Integer.valueOf(value);
            case "Long":
                return Long.valueOf(value);
            case "Double":
                return Double.valueOf(value);
            case "Boolean":
                return Boolean.valueOf(value);
            case "byte[]":
                if (value.startsWith("data:image/jpeg;base64,")) {
                    value = value.substring("data:image/jpeg;base64,".length());
                }
                return Base64.getDecoder().decode(value);
            default:
                return value;
        }
    }



    @GetMapping("/fetch/{type}/{render}")
    public String fetchContent(@PathVariable String type,@PathVariable String render, Model model) {
        if (!repositories.containsKey(type)) {
            return "Unknown content type";
        }
        if (!config.getThymeleafTemplates().get(type).contains(render)) {
            return "Unknown render type";
        }

        JpaRepository repository = repositories.get(type);
        List<Content> allContents = repository.findAll();

        model.addAttribute("allContents", allContents);
        model.addAttribute("type", type);

        return "content/" +type.toLowerCase()+"/"+ render;
    }


    @GetMapping("/{type}/{id}")
    public String getContent(@PathVariable String type, @PathVariable Long id, Model model) {
        if (!repositories.containsKey(type)) {
            return "unknownType";
        }

        JpaRepository repository = repositories.get(type);
        Optional<Content> contentOptional = repository.findById(id);

        Content foundContent = contentOptional.get();
        model.addAttribute("content", foundContent);

        if (contentOptional.isPresent()) {
            model.addAttribute("content", contentOptional.get());
            System.out.println("znaleziono" + contentOptional.get().getId());
            return "contentFragment";
        } else {
            System.out.println("nie znaleziono");
            return "notFound";
        }
    }  


    //get render types for specyfic contentType
    @GetMapping("/render/{type}")
    public ResponseEntity<?> fetchRenders(@PathVariable String type){
        if (!config.getThymeleafTemplates().containsKey(type)) {
            return ResponseEntity.badRequest().body("unknownType");
        }

        return ResponseEntity.ok(config.getThymeleafTemplates().get(type));
    }
    @GetMapping("/getAllContent/{websiteName}")
    public ResponseEntity<?> getAllContent(@PathVariable String websiteName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        WebsiteEntity website = websiteRepository.findByOwnerAndName(user, websiteName);
        if (website == null) {
            return ResponseEntity.badRequest().body("Website not found");
        }

        String selectedContentType = website.getSelectedContentType();
        if (selectedContentType == null || !repositories.containsKey(selectedContentType)) {
            return ResponseEntity.badRequest().body("Content type not set for website or unknown content type");
        }

        try {
            JpaRepository repo = repositories.get(selectedContentType);
            List<?> allContents = repo.findAll();

            Method getWebsiteMethod = Content.class.getMethod("getWebsite");
            List<Object> filteredContents = allContents.stream()
                    .filter(content -> {
                        try {
                            WebsiteEntity contentWebsite = (WebsiteEntity) getWebsiteMethod.invoke(content);
                            return contentWebsite != null && contentWebsite.equals(website);
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
    @PostMapping("/deleteContent/{websiteName}/{contentId}")
    public ResponseEntity<?> deleteContent(@PathVariable String websiteName, @PathVariable Long contentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        UserEntity user = userRepository.findByUsername(currentPrincipalName);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        WebsiteEntity website = websiteRepository.findByOwnerAndName(user, websiteName);
        if (website == null) {
            return ResponseEntity.badRequest().body("Website not found");
        }

        String contentType = website.getSelectedContentType();
        JpaRepository repo = repositories.get(contentType);

        if (repo == null) {
            return ResponseEntity.badRequest().body("Repository for the given content type not found");
        }

        Optional<?> contentOptional = repo.findById(contentId);
        if (!contentOptional.isPresent()) {
            return ResponseEntity.badRequest().body("Content not found");
        }

        try {
            repo.deleteById(contentId);
            return ResponseEntity.ok().body("Content deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("An error occurred while deleting the content");
        }
    }


}
