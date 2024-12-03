package krzyczkowski.cms.core.models;

import krzyczkowski.cms.core.models.Content.Content;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Getter
@Setter
public class Website {
    private String name;
    public List<Page> pages;

    public Website() {}

    public Website(String name, List<Page> pages) {
        this.name = name;
        this.pages = pages;
    }
}