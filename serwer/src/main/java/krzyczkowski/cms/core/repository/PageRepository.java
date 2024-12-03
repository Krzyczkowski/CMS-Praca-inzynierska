package krzyczkowski.cms.core.repository;

import jakarta.transaction.Transactional;
import krzyczkowski.cms.core.models.Page;
import krzyczkowski.cms.core.models.WebsiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


public interface PageRepository extends JpaRepository<Page, Long> {
    @Transactional
    @Modifying
    @Query(value = "DELETE FROM Page WHERE name = :pageName", nativeQuery = true)
    void deletePageByName(@Param("pageName") String pageName);
    Boolean existsByName(String name);
}
