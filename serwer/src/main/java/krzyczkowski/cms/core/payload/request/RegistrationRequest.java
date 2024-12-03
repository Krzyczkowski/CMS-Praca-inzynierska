package krzyczkowski.cms.core.payload.request;

import krzyczkowski.cms.core.models.Role;
import lombok.Data;

@Data
public class RegistrationRequest {
    private String username;
    private String password;
    private String email;
    private Integer wiek;
    private String websiteAuthor;
    private String WebsiteName;
}
