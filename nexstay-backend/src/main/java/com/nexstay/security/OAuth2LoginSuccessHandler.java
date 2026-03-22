package com.nexstay.security;

import com.nexstay.entity.User;
import com.nexstay.repository.UserRepository;
import com.nexstay.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole("user"); // Default OAuth role
            user.setPasswordHash("OAUTH2_USER"); 
            user = userRepository.save(user);
        } else {
            user = existingUser.get();
        }

        String token = jwtService.generateToken(user.getId(), user.getRole());
        
        // Redirect to Frontend React app with Token Parameters
        response.sendRedirect("/login?token=" + token + "&name=" + java.net.URLEncoder.encode(user.getName(), "UTF-8") + "&role=" + user.getRole() + "&email=" + user.getEmail());
    }
}
