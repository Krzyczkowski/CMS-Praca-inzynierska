package krzyczkowski.cms.core.controller;

import krzyczkowski.cms.core.models.Comment;
import krzyczkowski.cms.core.models.UserEntity;
import krzyczkowski.cms.core.models.WebsiteEntity;
import krzyczkowski.cms.core.repository.CommentRepository;
import krzyczkowski.cms.core.repository.UserRepository;
import krzyczkowski.cms.core.repository.WebsiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/comment")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebsiteRepository websiteRepository;

    // Create a new comment
    @PostMapping("/add")
    public ResponseEntity<Comment> createComment(@RequestBody Map<String, String> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        Comment comment = new Comment();
        String text = payload.get("text");
        String contentId = payload.get("contentId");
        String websiteName = payload.get("websiteName");
        String websiteAuthor = payload.get("websiteAuthor");

        comment.setAuthor(currentPrincipalName);
        comment.setText(text);
        comment.setWebsiteAuthorName(websiteAuthor);
        comment.setWebsiteName(websiteName);
        comment.setContentId(Long.parseLong(contentId));
        commentRepository.save(comment);

        return ResponseEntity.ok(comment);
    }


    // Fetch all comments
    @GetMapping("/all/{websiteName}/{contentId}")
    public ResponseEntity<List<Comment>> getCommentsByWebsiteAndContent(@PathVariable String websiteName, @PathVariable Long contentId) {
        List<Comment> comments = commentRepository.findByWebsiteNameAndContentId(websiteName, contentId);
        return ResponseEntity.ok(comments);
    }
    // Fetch all comments for each website
    @GetMapping("/all/{websiteAuthor}/{websiteName}/{author}")
    public ResponseEntity<List<Comment>> getCommentsByWebsiteAndAuthorAndUser(@PathVariable String websiteAuthor, @PathVariable String websiteName, @PathVariable String author) {
        List<Comment> comments = commentRepository.findByWebsiteNameAndWebsiteAuthorNameAndAuthor(websiteName,websiteAuthor, author);
        System.out.println("znaleziono komentarze:"+comments);
        return ResponseEntity.ok(comments);
    }


    // Delete a comment
    @PostMapping("/delete/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        System.out.println("eeez");
        Optional<Comment> commentOptional = commentRepository.findById(id);
        if (commentOptional.isPresent()) {
            System.out.println(commentOptional.get());
            commentRepository.delete(commentOptional.get());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}