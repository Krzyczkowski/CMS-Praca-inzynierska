package krzyczkowski.cms.core.models.Content;
import jakarta.persistence.*;
import krzyczkowski.cms.core.models.WebsiteEntity;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@Entity
@TypeAlias("Article")
@ToString
@Component
public class Article implements Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "website_name")
    private WebsiteEntity website;

    private String title;
    private String description;
    @Transient
    private static Map<String,String> schema;

    @Override
    public String getType() {
        return "Article";
    }


    @Override
    public Map<String, String> getSchema() {
        if (schema == null) {
            schema = new HashMap<>();
            schema.put("title", "String");
            schema.put("description", "String");
        }
        return schema;
    }
}


