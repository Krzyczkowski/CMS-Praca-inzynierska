package krzyczkowski.cms.core.repository.Content;

import jakarta.transaction.Transactional;
import krzyczkowski.cms.core.models.Content.Article;
import krzyczkowski.cms.core.models.WebsiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends ContentRepository<Article> {
}

