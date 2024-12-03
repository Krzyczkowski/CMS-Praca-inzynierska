package krzyczkowski.cms.core.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import krzyczkowski.cms.core.models.Content.Article;
import krzyczkowski.cms.core.models.Content.Content;
import krzyczkowski.cms.core.models.Content.Product;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(
        uniqueConstraints =
        @UniqueConstraint(columnNames = {"name", "user_id"})
)
public class WebsiteEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity owner;

    @Column(name = "selected_content_type")
    private String selectedContentType;

    private Long visitedCount;
    private Long averageLoadingTime;

    @JsonBackReference
    @OneToMany(mappedBy = "website", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Page> pages;

}
