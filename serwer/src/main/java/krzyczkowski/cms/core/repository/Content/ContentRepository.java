package krzyczkowski.cms.core.repository.Content;

import krzyczkowski.cms.core.models.Content.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface ContentRepository<T extends Content> extends JpaRepository<T, Long> {
}