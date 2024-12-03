package krzyczkowski.cms.core.models.Content;

import krzyczkowski.cms.core.models.WebsiteEntity;

import java.util.Map;

public interface Content {
    Long getId();
    String getType();
    String getTitle();
    String getDescription();
    Map<String, String> getSchema();
    WebsiteEntity getWebsite();
    void setWebsite(WebsiteEntity website);
}
