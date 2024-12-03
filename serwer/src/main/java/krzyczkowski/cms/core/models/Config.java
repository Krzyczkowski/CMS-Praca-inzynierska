package krzyczkowski.cms.core.models;

import krzyczkowski.cms.core.models.Content.Content;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Configuration
@EnableScheduling
@Component
public class Config {
    private final List<Content> contentTypes;
    private final ApplicationContext applicationContext;
    private final Map<String, JpaRepository> repositories = new HashMap<>();
    private final ResourceLoader resourceLoader;
    private final HashMap<String, List<String>> thymeleafTemplates = new HashMap<>();
    private final HashMap<String, List<String>> websiteTemplates = new HashMap<>();

    @Autowired
    public Config(List<Content> contentTypes, ApplicationContext applicationContext, ResourceLoader resourceLoader) {
        this.contentTypes = contentTypes;
        this.applicationContext = applicationContext;
        this.resourceLoader = resourceLoader;

        for (Content contentType : this.contentTypes) {
            String repoBeanName = contentType.getType().toLowerCase() + "Repository";
            JpaRepository repo = applicationContext.getBean(repoBeanName, JpaRepository.class);
            repositories.put(contentType.getType(), repo);
        }

        for (Content contentType : this.contentTypes) {
            String type = contentType.getType();
            List<String> listTemplatesForType = getThymeleafTemplatesForType("templates/content/" + type + "/");
            thymeleafTemplates.put(type, listTemplatesForType);
        }

        loadWebsiteTemplates("templates/website/");
    }

    private void loadWebsiteTemplates(String basePath) {
        String[] sections = {"footer", "header", "main", "nav"};
        for (String section : sections) {
            List<String> templatesForSection = getThymeleafTemplatesForType(basePath + section + "/");
            websiteTemplates.put(section, templatesForSection);
        }
    }

    private List<String> getThymeleafTemplatesForType(String path) {
        List<String> templateNames = new ArrayList<>();
        try {
            Resource[] resources = ResourcePatternUtils.getResourcePatternResolver(resourceLoader)
                    .getResources("classpath:/" + path + "*.html");
            for (Resource resource : resources) {
                String fileName = resource.getFilename();
                if (fileName != null) {
                    templateNames.add(fileName);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return templateNames;
    }

    public List<Content> getContentTypes() {
        return contentTypes;
    }

    public Map<String, JpaRepository> getRepositories() {
        return repositories;
    }

    public HashMap<String, List<String>> getThymeleafTemplates() {
        return thymeleafTemplates;
    }

    public HashMap<String, List<String>> getWebsiteTemplates() {
        return websiteTemplates;
    }
}
