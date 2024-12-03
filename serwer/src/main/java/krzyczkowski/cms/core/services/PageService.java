package krzyczkowski.cms.core.services;

import krzyczkowski.cms.core.models.Content.Content;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PageService {

    private final List<Content> contentTypes;

    @Autowired
    public PageService(List<Content> contentTypes) {
        this.contentTypes = contentTypes;
    }

    public Content createContent(String type, Map<String, String> parameters) {
        Content content = contentTypes.stream()
                .filter(c -> c.getType().equalsIgnoreCase(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid content type: " + type));
        return content;
    }
}
