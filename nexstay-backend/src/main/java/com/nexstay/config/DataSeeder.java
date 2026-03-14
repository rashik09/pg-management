package com.nexstay.config;

import com.nexstay.entity.Property;
import com.nexstay.entity.User;
import com.nexstay.repository.PropertyRepository;
import com.nexstay.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedDatabase(UserRepository userRepo, PropertyRepository propRepo, PasswordEncoder encoder) {
        return args -> {
            ObjectMapper mapper = new ObjectMapper();

            // Seed admin user
            if (userRepo.count() == 0) {
                User admin = new User("Admin User", "admin@nexstay.com", encoder.encode("password123"), "owner");
                userRepo.save(admin);
                System.out.println("[NexStay] Seeded admin user: admin@nexstay.com / password123");
            }

            // Seed properties
            if (propRepo.count() == 0) {
                String desc = "A premium living space designed for comfort and modern aesthetics. Steps away from local transit and prime shopping centers. Enjoy high-speed internet, dedicated housekeeping, and secure biometric access round the clock.";
                String gl1 = mapper.writeValueAsString(Arrays.asList(
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
                    "https://images.unsplash.com/photo-1497366216551-7008101aed46?w=800"
                ));
                String gl2 = mapper.writeValueAsString(Arrays.asList(
                    "https://images.unsplash.com/photo-1598928506311-c55dd580231aa?w=800",
                    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
                    "https://images.unsplash.com/photo-1502672260266-1c1de2d15582?w=800"
                ));

                List<Property> seeds = Arrays.asList(
                    createPg("Sunshine Residency PG", "Koramangala, Bangalore", "Bangalore", 8500, "Boys",
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        5, "2 Sharing", "Attached", false, true, true, desc, gl1, true),
                    createPg("Crystal Clear PG for Girls", "HSR Layout, Bangalore", "Bangalore", 9200, "Girls",
                        "https://images.unsplash.com/photo-1598928506311-c55dd580231aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        2, "3 Sharing", "Common", false, true, true, desc, gl2, true),
                    createPg("Metro View Coliving", "Andheri West, Mumbai", "Mumbai", 12000, "Co-ed",
                        "https://images.unsplash.com/photo-1502672260266-1c1de2d15582?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        0, "1 Sharing", "Attached", true, true, true, desc, gl1, false),
                    createPg("Greenwood Boys Hostel", "Bandra, Mumbai", "Mumbai", 15000, "Boys",
                        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        8, "2 Sharing", "Attached", true, true, true, desc, gl1, true),
                    createPg("Whitehouse PG", "Gachibowli, Hyderabad", "Hyderabad", 7500, "Girls",
                        "https://images.unsplash.com/photo-1513694203232-723a1a0df91b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        12, "4 Sharing", "Common", false, true, false, desc, gl2, false),
                    createPg("Tech-Hub Stay", "Whitefield, Bangalore", "Bangalore", 10500, "Co-ed",
                        "https://images.unsplash.com/photo-1497366216551-7008101aed46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        1, "1 Sharing", "Attached", true, true, true, desc, gl1, true)
                );

                propRepo.saveAll(seeds);
                System.out.println("[NexStay] Seeded " + seeds.size() + " demo properties.");
            }
        };
    }

    private Property createPg(String title, String location, String city, int price, String type,
                              String image, int vacancies, String sharingType, String bathroomType,
                              boolean ac, boolean wifi, boolean hotWater, String desc, String gallery, boolean featured) {
        Property p = new Property();
        p.setTitle(title);
        p.setLocation(location);
        p.setCity(city);
        p.setPrice(price);
        p.setType(type);
        p.setImage(image);
        p.setVacancies(vacancies);
        p.setSharingType(sharingType);
        p.setBathroomType(bathroomType);
        p.setHasAc(ac);
        p.setHasWifi(wifi);
        p.setHasHotWater(hotWater);
        p.setDescription(desc);
        p.setGallery(gallery);
        p.setFeatured(featured);
        p.setStatus("active");
        return p;
    }
}
