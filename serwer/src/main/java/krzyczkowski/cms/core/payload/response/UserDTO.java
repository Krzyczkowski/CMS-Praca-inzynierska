package krzyczkowski.cms.core.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String websiteAuthor;
    private String websiteName;

    public UserDTO(Long id, String username, String email, String websiteAuthor, String websiteName) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.websiteAuthor = websiteAuthor;
        this.websiteName = websiteName;
    }
}