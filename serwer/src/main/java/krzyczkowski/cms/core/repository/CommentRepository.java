package krzyczkowski.cms.core.repository;

import jakarta.transaction.Transactional;
import krzyczkowski.cms.core.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment,Long> {
    void deleteAllByWebsiteAuthorNameAndWebsiteName(String username, String name);

    List<Comment> findByWebsiteNameAndContentId(String websiteName, Long contentId);

    List<Comment> findByWebsiteNameAndWebsiteAuthorNameAndAuthor(String websiteName, String websiteAuthor, String author);
}
