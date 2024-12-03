package krzyczkowski.cms.core.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Table(name = "Comment")
@Entity
@Setter
@Getter
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String text;
    private String author;
    private String websiteName;
    private String websiteAuthorName;
    private Long contentId;

}