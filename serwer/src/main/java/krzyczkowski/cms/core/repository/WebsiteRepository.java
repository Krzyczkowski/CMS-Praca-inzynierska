package krzyczkowski.cms.core.repository;
import krzyczkowski.cms.core.models.Page;
import krzyczkowski.cms.core.models.UserEntity;
import krzyczkowski.cms.core.models.WebsiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WebsiteRepository extends JpaRepository<WebsiteEntity, Long> {
    List<WebsiteEntity> findAllByOwnerAndName(UserEntity user, String newWebsiteName);
    WebsiteEntity findByName(String name);
    WebsiteEntity findByOwnerAndName(UserEntity user, String websiteName);
}
