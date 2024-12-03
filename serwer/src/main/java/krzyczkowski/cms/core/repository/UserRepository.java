package krzyczkowski.cms.core.repository;

import krzyczkowski.cms.core.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    UserEntity findByUsername(String username);
    List<UserEntity> findByWebsiteAuthor(String websiteAuthor);

    boolean existsByUsername(String username);
    void deleteAllByWebsiteName(String websiteName);
    void deleteByUsername(String username);
}