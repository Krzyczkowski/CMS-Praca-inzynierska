package krzyczkowski.cms.core.models;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Table(name = "Users")
@Entity
@Setter
@Getter
public class UserEntity implements UserDetails {

    @jakarta.persistence.Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @JsonManagedReference
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private List<WebsiteEntity> websiteList;



    @Column(nullable = false, unique = true)
    private String username;

    private String password;

    private String email;
    private String websiteAuthor;
    private String websiteName;

    public UserEntity(String username, String password, String email, Integer wiek, String websiteAuthor, String websiteName) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.websiteAuthor = websiteAuthor;
        this.websiteName = websiteName;
    }

    public UserEntity() {

    }


    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null;
    }



}