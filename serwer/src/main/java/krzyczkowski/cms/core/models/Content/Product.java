package krzyczkowski.cms.core.models.Content;

import jakarta.persistence.*;
import krzyczkowski.cms.core.models.WebsiteEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@Entity
@TypeAlias("Product")
@Component
public class Product implements Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private Long price;

    @ManyToOne
    @JoinColumn(name = "website_name")
    private WebsiteEntity website;


    @Override
    public Long getId() {
        return id;
    }

    @Override
    public String getType() {
        return "Product";
    }

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public String getDescription() {
        return description;
    }

    @Lob
    @Column(columnDefinition = "MEDIUMBLOB")
    private byte[] image;

    @Override
    public Map<String, String> getSchema() {
        Map<String, String> schema = new HashMap<>();
        schema.put("title", "String");
        schema.put("description", "String");
        schema.put("price", "Long");
        schema.put("image", "byte[]");
        return schema;
    }
}
